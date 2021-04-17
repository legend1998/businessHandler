const express = require('express');

const db = require('../helpers/database.js');
const { hasPrivilegeLevel, checkRequiredPOST } = require('../helpers/middleware.js');
const { formatTable, formatTableRow } = require('../helpers/utils.js');
const { authenticate } = require('../helpers/auth-jwt.js');
const { isValidEnum, isValidNumber } = require('../helpers/validation.js');
const { productionRateFrequencies } = require('../helpers/enums.js');
const router = express();

// Authenticate ALL routes in this controller
router.use(authenticate);
router.use(hasPrivilegeLevel('admin'));

/**
 * Used to retrieve all the modifiable production rates by the requesting user.
 */
router.get('/', async (req, res) => {

    const production_rates = await db('erp.production_rate')
        .where('location_id', req.user.location_id);
    res.json(formatTable(production_rates));

});

/**
 * Used to create a new production rate.
 */
router.post('/create', checkRequiredPOST('location_id', 'item_id', 'frequency', 'target_amount'), async (req, res) => {

    const {
        location_id,
        item_id,
        frequency,
        target_amount
    } = req.body;

    // Validate fields
    if (!isValidNumber(target_amount) ||
        !isValidEnum(frequency, productionRateFrequencies))
        return res.status(HTTP_BAD_REQUEST).send('invalid_fields');

    // Insert production rate
    const [productionRate] = await db('erp.production_rate')
        .insert({
            location_id,
            item_id,
            frequency,
            target_amount
        })
        .returning('*');

    // Return production rate
    res.json(formatTableRow(productionRate));
});

/**
 * Used to change the details of an existing production rate. Only an admin/owner can modify a production rate.
 */
router.put('/:production_rate_id', checkRequiredPOST('location_id', 'item_id', 'frequency', 'target_amount'), async (req, res) => {

    const {
        location_id,
        item_id,
        frequency,
        target_amount
    } = req.body;

    // Validate fields
    if (!isValidNumber(target_amount) ||
        !isValidEnum(frequency, productionRateFrequencies))
        return res.status(HTTP_BAD_REQUEST).send('invalid_fields');

    // Check target production rate exists
    let targetProdRate = await db('erp.production_rate')
        .where('id', req.params.production_rate_id)
        .where('business_id', req.user.business_id)
        .first();
    if (!targetProdRate)
        return res.status(HTTP_BAD_REQUEST).send('no_such_production_rate');

    // Update target location information
    [targetProdRate] = await db('erp.production_rate')
        .where('id', targetProdRate.id)
        .update({
            location_id,
            item_id,
            frequency,
            target_amount
        })
        .returning('*');

    // Send resulting location object
    res.json(formatTableRow(targetProdRate));

});

/**
 * Used to delete multiple existing production rates.
 */
router.post('/delete-multiple', checkRequiredPOST('production_rate_ids'), async (req, res) => {

    // Data from body
    const { production_rate_ids } = req.body;

    // Check location ID array
    if (!Array.isArray(production_rate_ids))
        return res.status(HTTP_BAD_REQUEST).send('production_rate_list_format_mismatch');

    // Get location list and check all locations exist initially
    const procution_rates = await db('erp.production_rate')
        .whereIn('id', production_rate_ids.map(id => String(id)));
    if (production_rate_ids.sort().join(',') !== production_rate_ids.map(u => u.id).sort().join(','))
        return res.status(HTTP_BAD_REQUEST).send('no_such_production_rates');

    // Delete locations from database
    await db('erp.production_rate')
        .whereIn('id', procution_rates.map(u => u.id))
        .update({
            deleted: true
        });

    res.sendStatus(HTTP_OK);

});
module.exports = router;
