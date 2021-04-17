const express = require('express');

const db = require('../helpers/database.js');
const { getItems } = require('../helpers/queries.js');
const { checkRequiredPOST } = require('../helpers/middleware.js');
const { formatTable, formatTableRow, hasKeys, convertAmount, log } = require('../helpers/utils.js');
const { authenticate } = require('../helpers/auth-jwt.js');
const { isValidEmail, isValidName, isValidString, formatPhoneNumber } = require('../helpers/validation.js');
const currencies = require('../helpers/currencies.json');
const router = express();

// Authenticate ALL routes in this controller
router.use(authenticate);

/**
 * Used to retrieve all the orders made for the user's business.
 */
router.get('/', async (req, res) => {

    const orders = await db('erp.order')
        .select('json')
        .where('business_id', req.user.business_id)
        .whereNotNull('json');

    res.json(orders.map(o => JSON.parse(o.json)));

});

/**
 * Used to create a new order. The employee creating the order may add a new customer to the database in the process
 */
router.post('/create', checkRequiredPOST('items', 'currency'), async (req, res) => {

    // No existing or new customer specified
    if (!req.body.customer && !req.body.customer_id)
        return res.status(HTTP_BAD_REQUEST).send('no_customer_specified');

    // Get business information
    const business = await db('erp.business')
        .where('id', req.user.business_id)
        .first();

    let customer;

    // Body contains customer ID
    if (req.body.customer_id) {

        customer = await db('erp.customer')
            .where('id', req.body.customer_id)
            .first();
        if (!customer)
            return res.status(HTTP_BAD_REQUEST).send('no_such_customer');

    // Body contains new customer data
    } else if (hasKeys(req.body.customer, 'first_name', 'last_name', 'email', 'phone_number', 'address', 'city', 'state', 'country', 'postal_code')) {

        const business_id = req.user.business_id;
        const {
            first_name,
            last_name,
            email,
            phone_number,
            address,
            city,
            state,
            country,
            postal_code
        } = req.body.customer;
        const formattedPhoneNumber = formatPhoneNumber(phone_number);

        // Validate fields
        if (!isValidName(first_name) ||
            !isValidName(last_name) ||
            !isValidEmail(email) ||
            !isValidString(address, 200) ||
            !isValidString(city, 100) ||
            !isValidString(state, 100) ||
            !isValidString(country, 100) ||
            !isValidString(postal_code, 50) ||
            !formattedPhoneNumber)
            return res.status(HTTP_BAD_REQUEST).send('invalid_customer_fields');

        // Insert customer
        [customer] = await db('erp.customer')
            .insert({
                business_id,
                first_name,
                last_name,
                email,
                phone_number,
                address,
                city,
                state,
                country,
                postal_code
            })
            .returning('*');

        await log(`Created customer [${customer.id}] ${first_name} ${last_name}`, 'activity', req.user.business_id);

    // Invalid new customer data
    } else {
        return res.status(HTTP_BAD_REQUEST).send('invalid_customer');
    }

    // Check that order items is an array
    const orderItems = req.body.items;
    if (!Array.isArray(orderItems) || orderItems.length === 0)
        return res.status(HTTP_BAD_REQUEST).send('order_items_type_mismatch');

    // Check that the currency exists
    if (!currencies.hasOwnProperty(req.body.currency))
        return res.status(HTTP_BAD_REQUEST).send('invalid_currency');

    // Get business items from database
    const items = await getItems(orderItems.map(oi => oi.item_id));
    const orderItemsToInsert = [];

    // Parse order items one by one
    for (const orderItem of orderItems) {
        const item = items.find(i => i.id === orderItem.item_id);

        // Validation
        if (!item)
            return res.status(HTTP_BAD_REQUEST).send('non_existent_item');
        if (typeof orderItem.variants !== 'object' || typeof orderItem.quantity !== 'number' || orderItem.quantity <= 0)
            return res.status(HTTP_BAD_REQUEST).send('invalid_order_item');

        orderItemsToInsert.push({
            item_id: item.id,
            variants: JSON.stringify(orderItem.variants),
            quantity: orderItem.quantity,
            unit_price: item.price
        });
    }

    // Compute subtotal
    const currency = req.body.currency;
    const currencyObject = currencies[currency];
    const subtotal_amount = Number(Number(orderItemsToInsert.reduce((subtotal, orderItem) => subtotal + convertAmount(business.currency, currency, orderItem.unit_price * orderItem.quantity), 0)).toFixed(currencyObject.decimal_digits));

    // Insert order
    const tax_rate = 0.15;
    const [insertedOrder] = await db('erp.order')
        .insert({
            business_id: req.user.business_id,
            employee_id: req.user.id,
            customer_id: customer.id,
            status: 'paid',
            total_items: orderItemsToInsert.reduce((total, item) => total + item.quantity, 0),
            subtotal_amount,
            total_amount: Number(Number(subtotal_amount * (1.0 + tax_rate)).toFixed(currencyObject.decimal_digits)),
            tax_rate,
            currency
        })
        .returning('*');
    formatTableRow(insertedOrder);

    // Insert order items
    const insertedOrderItems = await db('erp.order_item')
        .insert(orderItemsToInsert.map(oi => ({ ...oi, order_id: insertedOrder.id })))
        .returning('*');
    formatTable(insertedOrderItems);

    // Create and update order JSON
    const orderJSON = JSON.parse(JSON.stringify(insertedOrder));
    orderJSON.items = insertedOrderItems.map(oi => ({
        id: oi.id,
        item: items.find(i => i.id === oi.item_id),
        variants: JSON.parse(oi.variants),
        quantity: oi.quantity,
        unit_price: oi.unit_price
    }));
    orderJSON.customer = customer;
    orderJSON.employee = req.user;
    delete orderJSON.employee_id;
    delete orderJSON.customer_id;
    delete orderJSON.json;
    await db('erp.order')
        .where('id', insertedOrder.id)
        .update({
            json: orderJSON
        });

    // Return order
    res.json(orderJSON);
    await emailer.sendMail(email, 'Your Order Quote', 'quote', { ORDER_TOTAL: insertedOrder.total_amount});

    await log(`Placed order ${insertedOrder.id}`, 'activity', req.user.business_id);

});

module.exports = router;
