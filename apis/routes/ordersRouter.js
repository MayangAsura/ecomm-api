const express = require('express')
const {getOrders, getOrderHistories, getOrderHistoryById, getOrderById, getLatestOrders} = require('../controllers/ordersController')
const { verifyUser, verifyAdmin } = require('../utils/verifyToken')

const router = express.Router()

router.get('/', getOrders)
router.get('/latest', getLatestOrders)
router.get('/:id', verifyAdmin, getOrderById)
router.get('/histories', verifyUser, getOrderHistories)
// router.get('/histories/:id', verifyUser, getOrderHistoryById)

module.exports = router