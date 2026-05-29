const express = require('express')
const {getCustomers, getCustomerById, updateCustomer, getProfile, updateProfile} = require('../controllers/customersController')
const { verifyToken, verifyUser, verifyAdmin } = require('../utils/verifyToken')

const router = express.Router()

// router.get('/me', getProfile)
// router.patch('/me', verifyToken, updateProfile)
router.get('/', getCustomers)
router.patch('/', verifyAdmin, updateProfile)
router.get('/:id', verifyAdmin, getCustomerById)

module.exports = router
