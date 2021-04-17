const { isLocal } = require('../../config/environment.js');
const db = require('./database.js');
const { isValidEnum } = require('./validation.js');
const { logSeverities } = require('./enums.js');
const currencies = require('./currencies.json');

function formatTableRow(row) {
    if (!isLocal()) {
        delete row.password;
        delete row.deleted;
        delete row.reset_guid;
    }
    return row;
}

function getTimestampFormat(withTimezone) {
    return withTimezone ? 'YYYY-MM-DD HH:mm:ss.SSSZ' : 'YYYY-MM-DD HH:mm:ss';
}

module.exports = {
    isEmpty(value) {
        return value === undefined || value === null || value === '';
    },
    getRequestIP(req) {
        if (req.connection.remoteAddress)
            return req.connection.remoteAddress.replace('::ffff:', '').replace('::1', '127.0.0.1');
        return '';
    },
    formatTableRow,
    formatTable(table) {
        for (const row of table){
            formatTableRow(row);
        }
        return table;
    },
    hasKeys(obj, ...keys) {
        return keys.every(k => obj.hasOwnProperty(k));
    },
    async log(msg, severity = logSeverities[0], businessId = null) {
        if (!isValidEnum(severity, logSeverities))
            return;
        await db('erp.system_log')
            .insert({
                severity,
                message: msg,
                ...businessId && { business_id: businessId }
            })
    },
    convertAmount(businessCurrencyName, currencyName, amount) {
        const currency = currencies[currencyName];
        const businessCurrency = currencies[businessCurrencyName];
        return amount * currency.conversion_rate / businessCurrency.conversion_rate;
    },
    deepCopy(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    getTimestampFormat,
    valueTimestamptz(date) {
        const format = getTimestampFormat(true);
        return moment.isMoment(date) ? data.format(format) : moment(date).format(getTimestampFormat(true));
    }
};
