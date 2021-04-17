const { isLocal } = require('../../config/environment.js');
const { log } = require('./utils.js');

module.exports = async (err, req, res, next) => {
    let stack = Array.isArray(err.stack) ? err.stack.split('\n').map(line => line.trim()) : [];
    stack.shift();
    await log(`Request failed with code ${HTTP_INTERNAL_SERVER_ERROR} - ${req.originalUrl}\n\n${err.message}\n${stack.join('\n')}`, 'error', req.user ? req.user.business_id : null);

    if (isLocal()) {
        res.status(HTTP_INTERNAL_SERVER_ERROR)
            .json({
                error: err.message,
                stack
            });
    } else {
        res.sendStatus(HTTP_INTERNAL_SERVER_ERROR);
    }

    next(err);
};
