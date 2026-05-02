const express = require('express')
const {getCities} = require('../controllers/citiesController')

const router = express.Router()

router.get('/', getCities)

module.exports = router