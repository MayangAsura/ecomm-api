const express = require('express')
const {historyOrder} = require('../controllers/historyOrdersController')
const { verifyUser } = require('../utils/verifyToken')

const router = express.Router()

router.get('/', historyOrder)
// verifyUser, 

module.exports = router