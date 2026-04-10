const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET

const generateToken = (user) => {
    
    return token = jwt.sign({email: user.email, id: user._id}, JWT_SECRET)
}

module.exports.generateToken = generateToken