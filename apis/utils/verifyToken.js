const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
  const token = req.cookies.token

  console.log('token', token)

  if(!token){
    return res.status(401).json({error: true, message: 'Token not found'})
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if(err) return res.status(400).json({error: true, message: 'Token invalid'})

    console.log('user', user)
    req.user = user

    next()
  })
}

const verifyUser = (req, res, next) => {
  verifyToken(req, res, next, () => {
    if(req.user?.uni !== req.params?.uni || req.user.is_admin === true){
      next()
    }else{
      res.status(400).json({error: true, message: 'You are not authorized'})
    }
  })
}

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, next, () => {
    if(req.user.user_type === 'admin'){
      next()
    }else{
      res.status(400).json({error: true, message: 'You are not admin'})
    }
  })
}

module.exports = {verifyToken, verifyUser, verifyAdmin}