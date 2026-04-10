const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
  const token = req.cookie.token

  if(!token){
    res.status(400).json({error: true, message: 'Token not found'})
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if(err) res.status(400).json({error: true, message: 'Token invalid'})
    req.user = user

    next()
  })
}

const verifyUser = (req, res, next) => {
  verifyToken(req, res, next, () => {
    if(req.user.id === req.param.id || req.user.is_admin){
      next()
    }else{
      res.status(400).json({error: true, message: 'You are not authorized'})
    }
  })
}

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, next, () => {
    if(req.user.is_admin){
      next()
    }else{
      res.status(400).json({error: true, message: 'You are not admin'})
    }
  })
}

module.exports = {verifyToken, verifyUser, verifyAdmin}