const express = require('express')
const user = require('../models/user')

const router = express.Router()

router.post('/add/:productId', async (req, res) => {
    const user = await user.find({username: req.user.username})
    const product = await product.fing({slug: req.params.productId})
    
    user.cart.push(product._id)

    user.save()

})

module.exports = router