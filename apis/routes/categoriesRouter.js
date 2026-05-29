const express = require('express')
const { createCategory, updateCategory, getCategories, getCategoryById } = require('../controllers/categoryController')
const { verifyAdmin } = require('../utils/verifyToken')

const router = express.Router()

router.post('/', createCategory)
router.get('/', getCategories)
router.get('/:id', getCategoryById)
router.patch('/:id', verifyAdmin, updateCategory)

module.exports = router