'use strict'
const express = require('express')
const router = express.Router()
const db = require('../models/mongodb')
const config = require('config')
const { validationResult, query } = require('express-validator/check')

router.get('/:tx', async function (req, res, next) {
    try {
        let tx = await db.Transaction.findOne({
            tx: req.params.tx
        })

        return res.json(tx)
    } catch (e) {
        return next(e)
    }
})

router.get('/voter/:voter', [
    query('limit')
        .isInt({ min: 0, max: 200 }).optional().withMessage('limit should greater than 0 and less than 200')
], async function (req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return next(errors.array())
    }

    let limit = (req.query.limit) ? parseInt(req.query.limit) : 200
    let skip
    skip = (req.query.page) ? limit * (req.query.page - 1) : 0
    try {
        const total = db.Transaction.countDocuments({
            smartContractAddress: config.get('blockchain.validatorAddress'),
            voter: (req.params.voter || '').toLowerCase()
        })

        let txs = await db.Transaction.find({
            smartContractAddress: config.get('blockchain.validatorAddress'),
            voter: (req.params.voter || '').toLowerCase()
        }).sort({ createdAt: -1 }).limit(limit).skip(skip)
        return res.json({
            items: txs,
            total: await total
        })
    } catch (e) {
        return next(e)
    }
})

router.get('/candidate/:candidate', [
    query('limit')
        .isInt({ min: 0, max: 200 }).optional().withMessage('limit should greater than 0 and less than 200')
], async function (req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return next(errors.array())
    }

    let limit = (req.query.limit) ? parseInt(req.query.limit) : 200
    let skip

    skip = (req.query.page) ? limit * (req.query.page - 1) : 0

    try {
        const total = db.Transaction.countDocuments({
            smartContractAddress: config.get('blockchain.validatorAddress'),
            candidate: (req.params.candidate || '').toLowerCase()
        })
        let txs = await db.Transaction.find({
            smartContractAddress: config.get('blockchain.validatorAddress'),
            candidate: (req.params.candidate || '').toLowerCase()
        }).sort({ createdAt: -1 }).limit(limit).skip(skip)
        return res.json({
            items: txs,
            total: await total
        })
    } catch (e) {
        return next(e)
    }
})

module.exports = router
