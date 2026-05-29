const mongoose = require('mongoose')

const cartModel = mongoose.Schema({
  uni: {
    type: String,
    trim: true,
    required: true
  },
  carts: {
    type: [Object],
    trim: true,
    required: true
  }
  },
  {
    timestamp: true
  }
)

module.exports = mongoose.model('Cart', cartModel)