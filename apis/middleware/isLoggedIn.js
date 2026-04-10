const jwt = require('jsonwebtoken')

module.exports = async (req, res, next) => {
    if(!req.cookie.token){
        req.flash('error')
        res.json({message: 'You are not allowed'})
        return res.redirect('/')
    }
    
    try {
        const token = req.cookie.token
        const JWT_SECRET = process.env.JWT_SECRET
        const decoded = jwt.verify(token, JWT_SECRET)
        const user = await userModel.findOne({email: decoded.email}).select("-password")

        req.user = user
        
        next()
    } catch (error) {
        res.flash("error! Something when wrong", error)
    }
    const token = res.he
}