const express = require('express')
const {getCustomers, getCustomerById, getProfile, updateProfile} = require('../controllers/customersController')
const { verifyToken, verifyUser } = require('../utils/verifyToken')

const router = express.Router()

router.get('/', getCustomers)
router.patch('/', verifyUser, updateProfile)
router.get('/:id', getCustomerById)
router.get('/me', getProfile)

module.exports = router
