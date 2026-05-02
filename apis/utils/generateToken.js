const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET

const generateToken = (user) => {

    return token = jwt.sign({email: user.email, uni: user.uni, id: user._id, is_admin: user.is_admin}, JWT_SECRET, {expiresIn: '24h'})
}

module.exports.generateToken = generateToken