const express = require("express");
const moment = require("moment");
const lodash = require("lodash");

const {
  formatTable,
  deepCopy,
  valueTimestamptz,
  log,
} = require("../helpers/utils.js");
const { authenticate } = require("../helpers/auth-jwt.js");

const router = express();

router.use(authenticate);

function checkInventoryHasRemaining(inventory, items) {
  const inventoryLeftover = deepCopy(inventory);
  for (let item of items) {
    let quantityLeftToCheck = item.quantity;
    while (quantityLeftToCheck > 0) {
      const inventoryItem = inventoryLeftover.find(
        (i) =>
          i.item_id === item.item_id &&
          lodash.isEqual(i.variants, item.variants) &&
          i.quantity > 0
      );
      if (!inventoryItem) return false;

      if (inventoryItem.quantity > quantityLeftToCheck) {
        inventoryItem.quantity -= quantityLeftToCheck;
        quantityLeftToCheck = 0;
      } else {
        quantityLeftToCheck -= inventoryItem.quantity;
        inventoryItem.quantity = 0;
      }
    }
  }
  return inventoryLeftover.filter((i) => i.quantity > 0);
}

function addToInventory(inventory, items) {
  const newInventory = deepCopy(inventory);
  for (let item of items) {
    const inventoryItem = newInventory.find(
      (i) =>
        i.item_id === item.item_id && lodash.isEqual(i.variants, item.variants)
    );
    if (!inventoryItem) {
      newInventory.push(item);
      continue;
    }
    inventoryItem.quantity += item.quantity;
  }
  return newInventory;
}

//  get all schedules shipments of a user

router.get("/", async (req, res) => {
  const scheduledShipments = await db("erp.shipment")
    .where("deleted", false)
    .where("business_id", req.user.business_id)
    .whereNull("scheduled_shipment_id");
  formatTable(scheduledShipments);

  const employees = await db("erp.user").whereIn(
    "id",
    scheduledShipments.reduce(
      (list, shipment) => [
        ...list,
        ...(shipment.departure_validated_by && [
          shipment.departure_validated_by,
        ]),
        ...(shipment.arrival_validated_by && [shipment.arrival_validated_by]),
      ],
      []
    )
  );
  formatTable(employees);

  const locations = await db("erp.location").whereIn(
    "id",
    scheduledShipments.reduce(
      (list, shipment) => [
        ...list,
        shipment.location_start_id,
        shipment.location_end_id,
      ],
      []
    )
  );
  formatTable(locations);

  scheduledShipments.forEach((ss) => {
    ss.location_start = locations.find((l) => l.id === ss.location_start_id);
    ss.location_end = locations.find((l) => l.id === ss.location_end_id);
    ss.departure_validated_by =
      employees.find((e) => e.id === ss.departure_validated_by) || null;
    ss.arrival_validated_by =
      employees.find((e) => e.id === ss.arrival_validated_by) || null;
  });

  res.json(scheduledShipments);
});

// get shipments information of the today

router.get("/today", async (req, res) => {
  const shipments = await db("erp.shipment")
    .where("deleted", false)
    .where("business_id", req.user.business_id)
    .whereNotNull("scheduled_shipment_id")
    .where("created_at", ">=", valueTimestamptz(moment().startOf("day")))
    .where(
      "created_at",
      "<=",
      valueTimestamptz(moment().startOf("day").add(1, "days"))
    );
  formatTable(shipments);

  res.json(shipments);
});

//  departure validation or maybe finding a valid depart station

