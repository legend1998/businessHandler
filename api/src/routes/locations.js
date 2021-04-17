const express = require('express');

const env = require('../../config/environment.js');

const db = require('../helpers/database.js');
const { hasPrivilegeLevel, checkRequiredPOST } = require('../helpers/middleware.js');
const { formatTable, formatTableRow, log } = require('../helpers/utils.js');
const { authenticate } = require('../helpers/auth-jwt.js');
const { isValidName, isValidString, isValidEnum, formatPhoneNumber, isValidNumber } = require('../helpers/validation.js');
const { locationTypes } = require('../helpers/enums.js');
const router = express();

// Authenticate ALL routes in this controller
router.use(authenticate);
router.use(hasPrivilegeLevel('admin'));

/**
 *
 * @param itemIDs
 * @returns {Promise<awaited Knex.QueryBuilder<TRecord, TResult>>}
 */
async function getItemList(itemIDs) {
    const items = await db('erp.item')
        .where('deleted', false)
        .whereIn('id', itemIDs);
    formatTable(items);

    const variantGroups = await db('erp.variant_group')
        .where('deleted', false)
        .whereIn('item_id', items.map(i => i.id));
    formatTable(variantGroups);

    const variants = await db('erp.variant')
        .where('deleted', false)
        .whereIn('variant_group_id', variantGroups.map(g => g.id));
    formatTable(variants);

    variantGroups.forEach(g => g.variants = variants.filter(v => v.variant_group_id === g.id));
    items.forEach(i => i.variant_groups = variantGroups.filter(g => g.item_id === i.id));

    return items;
}

/**
 * Used to retrieve all the modifiable locations by the requesting user.
 */
router.get('/', async (req, res) => {

    const locations = await db('erp.location')
        .where('deleted', false)
        .where('business_id', req.user.business_id);
    res.json(formatTable(locations));

});

/**
 * Used to create a new location. Only admin users may create new locations.
 */
router.post('/create', checkRequiredPOST('name', 'address', 'city', 'state', 'country', 'postal_code', 'phone_number', 'latitude', 'longitude', 'type'), async (req, res) => {

    // Data from request
    const business_id = req.user.business_id
    const {
        name,
        address,
        city,
        state,
        country,
        postal_code,
        phone_number,
        latitude,
        longitude,
        type
    } = req.body;
    const formattedPhoneNumber = formatPhoneNumber(phone_number);

    // Validate fields
    if (!isValidName(name) ||
        !isValidString(address, 200) ||
        !isValidString(city, 100) ||
        !isValidString(state, 100) ||
        !isValidString(country, 100) ||
        !isValidString(postal_code, 50) ||
        !formattedPhoneNumber ||
        !isValidNumber(latitude, -90, 90) ||
        !isValidNumber(longitude, -180, 180) ||
        !isValidEnum(type, locationTypes))
        return res.status(HTTP_BAD_REQUEST).send('invalid_fields');

    // Insert location
    const [location] = await db('erp.location')
        .insert({
            name,
            business_id,
            address,
            city,
            state,
            country,
            postal_code,
            phone_number: formattedPhoneNumber,
            latitude,
            longitude,
            type
        })
        .returning('*');

    // Return location
    res.json(formatTableRow(location));

    await log(`Created location ${location.id}`, 'activity', req.user.business_id);

});

/**
 * Used to change the details of an existing location. Only an admin/owner can modify a location's address, name, type, phone number, latitude, longitude and postal code.
 */
