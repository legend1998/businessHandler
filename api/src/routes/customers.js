const express = require('express');

const env = require('../../config/environment.js');

const db = require('../helpers/database.js');
const { getBusinessItems, whereLike } = require('../helpers/queries.js');
const { checkRequiredPOST } = require('../helpers/middleware.js');
const { formatTable, formatTableRow } = require('../helpers/utils.js');
const { authenticate } = require('../helpers/auth-jwt.js');
const { isValidEmail, isValidName, isValidString, formatPhoneNumber } = require('../helpers/validation.js');
const router = express();

// Authenticate ALL routes in this controller
router.use(authenticate);

/**
 * Used to retrieve all the modifiable customers by the requesting user.
 */
router.get('/', async (req, res) => {

    const query = req.query.q || '';

    const customers = await db('erp.customer')
        .where('deleted', false)
        .where('business_id', req.user.business_id)
        .where(whereLike(query, 'first_name', 'last_name', 'email', 'phone_number', 'address', 'city', 'state', 'country', 'postal_code'))
        .limit(10);
    formatTable(customers);

    const orders = await db('erp.order')
        .where('deleted', false)
        .whereIn('customer_id', customers.map(c => c.id));
    formatTable(orders);

    const orderItems = await db('erp.order_item')
        .whereIn('order_id', orders.map(o => o.id));
    formatTable(orderItems);

    const items = await getBusinessItems(req.user.business_id);

    const employees = await db('erp.user')
        .whereIn('id', orders.map(o => o.employee_id));
    formatTable(employees);

    orderItems.forEach(oi => oi.item = items.filter(i => i.id === oi.item_id));

    orders.forEach(o => {
        o.items = orderItems.filter(oi => oi.order_id === o.id);
        o.employee = employees.find(e => e.id === o.employee_id);
    });

    customers.forEach(c => c.orders = orders.filter(o => o.customer_id === c.id));

    res.json(customers);

});

/**
 * Used to create a new customer.
 */
router.post('/create', checkRequiredPOST('first_name', 'last_name', 'email', 'phone_number', 'address', 'city', 'state', 'country', 'postal_code'), async (req, res) => {

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
    } = req.body;
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
        return res.status(HTTP_BAD_REQUEST).send('invalid_fields');

    // Insert customer
    const [customer] = await db('erp.customer')
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

    // Return customer
    res.json(formatTableRow(customer));
});

/**
 * Used to change the details of an existing customer. Only an admin/owner can modify a customer's address, name, type, phone number, latitude, longitude and postal code.
 */
router.put('/:customer_id', checkRequiredPOST('first_name', 'last_name', 'email', 'phone_number', 'address', 'city', 'state', 'country', 'postal_code'), async (req, res) => {

    // Data from body
    const {
        first_name,
        last_name,
        phone_number,
        address,
        city,
        state,
        country,
        postal_code,
        email
    } = req.body;

    // Validate fields
    const formattedPhoneNumber = formatPhoneNumber(phone_number);
    if (!isValidName(first_name) ||
        !isValidName(last_name) ||
        !isValidString(address, 200) ||
        !isValidString(city, 100) ||
        !isValidString(state, 100) ||
        !isValidString(country, 100) ||
        !isValidString(postal_code, 50) ||
        !formattedPhoneNumber)
        return res.status(HTTP_BAD_REQUEST).send('invalid_fields');

    // Check target customer exists
    let targetCustomer = await db('erp.customer')
        .where('deleted', false)
        .where('id', req.params.customer_id)
        .first();
    if (!targetCustomer)
        return res.status(HTTP_BAD_REQUEST).send('customer_not_found');

    // Update target customer information
    [targetCustomer] = await db('erp.customer')
        .where('id', targetCustomer.id)
        .update({
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

    // Send resulting customer object
    res.json(formatTableRow(targetCustomer));

});

// Just for testing purposes, only included when API runs in a local environment.
if (env.isLocal()) {

    /**
     * Used to delete a customer after testing.
     */
    router.delete('/:customer_id', async (req, res) => {

        // Check customer exists
        const customer = await db('erp.customer')
            .where('id', req.params.customer_id)
            .first();
        if (!customer)
            return res.status(HTTP_BAD_REQUEST).send('no_such_customer');

        // Delete customer
        await db('erp.customer')
            .where('id', customer.id)
            .delete();

        res.sendStatus(HTTP_OK);

    });

}

module.exports = router;
