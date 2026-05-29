const express = require('express')
const {registUser, loginUser, logoutUser, resetPassword, getSession} = require('../controllers/authController.js')
const { route } = require('./ownersRouter.js')
const { verifyToken, verifyUser } = require('../utils/verifyToken.js')

const router = express.Router()

router.post('/register', registUser)
router.get('/session', verifyToken, getSession)
router.post('/login', loginUser)
router.post('/logout', logoutUser)
router.patch('/reset-password', verifyToken, resetPassword)

module.exports = router


