const express = require('express');

const db = require('../helpers/database.js');
const { authenticate } = require('../helpers/auth-jwt.js');
const { formatTable } = require('../helpers/utils.js');

const router = express();

router.use(authenticate);

router.get('/', async (req, res) => {

    const logs = await db('erp.system_log')
        .where('business_id', req.user.business_id)
        .orderBy('created_at', 'desc');
    formatTable(logs);

    res.json(logs);

});

module.exports = router;
