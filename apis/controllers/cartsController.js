const Cart = require("../models/cart")
const db = require('../config/mongoose-connection')

const addToCart = async (req, res, next) => {
  try {

    const { product_id, price } = req.body
    const uni = req.user.uni

    console.log('uni', uni)

    // const db = await db.db('visi-shop')
    // const collection = await db.collection('vini-shop-mfashion')

    const current_cart = await Cart.findOne({uni: uni})
    // || 'zttwtu'
    console.log('current_cart', current_cart)
    if(current_cart){
      const product = current_cart.carts.find(product => product._id = product_id)
      if(product){
        current_cart.carts[current_cart.carts.findIndex(item => item['_id'] == product._id)].quantity ++
      }else{
        current_cart.carts.push({
          _id: product_id,
          price,
          quantity: 1
        })
      }

      await current_cart.save()

    }else{
      const product = {
        _id: product_id,
        price,
        quantity: 1
      }
      const new_cart = new Cart({
        uni: uni,
        carts: [product]
      })

      console.log(new_cart)

      await new_cart.save()

    }

    res.status(200).json({error: false, message: 'One item added!.'})


  } catch (error) {
    return res.status(400).json({error: true, message: 'Error when add product to cart: ' + error})
  }
}

const getCart = async (req, res, next) => {
  try {
    const uni = req.user.uni

    const cart = await Cart.findOne({uni: uni})

    if(!cart){
      return res.status(400).json({error: true, message: 'Cart not found'})
    }

    res.status(200).json({error: false, message: 'Successfully get cart items', data: cart.carts})

  } catch (error) {
    return res.status(400).json({error: true, message: 'Error when get cart: ' + error})
  }
}

const removeFromCart = async (req, res, next) => {
  try {
    const {products} = req.body

    const uni = req.user.uni
    const current_cart = await Cart.find({uni: uni})
    if(current_cart){
      products.map(product => {

        if(current_cart.carts.includes(product)){
          current_cart.carts.pop(product)
        }

      })
    }

  } catch (error) {
    return res.status(400).json({error: true, message: 'Error when remove product from cart: ' + error})
  }
}

const removeCart = async (req, res, next) => {
  try {
    const {products} = req.body

    const uni = req.user.uni
    const current_cart = await Cart.findAndDelete({uni: uni})

    res.status(200).json({error: false, message: 'Successfully remove cart'})



  } catch (error) {
    return res.status(400).json({error: true, message: 'Error when remove product from cart: ' + error})
  }
}

module.exports = { addToCart, getCart, removeFromCart, removeCart }