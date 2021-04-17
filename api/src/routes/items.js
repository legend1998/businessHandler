const express = require("express");

const env = require("../../config/environment.js");

const db = require("../helpers/database");
const { itemTypes } = require("../helpers/enums.js");
const { formatTable, formatTableRow, log } = require("../helpers/utils.js");
const { authenticate } = require("../helpers/auth-jwt.js");
const {
  checkRequiredPOST,
  hasPrivilegeLevel,
} = require("../helpers/middleware.js");
const {
  isValidName,
  isValidString,
  isValidEnum,
  isValidURL,
  isValidPrice,
} = require("../helpers/validation.js");
const { getBusinessItems } = require("../helpers/queries.js");
const router = express();

// Authenticate ALL routes in this controller
router.use(authenticate);
router.use(hasPrivilegeLevel("admin"));

/**
 * Used to retrieve all the modifiable items by the requesting user.
 */
router.get("/", async (req, res) => {
  const items = await getBusinessItems(req.user.business_id);
  res.json(items);
});

/**
 * Used to create a new item. Only admin users may create new items.
 */
router.post(
  "/create",
  checkRequiredPOST(
    "name",
    "description",
    "type",
    "image_url",
    "price",
    "variant_groups"
  ),
  async (req, res) => {
    // Data from request
    const business_id = req.user.business_id;
    const {
      name,
      description,
      type,
      image_url,
      price,
      variant_groups,
    } = req.body;

    // Validate fields
    if (
      !isValidName(name) ||
      !isValidString(description, 500) ||
      !isValidEnum(type, itemTypes) ||
      !isValidURL(image_url) ||
      !isValidPrice(price) ||
      !Array.isArray(variant_groups)
    )
      return res.status(HTTP_BAD_REQUEST).send("invalid_fields");

    const [item] = await db("erp.item")
      .insert({
        business_id,
        name,
        description,
        type,
        image_url,
        price,
      })
      .returning("*");

    // Insert variant groups
    const groupsToInsert = variant_groups.map((g) => ({
      item_id: item.id,
      name: g.name,
      description: g.description,
    }));
    if (groupsToInsert.length > 0) {
      const variantGroups = await db("erp.variant_group")
        .insert(groupsToInsert)
        .returning("*");
      formatTable(variantGroups);

      // Insert variants
      const variantsToInsert = variantGroups.reduce(
        (accumulator, group, index) => [
          ...accumulator,
          ...variant_groups[index].variants.map((v) => ({
            variant_group_id: group.id,
            name: v.name,
          })),
        ],
        []
      );
      if (variantsToInsert.length > 0) {
        const variants = await db("erp.variant")
          .insert(variantsToInsert)
          .returning("*");
        formatTable(variants);
        variantGroups.forEach(
          (g) =>
            (g.variants = variants.filter((v) => v.variant_group_id === g.id))
        );
      }

      item.variant_groups = variantGroups;
    } else {
      item.variant_groups = [];
    }

    res.json(formatTableRow(item));

    await log(`Created item ${item.id}`, "activity", req.user.business_id);
  }
);

/**
 * Used to modify an existing item. Only admin users may modify items.
 */
