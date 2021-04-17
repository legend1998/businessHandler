const { isEmpty } = require('./utils.js');
const { userTypes } = require('./enums.js');

function checkRequiredAttributes(requestKey, ...requiredAttributes) {
    return (req, res, next) => {
        for (let i = 0; i < requiredAttributes.length; i++) {
            const param = req[requestKey][requiredAttributes[i]];
            if (isEmpty(param))
                return res.status(HTTP_BAD_REQUEST).send(`Missing parameter: ${requiredAttributes[i]}`);
        }
        next();
    };
}

module.exports = {
    checkRequiredGET(...requiredAttributes) {
        return checkRequiredAttributes('query', ...requiredAttributes);
    },
    checkRequiredPOST(...requiredAttributes) {
        return checkRequiredAttributes('body', ...requiredAttributes);
    },
    hasPrivilegeLevel(type) {
        return (req, res, next) => {
            if (userTypes.indexOf(req.user.type) < userTypes.indexOf(type))
                return res.sendStatus(HTTP_UNAUTHORIZED);
            next();
        };
    }
};
