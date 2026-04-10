const mongoose = require('mongoose')

// mongoose.connect(process.env.MONGO_URI) migrate to config/mongoose-connection

const userModel = mongoose.Schema({
    fullname : {
        type: String,
        minLength: 3,
        trim: true,
        required: true
    },
    email : {
        type: String,
        required: true
    },
    password : {
        type: String,
        required: true
    },
    cart : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: false
    },
    isAdmin : {
        type: Boolean,
        required: true
    },
    orders : {
        type: Array,
        default: [],
        required: false
    },
    contact : {
        type: Number,
        required: true
    },
    picture : {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('User', userModel)