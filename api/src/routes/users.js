const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const uuid = require('uuid').v4;
const axios = require('axios');

const env = require('../../config/environment.js');

const db = require('../helpers/database.js');
const { sendMail } = require('../helpers/email.js');
const { formatTableRow, log } = require('../helpers/utils.js');
const { issueAuthJWT, issueRefreshJWT } = require('../helpers/auth-jwt.js');
const { checkRequiredPOST } = require('../helpers/middleware.js');
const { authenticate } = require('../helpers/auth-jwt.js');
const { isValidName, isValidEmail, isValidPassword, isValidEnum } = require('../helpers/validation.js');
const { currencies } = require('../helpers/enums.js');

const router = express();

/**
 * Used to find the user corresponding to a refresh token.
 *
 * @param refreshToken The refresh token for which to find the given user.
 * @returns A promise resolving to the user object if found.
 *          Null if no user matching the token was found.
 *          Null if the refresh token is invalid.
 */
async function findUserAndInvalidateToken(refreshToken) {
    // Verify refresh token
    let payload;
    try {
        payload = jwt.verify(refreshToken, env.config.auth.jwt_secret);
    } catch (err) {
        return null;
    }

    try {
        // Find user
        const user = await db('erp.user_token as t')
            .select('u.*', 't.refresh_token')
            .innerJoin('erp.user as u', 'u.id', 't.user_id')
            .where('t.refresh_token', payload.sub)
            .where('u.deleted', false)
            .first();
        if (!user)
            return null;

        // Invalidate token
        await db('erp.user_token')
            .where('refresh_token', user.refresh_token)
            .delete();

        // Remove token from user object
        delete user.refresh_token;

        return user;
    } catch (err) {
        return null;
    }
}

/**
 * Used to authenticate a user through email and password login.
 */
router.post('/login', checkRequiredPOST('email', 'password'), async (req, res) => {

    // Required fields
    const { email, password } = req.body;

    // Find user, if none, unauthorized
    const user = await db('erp.user')
        .where('deleted', false)
        .where('email', email)
        .first();
    if (!user)
        return res.sendStatus(HTTP_UNAUTHORIZED);

    // Compare passwords, if no match, unauthorized
    if (!bcrypt.compareSync(password, user.password)) {
        await log(`Failed login attempt ${email}`, 'warning', user.business_id);
        return res.sendStatus(HTTP_UNAUTHORIZED);
    }

    // Find business
    const business = await db('erp.business')
        .where('deleted', false)
        .where('id', user.business_id)
        .first();

    // Issue new tokens
    const accessToken = issueAuthJWT(user);
    const refreshToken = await issueRefreshJWT(user);

    // Remove sensitive information from objects
    formatTableRow(user);
    formatTableRow(business);

    res.json({
        user: {
            ...user,
            access_token: accessToken,
            refresh_token: refreshToken
        },
        business
    });

    await log(`User login ${email}`, 'info', user.business_id);

});

/**
 * Used to retrieve the information about the currently logged in user with a given authentication token.
 */
router.get('/current-user', authenticate, async (req, res) => {

    // Find business
    const business = await db('erp.business')
        .where('deleted', false)
        .where('id', req.user.business_id)
        .first();

    res.json({
        user: formatTableRow(req.user),
        business: formatTableRow(business)
    });

});

/**
 * Used to refresh an expired authentication token.
 */
router.post('/refresh-token', checkRequiredPOST('refresh_token'), async (req, res) => {

    // Data from body
    const { refresh_token } = req.body;

    // Find user from token
    const user = await findUserAndInvalidateToken(refresh_token);
    if (!user)
        return res.status(HTTP_BAD_REQUEST).send('invalid_refresh_token');

    // Issue new tokens
    const accessToken = issueAuthJWT(user);
    const newRefreshToken = await issueRefreshJWT(user);

    // Return both tokens
    res.json({
        access_token: accessToken,
        refresh_token: newRefreshToken
    });

});

/**
 * Used to revoke and invalidate a given refresh token.
 */
router.post('/revoke-token', checkRequiredPOST('refresh_token'), async (req, res) => {

    const { refresh_token } = req.body;

    // Find user and invalidate token
    const user = await findUserAndInvalidateToken(refresh_token);
    if (!user)
        return res.status(HTTP_BAD_REQUEST).send('invalid_refresh_token');

    // Respond with OK
    res.sendStatus(HTTP_OK);

    await log(`User logout ${user.email}`, 'info', user.business_id);

});

