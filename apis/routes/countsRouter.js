const express = require('express')
const {countProducts, countOrders, countCustomers, countCompleteOrders} = require('../controllers/countsController')

const router = express.Router()

router.get('/products', countProducts)
router.get('/orders', countOrders)
router.get('/customers', countCustomers)
router.get('/complete-orders', countCompleteOrders)

module.exports = router