const passport = require('passport');
const jwt = require('jsonwebtoken');
const uuid = require('uuid').v4;

const env = require('../../config/environment');

const db = require('./database.js');

module.exports = {
    async issueRefreshJWT(user) {
        // Generate token UUID
        let refreshUUID = uuid();

        // Insert new token
        await db('erp.user_token')
            .insert({
                user_id: user.id,
                refresh_token: refreshUUID
            });

        // Limit to max 5 tokens per user
        const MAX_TOKENS = 5;

        const tokens = await db('erp.user_token')
            .where('user_id', user.id)
            .orderBy('created_at', 'desc');

        // Delete oldest tokens to keep max of 5
        const tokensToRemove = tokens.slice(MAX_TOKENS);
        if (tokensToRemove.length > 0) {
            await db('erp.user_token')
                .whereIn('refresh_token', tokensToRemove.map(t => t.refresh_token))
                .delete();
        }

        // Return signed JWT token
        return jwt.sign({ sub: refreshUUID }, env.config.auth.jwt_secret);
    },
    issueAuthJWT(user) {
        return jwt.sign({ sub: user.id }, env.config.auth.jwt_secret, { expiresIn: '10m' });
    },
    authenticate(req, res, next) {
        passport.authenticate('jwt', { session: false }, (err, user) => {
            if (err)
                return next(err);
            if (!user)
                return res.sendStatus(HTTP_UNAUTHORIZED);
            req.user = user;
            next();
        })(req, res, next);
    }
};
