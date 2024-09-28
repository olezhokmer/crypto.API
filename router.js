const express = require('express');
const router = express.Router();

const service = require('./service');

router.get(
    '/cryptos', 
    (req, res) =>
    service
    .getCryptos(req.query.page, req.query.limit, req.query.search, req.query.sortBy)
    .then(data => res.json(data))
);

router.get(
    '/crypto/:id', 
    (req, res) =>
    service
    .getCryptoInfo(req.params.id)
    .then(data => res.json(data))
);

router.get(
    '/history', 
    (req, res) =>
    service
    .getHistory(req.query.pair, req.query.interval)
    .then(data => res.json(data))
);

module.exports = router;
