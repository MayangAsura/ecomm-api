const express = require('express')
const user = require('../models/user')
const { getCart, addToCart, increaseQuantity, decreaseQuantity, removeCart, removeFromCart } = require('../controllers/cartsController')
const { verifyUser } = require('../utils/verifyToken')


const router = express.Router()

router.get('/', getCart)
router.post('/add', addToCart)
router.post('/remove', verifyUser, removeFromCart)
router.delete('/reset', verifyUser, removeCart)
router.post('/increase', verifyUser, increaseQuantity)
router.post('/decrease', verifyUser, decreaseQuantity)

// router.post('/add/:productId', async (req, res) => {
//     // const user = await user.find({username: req.user.username})
//     const product = await product.find({slug: req.params.productId})

//     const { id } = req.params.productId
//     const uni = req.user.uni

//     const {rows} = await pool.query('SELECT * FROM products WHERE id = $1', [id])

//     const user_carts = await Cart.find({uni: uni})


//     user_carts.carts.push(rows[0].id)

//     user_carts.save()

// })

module.exports = router