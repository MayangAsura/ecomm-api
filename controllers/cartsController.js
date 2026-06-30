const Cart = require("../models/cart")
const db = require('../config/mongoose-connection')
const {pool} = require('../config/postgres')
const { generateRandomString } = require("../utils/generateRandomString")

const addToCart = async (req, res, next) => {
  try {

    const { product_id, quantity, price, variations, cust_uni } = req.body

    // let uni

    // if(req.user?.uni){
    //   uni = req.user.uni
    // }else if(cust_uni) {
    //   uni = cust_uni
    // }else{
    //   uni =
    // }
    const uni = req.user?.uni || cust_uni || generateRandomString(6)

    console.log('uni', uni)

    // const db = await db.db('visi-shop')
    // const collection = await db.collection('vini-shop-mfashion')

    const current_cart = await Cart.findOne({uni: uni})
    // || 'zttwtu'
    console.log('current_cart', current_cart)
    if(current_cart){
      const product = current_cart.carts.find(product => product._id == product_id && product.variations == variations)
      console.log('product', product)
      let cart = {}
      if(product){
        current_cart.carts[current_cart.carts.findIndex(item => item._id == product._id)].quantity ++
        console.log('current_cart', current_cart)

        cart = await Cart.findOneAndUpdate(
          {uni: uni},
          {$set: current_cart},
          {returnDocument: 'after'}
        )

      }else{
        current_cart.carts.push({
          _id: product_id,
          price,
          quantity,
          variations
        })
        cart = await Cart.findOneAndUpdate(
          {uni: uni},
          {$set: current_cart},
          {returnDocument: 'after'}
        )
        // await current_cart.save()
      }

      if(cart){
        return res.status(200).json({error: false, message: 'Cart updated successfully'})
      }else{
        return res.status(400).json({error: true, message: 'Error when updated cart'})
      }


    }else{
      const product = {
        _id: product_id,
        price,
        quantity,
        variations
      }


      const new_cart = new Cart({
        uni: uni,
        carts: [product]
      })

      console.log(new_cart)

      await new_cart.save()

    }

    res.status(200).json({error: false, message: 'One item added!.', uni})


  } catch (error) {
    return res.status(400).json({error: true, message: 'Error when add product to cart: ' + error})
  }
}

const increaseQuantity = async (req, res, next) => {
  try {

    const { product_id } = req.body
    const uni = req.user.uni

    console.log('uni', uni)

    // const db = await db.db('visi-shop')
    // const collection = await db.collection('vini-shop-mfashion')

    const current_cart = await Cart.findOne({uni: uni})
    // || 'zttwtu'
    console.log('current_cart', current_cart)
    if(!current_cart){
      return res.status(400).json({error: true, message: 'User cart not found'})
    }
    const product = current_cart.carts.find(product => product._id = product_id)

    if(!product){
      return res.status(400).json({error: true, message: 'Product not found'})
    }

    current_cart.carts[current_cart.carts.findIndex(item => item['_id'] = product._id)].quantity ++
    console.log('carts', current_cart.carts)

    const cart = await Cart.findOneAndUpdate(
      {uni: uni},
      {$set: current_cart},
      {returnDocument: 'after'}
    )
    // await current_cart.save()

    if(cart){
      res.status(200).json({error: false, message: 'One item added!.'})
    }else{
      res.status(400).json({error: true, message: 'Error when increase quantity'})
    }


  } catch (error) {
    return res.status(400).json({error: true, message: 'Error when add product to cart: ' + error})
  }
}

