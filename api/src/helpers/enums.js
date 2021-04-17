const currencies = require('./currencies.json');

module.exports = {
    currencies: Object.keys(currencies),
    userTypes: [
        'employee',
        'manager',
        'admin',
        'owner'
    ],
    locationTypes: [
        'supplier',
        'manufacture',
        'warehouse',
        'store'
    ],
    itemTypes: [
        'raw-material',
        'assembly-part',
        'end-product'
    ],
    logSeverities: [
        'info',
        'activity',
        'warning',
        'error'
    ],
    shipmentTypes: [
        'daily',
        'weekly',
        'bi-weekly',
        'monthly'
    ],
    productionRateFrequencies: [
        'daily',
        'weekly',
        'bi-weekly',
        'monthly',
        'annually'
    ]
}
