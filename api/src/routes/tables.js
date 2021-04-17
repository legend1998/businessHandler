const express = require('express');

const db = require('../helpers/database.js');
const { authenticate } = require('../helpers/auth-jwt.js');

const router = express();

router.get('/', authenticate, async (req, res) => {

    const tables = await db('information_schema.tables')
        .select();

    res.json(tables
        .filter(t => t.table_schema === 'erp')
        .map(t => `${t.table_schema}.${t.table_name}`));

});

module.exports =  router;
