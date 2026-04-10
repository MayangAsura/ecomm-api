const mongoose = require('mongoose')

// mongoose.connect('mongodb://127.0.0.1:27017/scatch') migrate to config/mongoose-connection

const ownerSchema = mongoose.Schema({
    fullname: {
        type: String,
        minLength: 3,
        trim: true,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    products: {
        type: Array,
        default: [],
        required: false
    },
    picture: {
        type: String,
        required: false
    },
    gstin: {
        type: String,
        required: false
    },
})

module.exports = mongoose.model('Owner', ownerSchema)