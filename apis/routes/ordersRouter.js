const express = require('express')
const {getOrders, getOrderHistories, getOrderHistoryById} = require('../controllers/ordersController')
const { verifyUser } = require('../utils/verifyToken')

const router = express.Router()

router.get('/', getOrders)
router.get('/histories', verifyUser, getOrderHistories)
router.get('/histories/:id', verifyUser, getOrderHistoryById)

module.exports = router