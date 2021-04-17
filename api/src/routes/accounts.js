const express = require('express');
const bcrypt = require('bcryptjs');
const generatePassword = require('password-generator');

const env = require('../../config/environment.js');

const db = require('../helpers/database.js');
const { authenticate } = require('../helpers/auth-jwt.js');
const { checkRequiredPOST, hasPrivilegeLevel } = require('../helpers/middleware.js');
const { isValidName, isValidEmail, isValidEnum } = require('../helpers/validation.js');
const { sendMail } = require('../helpers/email.js');
const { formatTable, formatTableRow, log } = require('../helpers/utils.js');
const { userTypes } = require('../helpers/enums.js');

const router = express();

// Authenticate ALL routes in this controller
router.use(authenticate);
router.use(hasPrivilegeLevel('admin'));

/**
 * Used to retrieve all the modifiable user accounts by the requesting user.
 */
router.get('/', async (req, res) => {

    const users = await db('erp.user')
        .where('deleted', false)
        .where('business_id', req.user.business_id)
        .whereIn('type', [...userTypes].splice(0, userTypes.indexOf(req.user.type)))

    res.json(formatTable(users));

});

/**
 * Used to create a new account. Only admin users may create new user accounts. Owner accounts cannot be created this way as there can only be 1 owner account per business.
 */
router.post('/create', checkRequiredPOST('first_name', 'last_name', 'email', 'type'), async (req, res) => {

    // Data from body
    const {
        first_name,
        last_name,
        email,
        type
    } = req.body;

    // Validate fields
    if (!isValidName(first_name) ||
        !isValidName(last_name) ||
        !isValidEmail(email) ||
        !isValidEnum(type, [...userTypes].splice(0, userTypes.indexOf('owner'))))
        return res.status(HTTP_BAD_REQUEST).send('invalid_fields');

    // Check email is not taken
    const existingUser = await db('erp.user')
        .where('deleted', false)
        .where('email', email)
        .first();
    if (existingUser)
        return res.status(HTTP_BAD_REQUEST).send('email_taken');

    // Check business exists
    const business = await db('erp.business')
        .where('deleted', false)
        .where('id', req.user.business_id)
        .first();
    if (!business)
        return res.status(HTTP_BAD_REQUEST).send('no_such_business');

    // Generate random password
    const password = generatePassword(10, false);

    // Insert the new user
    const [user] = await db('erp.user')
        .insert({
            business_id: business.id,
            type,
            first_name,
            last_name,
            email,
            password: bcrypt.hashSync(password, 10)
        })
        .returning('*');

    // Send email to new user containing their temporary password
    await sendMail(email, 'SOEN Solutions Account', 'new-account', { BUSINESS_NAME: business.name, PASSWORD: password, ACTION: `${env.config.app.url}/login` })

    // Send resulting user object
    res.status(HTTP_CREATED)
        .json(formatTableRow(user));

    await log(`Created account with email ${email}`, 'activity', business.id);

});

/**
 * Used to change the permissions or details of an existing account. A user can only modify users with lower privilege levels than his own.
 */
router.put('/:user_id', checkRequiredPOST('first_name', 'last_name', 'type'), async (req, res) => {

    // Data from body
    const {
        first_name,
        last_name,
        type
    } = req.body;

    // Validate fields
    if (!isValidName(first_name) ||
        !isValidName(last_name) ||
        !isValidEnum(type, userTypes))
        return res.status(HTTP_BAD_REQUEST).send('invalid_fields');

    // Check target user exists
    let targetUser = await db('erp.user')
        .where('deleted', false)
        .where('id', req.params.user_id)
        .where('business_id', req.user.business_id)
        .first();
    if (!targetUser)
        return res.status(HTTP_BAD_REQUEST).send('no_such_user');

    // Check target user is of lower privilege level than requesting user
    if (userTypes.indexOf(targetUser.type) >= userTypes.indexOf(req.user.type))
        return res.status(HTTP_FORBIDDEN).send('insufficient_privilege');

    // Update target user information
    [targetUser] = await db('erp.user')
        .where('id', targetUser.id)
        .update({
            first_name,
            last_name,
            type
        })
        .returning('*');

    // Send resulting user object
    res.json(formatTableRow(targetUser));

    await log(`Updated account with email ${targetUser.email}`, 'activity', req.user.business_id);

});

/**
 * Used to delete multiple existing user accounts. A user can only delete users with lower privilege levels than his own.
 */
router.post('/delete-multiple', checkRequiredPOST('user_ids'), async (req, res) => {

    // Data from body
    const { user_ids } = req.body;

    // Check user ID array
    if (!Array.isArray(user_ids))
        return res.status(HTTP_BAD_REQUEST).send('user_list_format_mismatch');

    // Get user list and check all users exist initially
    const users = await db('erp.user')
        .where('deleted', false)
        .where('business_id', req.user.business_id)
        .whereIn('id', user_ids.map(id => String(id)));
    if (user_ids.sort().join(',') !== users.map(u => u.id).sort().join(','))
        return res.status(HTTP_BAD_REQUEST).send('no_such_users');

    // Check every user in the list has lower privilege level than requesting user
    const userPrivilege = userTypes.indexOf(req.user.type);
    if (users.some(u => userTypes.indexOf(u.type) >= userPrivilege))
        return res.status(HTTP_BAD_REQUEST).send('insufficient_privilege');

    // Delete users from database
    await db('erp.user')
        .whereIn('id', users.map(u => u.id))
        .update({
            deleted: true
        });

    res.sendStatus(HTTP_OK);

    await log(`Deleted ${users.length} accounts: ${users.map(u => u.email).join(', ')}`, 'activity', req.user.business_id);

});

// Just for testing purposes, only included when API runs in a local environment.
if (env.isLocal()) {

    /**
     * Used to delete an account after testing.
     */
    router.delete('/:account_id', async (req, res) => {

        // Check user account exists
        const account = await db('erp.user')
            .where('id', req.params.account_id)
            .first();
        if (!account)
            return res.status(HTTP_BAD_REQUEST).send('no_such_user');

        // Delete user account
        await db('erp.user')
            .where('id', account.id)
            .delete();

        res.sendStatus(HTTP_OK);

    });

}

module.exports = router;
