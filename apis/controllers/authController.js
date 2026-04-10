// import userModel from '../models/user.js'
// import { generateToken } from '../utils/generateToken.js'
const { generateToken } = require('../utils/generateToken.js')

const registUser = async (req, res) => {
    const { full_name, email, password } = req.body

    const { rows } = await pool.query('SELECT email FROM users WHERE email = $1', [email])
    // const user = await userModel.find({email: email})
    if(rows[0])
        return res.status(400).json({message: 'Email not available'})

    try {
        await bcrypt.genSalt(10, async (err, salt) => {
            await bcrypt.hash(password, salt, async (err, hash) =>{
                if(err) return res.json(err.message)
                else{
                    const { rows } = await pool.query('INSERT INTO users (full_name, email, password, user_type) VALUES ($1, $2, $3, $4)', [full_name, email, password, 'learner'])

                    if(rows[0]){
                        const { rows } = await pool.query('INSERT INTO customers (full_name, email) VALUES ($1, $2)', [full_name, email ])

                        if(rows[0]){
                            const token = generateToken(user)
                            res.cookie("token", token)
                            res.send("user registered successfully")

                        }
                    }
                    // const user = await userModel.create({
                    //     fullname,
                    //     email,
                    //     hash
                    // })

                }
            })

        })



    } catch (error) {
        return res.json({message: error})
    }
}

const loginUser = async (req, res) => {

    const { email, password } = req.body

    try {
        const {rows} = await pool.query("SELECT email FROM users WHERE email = $1", [email])
        // const user = await userModel.findOne({email: email})
        if(!rows[0]) return res.send("User not found")

        bcrypt.compare(password, rows[0].password, (err, result) => {
            if(result){
                const token = generateToken(user)
                res.cookie('token', token)
                res.send('You are logged in')

            }
        })
    } catch (error) {
        res.json({message: error.message})
    }
    // res.json(user)
}

const logoutUser = async (req, res) => {

}

const resetPassword = async (req, res) => {
    try {

        const { password } = req.body

        const uni = req.user.uni

        const salt = await bcrypt.genSalt(10)

        const hash_password = await bcrypt.hash(password, salt)

        const {rows} = await pool.query('UPDATE users SET password = $1 WHERE uni = $2', [hash_password, uni])

        if(rows){
            res.status(200).json({error: false, message: 'Successfully reset password'})
        }

    } catch (error) {
        return res.status(400).json({error: true, message: 'Error reset password' + error})
    }
}

module.exports = {registUser, loginUser, logoutUser, resetPassword}