router.put(
  "/:item_id",
  checkRequiredPOST(
    "name",
    "description",
    "type",
    "image_url",
    "price",
    "variant_groups"
  ),
  async (req, res) => {
    // Data from body
    const {
      name,
      description,
      type,
      image_url,
      price,
      variant_groups,
    } = req.body;

    // Validate fields
    if (
      !isValidName(name) ||
      !isValidString(description, 500) ||
      !isValidEnum(type, itemTypes) ||
      !isValidURL(image_url) ||
      !isValidPrice(price) ||
      !Array.isArray(variant_groups)
    )
      return res.status(HTTP_BAD_REQUEST).send("invalid_fields");

    // Check if target item exists
    let targetItem = await db("erp.item")
      .where("deleted", false)
      .where("id", req.params.item_id)
      .where("business_id", req.user.business_id)
      .first();
    if (!targetItem) return res.status(HTTP_BAD_REQUEST).send("no_such_item");

    // Update target item information
    [targetItem] = await db("erp.item")
      .where("id", targetItem.id)
      .update({
        name,
        description,
        type,
        image_url,
        price,
      })
      .returning("*");

    // Remove variant groups that do not exist anymore
    await db("erp.variant_group")
      .where("item_id", targetItem.id)
      .whereNotIn(
        "id",
        variant_groups.map((g) => g.id).filter((id) => !!id)
      )
      .update({ deleted: true });

    // Add new variant groups
    const newVariantGroups = await db("erp.variant_group")
      .insert(
        variant_groups
          .filter((g) => !g.id)
          .map((g) => ({
            item_id: targetItem.id,
            name: g.name,
            description: g.description,
          }))
      )
      .returning("*");

    // Add information to new variant groups
    variant_groups
      .filter((g) => !g.id)
      .forEach((g, index) => Object.assign(g, newVariantGroups[index]));

    // Remove variants that do not exist anymore
    await db("erp.variant")
      .whereIn(
        "variant_group_id",
        variant_groups.map((g) => g.id)
      )
      .whereNotIn(
        "id",
        variant_groups
          .reduce(
            (accumulator, group) => [...accumulator, ...group.variants],
            []
          )
          .map((v) => v.id)
          .filter((id) => !!id)
      )
      .update({ deleted: true });

    // Add new variants
    const newVariants = await db("erp.variant")
      .insert(
        variant_groups.reduce(
          (accumulator, group) => [
            ...accumulator,
            ...group.variants
              .filter((v) => !v.id)
              .map((v) => ({ variant_group_id: group.id, name: v.name })),
          ],
          []
        )
      )
      .returning("*");

    // Add information to new variants
    variant_groups
      .reduce(
        (accumulator, group) => [
          ...accumulator,
          ...group.variants.filter((v) => !v.id),
        ],
        []
      )
      .forEach((v, index) => Object.assign(v, newVariants[index]));

    // Format data
    formatTable(variant_groups);
    variant_groups.forEach((g) => formatTable(g.variants));

    // Add reconstructed variant groups to target item
    targetItem.variant_groups = variant_groups;

    // Return item object
    res.json(formatTableRow(targetItem));

    await log(
      `Updated item ${targetItem.id}`,
      "activity",
      req.user.business_id
    );
  }
);

/**
 * Used to delete multiple existing items.
 */
router.post(
  "/delete-multiple",
  checkRequiredPOST("item_ids"),
  async (req, res) => {
    // Data:
    const { item_ids } = req.body;

    // Check array
    if (!Array.isArray(item_ids))
      return res.status(HTTP_BAD_REQUEST).send("item_list_format_mismatch");

    // Get item list and check all items exist initially
    const items = await db("erp.item")
      .where("deleted", false)
      .where("business_id", req.user.business_id)
      .whereIn(
        "id",
        item_ids.map((id) => String(id))
      );
    if (
      item_ids.sort().join(",") !==
      items
        .map((u) => u.id)
        .sort()
        .join(",")
    )
      return res.status(HTTP_BAD_REQUEST).send("no_such_items");

    // Delete items from database
    await db("erp.item")
      .whereIn(
        "id",
        items.map((u) => u.id)
      )
      .update({ deleted: true });

    // Delete variant groups from database
    const deletedVariantGroups = await db("erp.variant_group")
      .whereIn(
        "item_id",
        items.map((u) => u.id)
      )
      .update({ deleted: true })
      .returning("id");

    // Delete variants from database
    await db("erp.variant")
      .whereIn("variant_group_id", deletedVariantGroups)
      .update({ deleted: true });

    res.sendStatus(HTTP_OK);

    await log(
      `Deleted ${items.length} items: ${items.map((i) => i.id).join(", ")}`,
      "activity",
      req.user.business_id
    );
  }
);

// Just for testing purposes, only included when API runs in a local environment.
if (env.isLocal()) {
  /**
   * Used to delete an item after testing.
   */
  router.delete("/:item_id", async (req, res) => {
    // Check item exists
    const item = await db("erp.item").where("id", req.params.item_id).first();
    if (!item) return res.status(HTTP_BAD_REQUEST).send("no_such_item");

    // Delete item
    await db("erp.item").where("id", item.id).delete();

    res.sendStatus(HTTP_OK);
  });
}

module.exports = router;
