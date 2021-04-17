const express = require('express');

const currencies = require('../helpers/currencies.json');
const { authenticate } = require('../helpers/auth-jwt.js');

const router = express();

router.use(authenticate);

router.get('/', (req, res) => {
    res.json(currencies);
});

module.exports = router;
