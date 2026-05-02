// import userModel from '../models/user.js'
// import { generateToken } from '../utils/generateToken.js'
const bcrypt = require('bcrypt')
const pool = require('../config/postgres.js')
const { generateToken } = require('../utils/generateToken.js')
const { TokenExpiredError } = require('jsonwebtoken')

const registUser = async (req, res) => {
    const { full_name, email, password, phone_number, address, city_id, country, zip } = req.body

    console.log(req.body)

    const { rows } = await pool.query('SELECT email FROM users WHERE email = $1', [email])
    // const user = await userModel.find({email: email})
    // console.log(rows)
    if(rows[0])
        return res.status(400).json({error: false, message: 'Email not available'})

    try {
        // const salt = await bcrypt.genSalt(10)
        await bcrypt.genSalt(10, async (err, salt) => {
            if(err) return res.status(400).json({error: true, message: 'Error when register user, salt: ' + err.message})
            await bcrypt.hash(password, salt, async (err, hash) =>{
                console.log('salt', salt, err)
                if(err) return res.status(400).json({error: true, message: 'Error when register user: ' + err.message})
                else{
                    const users = await pool.query('INSERT INTO users (full_name, email, password, user_type) VALUES ($1, $2, $3, $4)', [full_name, email, hash, 'customer'])

                    // console.log('users', users)

                    if(users){
                        const customers = await pool.query('INSERT INTO customers (full_name, email, phone_number, address, city_id, country, zip) VALUES ($1, $2, $3, $4, $5, $6, $7)', [full_name, email, phone_number, address, city_id, country, zip])
                        const {rows} = await pool.query('SELECT * FROM customers WHERE email = $1 AND deleted_at is null', [email])

                        // console.log('customers', customers, rows)

                        if(customers){
                            // console.log('rows', rows, rows[0].id)
                            const account_id = rows[0].id
                            const characters = 'abcdefghijklmnopqrstuvwxyz'
                            // const uni = [...Array(5)].map((value) => (Math.random() * 1000000).toString(5).replace('.', '')).join('')
                            const uni = genRandomString(6)
                            // console.log(uni)
                            // const uni = [...Array[5]].forEach(value => {return {}})
                            const user = await pool.query('UPDATE users SET account_id = $1, uni = $2, updated_at = $3 WHERE email = $4', [account_id, uni, new Date().toDateString(), email])

                            // const user = {}
                            const token = generateToken({email: email, uni: uni })
                            res.cookie("token", token, {maxAge: 24 * 60})
                            res.status(200).json({error: false, message: "Successfully registered"})

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
        return res.json({error: true, message: "Error when register user: " + error})
    }
}

const genRandomString = (length) => {
    const characters = 'abcdefghijklmnopqrstuvwxyz';
            let result = '';
            const charactersLength = characters.length;
            for (let i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
    // characters.chartAt(Math.floor(Math.random() * characters.length))
    return result
}

const getSession = async (req, res) => {
    try {

        res.status(200).json({error: false, message: 'Successfully get session', session: req.user})

    } catch (error) {
        return res.status(400).json({error: true, message: 'Error when get session' + error})
    }
}

const loginUser = async (req, res) => {

    const { username, password } = req.body

    try {
        const {rows} = await pool.query("SELECT email, uni, is_admin, password FROM users WHERE email = $1 AND deleted_at is null", [username])
        // const user = await userModel.findOne({email: email})
        console.log('rows', rows)
        if(!rows[0]){
            return res.status(400).json({error: true, message: "User not found"})
        }

        const credential = {
            email: rows[0].email,
            uni: rows[0].uni,
            is_admin: rows[0].is_admin
        }

        bcrypt.compare(password, rows[0].password, (err, result) => {
            if(result){
                const token = generateToken(credential)
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: false
                })
                // {maxAge: 24 * 60}
                res.status(200).json({error: false, message: 'Successfuly logged in', data: { token: token}})
                // ('You are logged in')
            }
        })
    } catch (error) {
        res.json({message: error.message})
    }
    // res.json(user)
}

const logoutUser = async (req, res) => {

    // res.cookie('token', '', {maxAge: 0})
    // res.end()
    res.clearCookie('token', {
        httpOnly: true,
        secure: false
    }).json({error: false, message: 'Logout successfully'})

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

module.exports = {registUser, getSession, loginUser, logoutUser, resetPassword}