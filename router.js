const express = require('express');
const router = express.Router();

const service = require('./service');

router.get(
    '/cryptos', 
    (req, res) =>
    service
    .getCryptos(req.query.page, req.query.limit)
    .then(data => res.json(data))
);

module.exports = router;
