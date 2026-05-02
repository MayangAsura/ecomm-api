const express = require('express')
const {searchProduct} = require('../controllers/searchController')

const router = express.Router()

router.get('/search', searchProduct)

module.exports = router