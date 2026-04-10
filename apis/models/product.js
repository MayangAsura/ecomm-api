const mongoose = require('mongoose')

const productModel = mongoose.Schema({
    image : String,
    name : String,
    description: String,
    price : Number,
    originalPrice: Number,
    discount : {
        type: Number,
        default: 0
    },
    bgColor : String,
    panelColor : String,
    textColor : String,
    stock: Number,
    category: String,
    sku: String,
    colors: {
        type: [String],
        default: []
    }
})

module.exports = mongoose.model('Product', productModel)