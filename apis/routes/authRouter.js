const express = require('express')
const {registUser, loginUser} = require('../controllers/authController.js')

const router = express.Router()

router.post('/register', registUser)
router.post('/login', loginUser)

module.exports = router