/**
 * Used to send a verification email when a password recovery is requested.
 */
router.post('/send-verification', checkRequiredPOST('email'), async (req, res) => {

    // Return OK if no user found to prevent checking if accounts exist
    const user = await db('erp.user')
        .where('deleted', false)
        .where('email', req.body.email)
        .first();
    if (!user)
        return res.sendStatus(HTTP_OK);

    // Create new reset GUID
    const resetGUID = uuid();
    await db('erp.user')
        .where('id', user.id)
        .update({
            reset_guid: resetGUID
        });

    // Send reset email
    await sendMail(user.email, 'SOEN Solutions Password Reset', 'forgot-password', { ACTION: `${env.config.app.url}/reset-password/${resetGUID}` });

    res.sendStatus(HTTP_OK);

});

/**
 * Used to reset a user's password after following the reset password email.
 */
router.post('/reset-password', checkRequiredPOST('reset_guid', 'password'), async (req, res) => {

    // Check if GUID valid
    const user = await db('erp.user')
        .where('deleted', false)
        .where('reset_guid', req.body.reset_guid)
        .first();
    if (!user)
        return res.status(HTTP_BAD_REQUEST).send('invalid_reset_guid');

    // Change user password
    await db('erp.user')
        .where('id', user.id)
        .update({
            password: bcrypt.hashSync(req.body.password, 10),
            reset_guid: uuid()
        });

    res.sendStatus(HTTP_OK);

    await log(`User password reset ${user.email}`, 'info', user.business_id);

});

/**
 * Used to create an owner account and business object in the db simultaneously.
 * Pre-conditions: User email is unique.
 * Post-conditions: Both a business object and an owner account for that business are created.
 */
router.post('/register-business', checkRequiredPOST('first_name', 'last_name', 'email', 'password', 'business_name', 'currency'), async (req, res) => {

    // Data from body
    const {
        first_name,
        last_name,
        email,
        password,
        business_name,
        currency,
        captcha
    } = req.body;

    // Validate fields
    if (!isValidName(first_name) ||
        !isValidName(last_name) ||
        !isValidEmail(email) ||
        !isValidPassword(password) ||
        !isValidName(business_name) ||
        !isValidEnum(currency, currencies))
        return res.status(HTTP_BAD_REQUEST).send('invalid_fields');

    // Check email is not taken
    const existingUser = await db('erp.user')
        .where('deleted', false)
        .where('email', email)
        .first();
    if (existingUser)
        return res.status(HTTP_BAD_REQUEST).send('email_taken');

    // Verify Captcha
    if (!env.isLocal()) {
        try {
            const data = new URLSearchParams();
            data.append('secret', env.config.captcha.secret);
            data.append('response', captcha);
            const resp = await axios.post('https://www.google.com/recaptcha/api/siteverify', data, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            if (!resp.data.success)
                return res.status(HTTP_BAD_REQUEST).send('invalid_recaptcha');
        } catch {
            return res.status(HTTP_BAD_REQUEST).send('invalid_recaptcha');
        }
    }

    // Insert user
    const [userID] = await db('erp.user')
        .insert({
            first_name,
            last_name,
            email,
            password: bcrypt.hashSync(password, 10),
            type: 'owner'
        })
        .returning('id')

    // Insert business
    const [business] = await db('erp.business')
        .insert({
            owner_id: userID,
            name: business_name,
            currency
        })
        .returning('*');

    // Update user with correct business ID
    const [updatedUser] = await db('erp.user')
        .where('id', userID)
        .update({
            business_id: business.id
        })
        .returning('*');

    // Return new user and business
    res.json({
        user: formatTableRow(updatedUser),
        business: formatTableRow(business)
    });

    await log(`Business registered`, 'activity', business.id);

});

// Just for testing purposes, only included when API runs in a local environment.
if (env.isLocal()) {

    /**
     * Used to delete a business and its owner account after testing.
     */
    router.post('/delete-business', checkRequiredPOST('business_id'), async (req, res) => {

        // Check business exists
        const business = await db('erp.business')
            .where('id', req.body.business_id)
            .first();
        if (!business)
            return res.status(HTTP_BAD_REQUEST).send('no_such_business');

        // Delete business
        await db('erp.business')
            .where('id', business.id)
            .delete();

        // Delete user
        await db('erp.user')
            .where('id', business.owner_id)
            .delete();

        res.sendStatus(HTTP_OK);

    });

}

module.exports = router;