const decreaseQuantity = async (req, res, next) => {
  try {

    const { product_id } = req.body
    const uni = req.user.uni

    console.log('uni', uni)

    // const db = await db.db('visi-shop')
    // const collection = await db.collection('vini-shop-mfashion')

    const current_cart = await Cart.findOne({uni: uni})
    // || 'zttwtu'
    console.log('current_cart', current_cart)
    if(!current_cart){
      return res.status(400).json({error: true, message: 'User cart not found'})
    }
    const product = current_cart.carts.find(product => product._id = product_id)

    if(!product){
      return res.status(400).json({error: true, message: 'Product not found'})
    }
    console.log('product', product, product.quantity === 1)

    const carts = current_cart.carts.filter(product => product._id != product_id)
    console.log('carts', carts)

    let updated_cart = {}
    if(product.quantity === 1){
      // updated_cart = {...current_cart, }
      updated_cart = current_cart.carts = []
    }else{
      updated_cart = current_cart.carts[current_cart.carts.findIndex(item => item._id = product._id)].quantity --
    }

    // console.log('current_cart.carts', current_cart.carts, )

    const cart = await Cart.findOneAndUpdate(
      {uni: uni},
      {$set: updated_cart},
      {returnDocument: 'after'}
    )
    // await current_cart.save()

    if(cart){
      return res.status(200).json({error: false, message: 'One item updated!.'})
    }else{
      return res.status(400).json({error: true, message: 'Error when decrease quantity'})
    }


  } catch (error) {
    return res.status(400).json({error: true, message: 'Error when add product to cart: ' + error})
  }
}

const getCart = async (req, res, next) => {
  try {
    // console.log('body', req.body)
    const uni = req.user? req.user.uni : req.headers.uni

    // if(!req.user){

    // }
    console.log('uni', uni)

    const cart = await Cart.findOne({uni: uni})

    if(!cart){
      return res.status(200).json({error: false, message: 'Successfully get cart items', data: []})
    }
    console.log('carts', cart)

    const items = await Promise.all(
      cart.carts.map(async product => {
      const {rows} = await pool.query(`SELECT name, image FROM products WHERE id = $1 AND deleted_at is null`, [product._id])
      if(rows){

        // console.log('product', product)
        // product.name = rows[0].name
        // product.image = rows[0].image
        {return {
          _id : product._id,
          price: product.price,
          quantity: product.quantity,
          name: rows[0]?.name,
          image: rows[0]?.image
        }}
      }
    })
    )
    // console.log('product', product)

    console.log('cart', items)

    res.status(200).json({error: false, message: 'Successfully get cart items', data: items})

  } catch (error) {
    return res.status(400).json({error: true, message: 'Error when get cart: ' + error})
  }
}

const removeFromCart = async (req, res, next) => {
  try {
    const {product_id} = req.body

    const uni = req.user.uni
    const current_cart = await Cart.find({uni: uni})
    if(current_cart){
      console.log('current_cart', current_cart[0].carts)
      // products.map(product => {

        const product = current_cart[0].carts.find(cart => cart._id == product_id)

        if(!product){
          // current_cart.carts.includes(product_id)
          return res.status(400).json({error: true, message: 'Product not found'})

          // current_cart.carts.map(cart => {
          //   current_cart.carts[product].splice(product, 1)
          // })
        }

        current_cart[0].carts = current_cart[0].carts.filter(cart => cart._id != product_id)

        const cart = await Cart.findOneAndUpdate(
          {uni: uni},
          {$set: current_cart[0]},
          {returnDocument: 'after'}
        )

        if(cart){
          res.status(200).json({error: false, message: 'Successfully remove product from cart'})
        }else{
          return res.status(400).json({error: true, message: 'Error remove product from cart'})
        }

      // })
    }

  } catch (error) {
    return res.status(400).json({error: true, message: 'Error when remove product from cart: ' + error})
  }
}

const removeCart = async (req, res, next) => {
  try {
    // const {products} = req.body

    const uni = req.user.uni
    const current_cart = await Cart.findOneAndDelete({uni: uni})

    res.status(200).json({error: false, message: 'Successfully remove cart'})



  } catch (error) {
    return res.status(400).json({error: true, message: 'Error when remove product from cart: ' + error})
  }
}

module.exports = { addToCart, increaseQuantity, decreaseQuantity, getCart, removeFromCart, removeCart }