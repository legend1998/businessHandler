const express = require("express");

const env = require("../../config/environment.js");

const db = require("../helpers/database");
const { itemTypes } = require("../helpers/enums.js");
const { formatTable, formatTableRow } = require("../helpers/utils.js");
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
  isValidQuantity,
} = require("../helpers/validation.js");
const { getBusinessItems, getItems } = require("../helpers/queries.js");
const router = express();

// Authenticate ALL routes in this controller
router.use(authenticate);
router.use(hasPrivilegeLevel("admin"));
/**
 * Used to retrieve all the assembly rules associated with the business of the user
 */
router.get("/", async (req, res) => {
  const assembly_rules = await db("erp.assembly_rule")
    .where("deleted", false)
    .where("business_id", req.user.business_id);
  formatTable(assembly_rules);
  const input_items = await db("erp.assembly_input").whereIn(
    "rule_id",
    assembly_rules.map((c) => c.id)
  );
  formatTable(input_items);

  const items = await getItems(input_items.map((c) => c.item_id));
  input_items.forEach((c) => {
    c.item = items.find((i) => i.id === c.item_id);
  });
  assembly_rules.forEach((c) => {
    c.inputs = input_items.filter((i) => i.rule_id === c.id);
  });
  res.json(assembly_rules);
});
/**
 * Used to create a new assembly rule. Only Admins can create assembly rules.
 */
router.post(
  "/create",
  checkRequiredPOST(
    "name",
    "quantity",
    "input_items",
    "item_id",
    "out_item_variant"
  ),
  async (req, res) => {
    // Data from request
    const business_id = req.user.business_id;

    const { name, quantity, input_items, item_id, out_item_variant } = req.body;

    // Validate fields
    if (
      !isValidName(name) ||
      !isValidQuantity(quantity) ||
      !Array.isArray(input_items)
    )
      return res.status(HTTP_BAD_REQUEST).send("invalid_fields");

    const [rule] = await db("erp.assembly_rule")
      .insert({
        business_id: business_id,
        name: name,
        out_item_id: item_id,
        out_quantity: quantity,
        out_item_variants: out_item_variant,
      })
      .returning("*");
    const items = await getItems(input_items.map((i) => i.id));
    // Insert variants into the assembly input table
    const input_items_to_insert = [];
    for (const input_item of input_items) {
      const item = items.find((i) => i.id === input_item.id);

      // Validation
      if (!item) return res.status(HTTP_BAD_REQUEST).send("non_existent_item");
      if (typeof input_item.quantity !== "number" || input_item.quantity <= 0)
        return res.status(HTTP_BAD_REQUEST).send("invalid_item");

      input_items_to_insert.push({
        quantity: input_item.quantity,
        rule_id: rule.id,
        item_id: item.id,
      });
    }
    rule.inputs = await db("erp.assembly_input")
      .insert(input_items_to_insert)
      .returning("*");
    res.json(formatTableRow(rule));
  }
);
/**
 * Used to modify an existing rule. Only admin users may modify rules.
 */
router.put(
  "/:rule_id",
  checkRequiredPOST(
    "name",
    "quantity",
    "input_items",
    "item_id",
    "item_variant_id"
  ),
  async (req, res) => {
    // Data from request
    const business_id = req.user.business_id;

    const { name, quantity, input_items, item_id, item_variant_id } = req.body;

    // Validate fields
    if (
      !isValidName(name) ||
      !isValidQuantity(quantity) ||
      !Array.isArray(input_items)
    )
      return res.status(HTTP_BAD_REQUEST).send("invalid_fields");

    const [rule] = await db("erp.assembly_rule")
      .update({
        name: name,
        business_id: business_id,
        out_item_id: item_id,
        out_item_variants: item_variant_id,
        out_quantity: quantity,
      })
      .where("id", req.params.rule_id)
      .returning("*");

    await db("erp.assembly_input").where("rule_id", rule.id).delete();
    const items = await getItems(input_items.map((i) => i.id));
    // Insert items into the assembly input table
    const input_items_to_insert = [];
    for (const input_item of input_items) {
      const item = items.find((i) => i.id === input_item.id);

      // Validation
      if (!item) return res.status(HTTP_BAD_REQUEST).send("non_existent_item");
      if (typeof input_item.quantity !== "number" || input_item.quantity <= 0)
        return res.status(HTTP_BAD_REQUEST).send("invalid_item");

      input_items_to_insert.push({
        item_id: item.id,
        quantity: input_item.quantity,
        rule_id: rule.id,
      });
    }
    rule.inputs = await db("erp.assembly_input")
      .insert(input_items_to_insert)
      .returning("*");
    res.json(formatTableRow(rule));
  }
);
/**
 * Used to delete multiple existing rules.
 */
router.post(
  "/delete-multiple",
  checkRequiredPOST("rule_ids"),
  async (req, res) => {
    // Data:
    const { rule_ids } = req.body;

    // Check array
    if (!Array.isArray(rule_ids))
      return res.status(HTTP_BAD_REQUEST).send("rule_ids_list_format_mismatch");

    // Get rules list and check all rules exist initially
    const rules = await db("erp.assembly_rule")
      .where("deleted", false)
      .whereIn(
        "id",
        rule_ids.map((id) => String(id))
      );
    if (
      rule_ids.sort().join(",") !==
      rules
        .map((u) => u.id)
        .sort()
        .join(",")
    )
      return res.status(HTTP_BAD_REQUEST).send("no_such_rules");

    // Delete rules from database
    await db("erp.assembly_rule")
      .whereIn(
        "id",
        rules.map((u) => u.id)
      )
      .update({ deleted: true });

    res.sendStatus(HTTP_OK);
  }
);

module.exports = router;