router.post("/:shipment_id/validate-departure", async (req, res) => {
  // Find shipment
  const shipment = await db("erp.shipment")
    .where("id", req.params.shipment_id)
    .where("business_id", req.user.business_id)
    .whereNotNull("scheduled_shipment_id")
    .first();
  if (!shipment) return res.status(HTTP_BAD_REQUEST).send("no_such_shipment");

  // Check shipment not already departed
  if (shipment.departed_at)
    return res.status(HTTP_BAD_REQUEST).send("shipment_already_departed");

  // Check start location exists
  const startLocation = await db("erp.location")
    .where("deleted", false)
    .where("id", shipment.location_start_id)
    .first();
  if (!startLocation)
    return res.status(HTTP_BAD_REQUEST).send("no_such_start_location");

  // Check end location exists
  const endLocation = await db("erp.location")
    .where("deleted", false)
    .where("id", shipment.location_end_id)
    .first();
  if (!endLocation)
    return res.status(HTTP_BAD_REQUEST).send("no_such_end_location");

  // Get start location inventory
  const startLocationInventory = await db("erp.location_item").where(
    "location_id",
    startLocation.id
  );
  startLocationInventory.forEach(
    (li) => (li.variants = JSON.parse(li.variants))
  );

  // Get shipment inventory
  const shipmentInventory = await db("erp.shipment_item").where(
    "shipment_id",
    shipment.id
  );
  shipmentInventory.forEach((li) => (li.variants = JSON.parse(li.variants)));

  // Compute leftover inventory, if enough in start location
  const inventoryLeftover = checkInventoryHasRemaining(
    startLocationInventory,
    shipmentInventory
  );
  if (!inventoryLeftover)
    return res
      .status(HTTP_BAD_REQUEST)
      .send("insufficient_start_location_inventory");

  // Replace start location inventory with new leftover inventory
  await db("erp.location_item").where("location_id", startLocation.id).delete();

  inventoryLeftover.forEach((i) => (i.variants = JSON.stringify(i.variants)));
  await db("erp.location_item").insert(inventoryLeftover).returning("*");

  // Set shipment as departed
  await db("erp.shipment")
    .where("id", shipment.id)
    .update({
      departed_at: valueTimestamptz(moment()),
      departure_validated_by: req.user.id,
    });

  res.sendStatus(HTTP_OK);

  await log(
    `Shipment ${shipment.id} departed from location ${startLocation.id}`,
    "activity",
    req.user.business_id
  );
});

router.post("/:shipment_id/validate-arrival", async (req, res) => {
  // Find shipment
  const shipment = await db("erp.shipment")
    .where("id", req.params.shipment_id)
    .where("business_id", req.user.business_id)
    .whereNotNull("scheduled_shipment_id")
    .first();
  if (!shipment) return res.status(HTTP_BAD_REQUEST).send("no_such_shipment");

  // Check shipment not already arrived
  if (shipment.arrived_at)
    return res.status(HTTP_BAD_REQUEST).send("shipment_already_departed");

  // Check start location exists
  const startLocation = await db("erp.location")
    .where("deleted", false)
    .where("id", shipment.location_start_id)
    .first();
  if (!startLocation)
    return res.status(HTTP_BAD_REQUEST).send("no_such_start_location");

  // Check end location exists
  const endLocation = await db("erp.location")
    .where("deleted", false)
    .where("id", shipment.location_end_id)
    .first();
  if (!endLocation)
    return res.status(HTTP_BAD_REQUEST).send("no_such_end_location");

  // Get start location inventory
  const endLocationInventory = await db("erp.location_item").where(
    "location_id",
    endLocation.id
  );
  endLocationInventory.forEach((li) => (li.variants = JSON.parse(li.variants)));

  // Get shipment inventory
  const shipmentInventory = await db("erp.shipment_item").where(
    "shipment_id",
    shipment.id
  );
  shipmentInventory.forEach((li) => (li.variants = JSON.parse(li.variants)));

  // Add shipment inventory to end location
  const newEndLocationInventory = addToInventory(
    endLocationInventory,
    shipmentInventory
  );

  // Replace end location inventory with new inventory
  await db("erp.location_item").where("location_id", endLocation.id).delete();

  newEndLocationInventory.forEach(
    (i) => (i.variants = JSON.stringify(i.variants))
  );
  await db("erp.location_item").insert(newEndLocationInventory).returning("*");

  // Set shipment as arrived
  await db("erp.shipment")
    .where("id", shipment.id)
    .update({
      arrived_at: valueTimestamptz(moment()),
      arrival_validated_by: req.user.id,
    });

  res.sendStatus(HTTP_OK);

  await log(
    `Shipment ${shipment.id} arrived at location ${endLocation.id}`,
    "activity",
    req.user.business_id
  );
});

router.post("/create", async (req, res) => {
  // TODO
});

module.exports = router;
