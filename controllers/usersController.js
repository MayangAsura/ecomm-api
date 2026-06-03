const bcrypt = require('bcrypt')
const {pool} = require('../config/postgres')

const updateProfile = async (req, res, next) => {

  try {

    const {full_name, email, phone_number, password,} = req.body

    const uni = req.user.uni

    if(email){
      const {rows} = await pool.query('SELECT email FROM users WHERE uni != $1', [uni])

      if(rows){
        return res.status(400).json({error: true, message: 'Email tidak tersedia'})
      }else{
        const salt = await bcrypt.genSalt(10)
        const hash_password = await bcrypt.hash(password, salt)
        const {rows} = await pool.query('UPDATE users SET full_name = $1, email = $2, phone_number = $3, password = $4 WHERE uni = $5', [full_name, email, phone_number, hash_password, uni])

        if(rows){
          res.status(200).json({error: false, message: 'Successfully update profile'})
        }

      }

    }

  } catch (error) {
    return res.status(400).json({error: true, message: "Error when update profile: " + error })
  }
}

module.exports = { updateProfile }