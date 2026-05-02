const express = require('express')
const {registUser, loginUser, resetPassword, getSession} = require('../controllers/authController.js')
const { route } = require('./ownersRouter.js')
const { verifyToken } = require('../utils/verifyToken.js')

const router = express.Router()

router.post('/register', registUser)
router.get('/session', verifyToken, getSession)
router.post('/login', loginUser)
router.patch('/reset-password', verifyToken, resetPassword)

module.exports = router


