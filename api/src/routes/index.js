const express = require('express');

const { getRequestIP } = require('../helpers/utils.js');

const { version } = require('../../package.json');

const router = express();

const now = new Date();
router.get('/', (req, res) => {
    res.json({
        version: `v${version}`,
        date: now,
        ip: getRequestIP(req)
    });
});

module.exports = router;