router.put('/:location_id', checkRequiredPOST('name', 'address', 'city', 'state', 'country', 'postal_code', 'phone_number', 'latitude', 'longitude', 'type'), async (req, res) => {

    // Data from body
    const {
        name,
        address,
        city,
        state,
        country,
        postal_code,
        phone_number,
        latitude,
        longitude,
        type
    } = req.body;
    const formattedPhoneNumber = formatPhoneNumber(phone_number);

    // Validate fields
    if (!isValidName(name) ||
        !isValidString(address, 200) ||
        !isValidString(city, 100) ||
        !isValidString(state, 100) ||
        !isValidString(country, 100) ||
        !isValidString(postal_code, 50) ||
        !formattedPhoneNumber ||
        !isValidNumber(latitude, -90, 90) ||
        !isValidNumber(longitude, -180, 180) ||
        !isValidEnum(type, locationTypes))
        return res.status(HTTP_BAD_REQUEST).send('invalid_fields');

    // Check target location exists
    let targetLocation = await db('erp.location')
        .where('deleted', false)
        .where('id', req.params.location_id)
        .where('business_id', req.user.business_id)
        .first();
    if (!targetLocation)
        return res.status(HTTP_BAD_REQUEST).send('no_such_location');

    // Update target location information
    [targetLocation] = await db('erp.location')
        .where('id', targetLocation.id)
        .update({
            name,
            address,
            city,
            state,
            country,
            postal_code,
            phone_number: formattedPhoneNumber,
            latitude,
            longitude,
            type
        })
        .returning('*');

    // Send resulting location object
    res.json(formatTableRow(targetLocation));

    await log(`Updated location ${targetLocation.id}`, 'activity', req.user.business_id);

});

/**
 * Used to delete multiple existing locations.
 */
router.post('/delete-multiple', checkRequiredPOST('location_ids'), async (req, res) => {

    // Data from body
    const { location_ids } = req.body;

    // Check location ID array
    if (!Array.isArray(location_ids))
        return res.status(HTTP_BAD_REQUEST).send('location_list_format_mismatch');

    // Get location list and check all locations exist initially
    const locations = await db('erp.location')
        .where('deleted', false)
        .where('business_id', req.user.business_id)
        .whereIn('id', location_ids.map(id => String(id)));
    if (location_ids.sort().join(',') !== locations.map(u => u.id).sort().join(','))
        return res.status(HTTP_BAD_REQUEST).send('no_such_locations');

    // Delete locations from database
    await db('erp.location')
        .whereIn('id', locations.map(u => u.id))
        .update({
            deleted: true
        });

    res.sendStatus(HTTP_OK);

    await log(`Deleted ${locations.length} locations: ${locations.map(i => i.id).join(', ')}`, 'activity', req.user.business_id);

});

/**
 * Used to retrieve the inventory of a specific location.
 */
router.get('/:location_id/inventory', async (req, res) => {

    const location = await db('erp.location')
        .where('deleted', false)
        .where('id', req.params.location_id)
        .first();
    if (!location)
        return res.status(HTTP_BAD_REQUEST).send('no_such_location');

    let inventory = await db('erp.location_item')
        .where('location_id', location.id);

    // Empty inventory
    if (inventory.length === 0)
        return res.json([]);

    const items = await getItemList(inventory.map(i => i.item_id).filter((id, index, arr) => arr.indexOf(id) === index));

    inventory.forEach(i => {
        i.item = items.find(item => item.id === i.item_id);
        i.variants = JSON.parse(i.variants);
        delete i.item_id;
        delete i.location_id;
    });
    inventory = inventory.filter(i => !!i.item);

    res.json(inventory);

});

/**
 * Used to change the inventory of a specific location.
 */
router.put('/:location_id/inventory', async (req, res) => {

    const inventoryItems = req.body;
    if (!Array.isArray(inventoryItems))
        return res.status(HTTP_BAD_REQUEST).send('item_list_format_mismatch');

    const location = await db('erp.location')
        .where('deleted', false)
        .where('id', req.params.location_id)
        .where('business_id', req.user.business_id)
        .first();
    if (!location)
        return res.status(HTTP_BAD_REQUEST).send('no_such_location');

    await db('erp.location_item')
        .where('location_id', location.id)
        .delete();

    await db('erp.location_item')
        .insert(inventoryItems.map(i => ({ location_id: location.id, item_id: i.item_id, quantity: i.quantity, variants: JSON.stringify(i.variants) })));

    res.sendStatus(HTTP_OK);

    await log(`Modified location inventory ${location.id}`, 'activity', req.user.business_id);

});

// Just for testing purposes, only included when API runs in a local environment.
if (env.isLocal()) {

    /**
     * Used to delete a location after testing.
     */
    router.delete('/:location_id', async (req, res) => {

        // Check location exists
        const location = await db('erp.location')
            .where('id', req.params.location_id)
            .first();
        if (!location)
            return res.status(HTTP_BAD_REQUEST).send('no_such_location');

        // Delete location
        await db('erp.location')
            .where('id', location.id)
            .delete();

        res.sendStatus(HTTP_OK);

    });

}

module.exports = router;
