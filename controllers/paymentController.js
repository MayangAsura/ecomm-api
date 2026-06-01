const pool = require('../config/postgres')
const axios = require('axios')
const Cart = require('../models/cart')

const PG_API_URL = process.env.SERVER_MODE === 'development'? process.env.PG_SANDBOX_URL: process.env.PG_PROD_URL

const createOrder = async (req, res, next) => {
    try {
        const {product_id, amount, admin_fee, discount, promo_code} = req.body

        const prefix = 'INS/'
        const results = await pool.query('SELECT invoice_number FROM orders ORDER BY invoice_number desc')

        let inv_number = `${prefix}/${new Date().getFullYear()}`
        let order = '00000'
        if(!results){
            order = String(1).padStart(4, '0')
        }else{
            order = String(parseInt(rows[0].results[0].invoice_number.split('/')[2]) + 1).padStart(4, '0')
        }

        inv_number = `${inv_number}/${order}`
        const {rows} = await pool.query('INSERT INTO orders (invoice_number, total_price, total_amount, total_discount, admin_fee, promo_code, order_status) VALUES ($1, $2, $3, $4, $5, $6, $7)')

        if(rows){
            res.status(200).json({error: false, message: 'Successfully create order'})
        }

    } catch (error) {
        return res.status(200).json({error: true, message: 'Error when create order: ' + error})
    }
}

const createInvoice = async (req, res) => {
  try {
    // req.cookie

    const {product_id, amount, price, admin_fee, discount, promo_code} = req.body

    const prefix = 'INS/'
    const orders = await pool.query('SELECT invoice_number FROM orders ORDER BY invoice_number desc')

    let inv_number = `${prefix}/${new Date().getFullYear()}`
    let order = '00000'
    if(!orders){
        order = String(1).padStart(4, '0')
    }else{
        order = String(parseInt(orders[0].invoice_number.split('/')[2]) + 1).padStart(4, '0')
    }

    inv_number = `${inv_number}/${order}`
    const new_order = await pool.query('INSERT INTO orders (invoice_number, total_price, total_amount, total_discount, admin_fee, promo_code, order_status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [inv_number, price, amount, discount, promo_code, admin_fee, 'pending' ]
    )

    if(!new_order){
        return res.status(400).json({error: true, message: 'Error create order'})
    }

    // const order_id = 'INS/' + new Date().getSeconds()

    const uni = req.user.uni
    const customers = await pool.query('SELECT email,full_name,phone_number FROM customers WHERE uni = $1', [uni])

    if(customers){
        const { rows } = await pool.query('INSERT INTO order_details SET order_id = $1, product_id = $2, price = $3, amount = $4, discount = $5, promo_code = $6, admin_fee = $7', [new_order.rows[0].id, product_id, price, amount, discount, promo_code, admin_fee])

        if(!rows){
            return res.status(200).json({error: true, message: 'Error when create order'})
        }
        const customer = customers.rows[0]

        let parameter = {
            "transaction_details": {
                "order_id": new_order.rows[0].id,
                "gross_amount": amount
            },
            "credit_card":{
                "secure" : true
            },
            "customer_details": {
                "first_name": customer.full_name,
                "last_name": '-',
                "email": customer.email,
                "phone": customer.phone_number
            }
        };

        snap.createTransaction(parameter)
            .then((transaction)=>{
                // transaction token
                console.log(transaction)
                let transactionToken = transaction.token;
                console.log('transactionToken:',transactionToken);

                res.json({transactionToken})
            })
    }


  } catch (error) {
    res.status(500).json({error: 'Error when create invoice ' + error})
  }
}

const createInvoiceMid = async (req, res) => {
  try {
    // req.cookie

    const {products, total_amount, total_price, admin_fee, total_discount, promo_code} = req.body
    const uni = req.user.uni

    const prefix = 'INS'
    const orders = await pool.query('SELECT invoice_number FROM orders ORDER BY invoice_number desc')

    console.log('orders', orders.rows, uni, orders.rows[0].invoice_number, orders.rows[0].invoice_number.split('-')[2])

    let inv_number = `${prefix}-${new Date().getFullYear()}`
    let order = '00000'

    if(!orders){
        order = String(1).padStart(4, '0')
    }else{
        order = String(parseInt(orders.rows[0].invoice_number.split('-')[2]) + 1).padStart(4, '0')
    }

    inv_number = `${inv_number}-${order}`

    console.log(inv_number)

    const customers = await pool.query('SELECT u.id as user_id, c.email,c.full_name,c.phone_number FROM customers c LEFT JOIN users u ON u.account_id = c.id WHERE uni = $1 AND u.deleted_at is null', [uni])

    console.log('customers', customers)

    const {rows} = await pool.query('INSERT INTO orders (invoice_number, total_price, total_amount, total_discount, admin_fee, promo_code, order_status, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [inv_number, total_price, total_amount, total_discount, admin_fee, promo_code, 'pending', customers.rows[0].user_id]
    )

    console.log('new_order', rows)

    if(!rows){
        return res.status(400).json({error: true, message: 'Error create order'})
    }

    const new_order = await pool.query('SELECT * FROM orders WHERE invoice_number = $1 AND deleted_at is null', [inv_number])

    // const order_id = 'INS/' + new Date().getSeconds()

    // req.user.uni ||
    // req.user.account_id ||
    // const account_id = '004d28d4-a4b6-4a70-bc24-5dc55ace83f1'
    // const users = await pool.query('SELECT id FROM users WHERE uni = $1', [uni])

    if(customers){
        products.map((item) => {
            pool.query('INSERT INTO order_details (order_id, product_id, price, amount, discount, promo_code, admin_fee, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [new_order.rows[0].id, item._id, item.price, item.quantity, 0, "", 0, customers.rows[0].user_id])
        });

        // if(!rows){
        //     return res.status(200).json({error: true, message: 'Error when create order'})
        // }
        const customer = customers.rows[0]

        const username = process.env.PG_SANDBOX_SERVER_KEY
        console.log('username', username)
        const AUTH_STRING = 'Basic ' + btoa(username + ":")
        console.log('AUTH_STRING', AUTH_STRING)
        // const AUTH_STRING = 'Basic ' + new Buffer(username + ":").toString('base64')

        const product_list = products.map(product => (
                {
                    "id": product._id,
                    "price": product.price,
                    "quantity": product.quantity,
                    "name": product.name,
                    "category": "muslimah fashion"
                }
            ))

            console.log(product_list)

        const transaction = {transaction_details: {
            order_id: inv_number,
            gross_amount: total_price,
            "item_details": product_list,
            "customer_details": {
                "first_name": customer.full_name,
                "last_name": "-",
                "email": customer.email,
                "phone": customer.phone_number
            }
        }}

        await axios.post(`${PG_API_URL}/transactions`, transaction, {headers: {accept: 'application/json', 'content-type': 'application/json', Authorization: AUTH_STRING}})
                    .then(async result => {
                        console.log('result', result)
                        if(result.status == 201){
                            const user_cart = await Cart.findOne({uni})

                            if(user_cart){
                                user_cart.carts = []

                                const cart = await Cart.findOneAndUpdate(
                                    {uni: uni},
                                    {$set: user_cart},
                                    {returnDocument: 'after'}
                                )

                                if(cart){
                                    res.status(200).json({error: false, message: 'Successfull create invoice', data: result.data})
                                }

                            }

                        }
                    })
                    .catch(error => {
                        return res.status(400).json({error: true, message: 'Error when create invoice: ' + error})
                    })

        // let parameter = {
        //     "transaction_details": {
        //         "order_id": new_order.rows[0].id,
        //         "gross_amount": amount
        //     },
        //     "credit_card":{
        //         "secure" : true
        //     },
        //     "customer_details": {
        //         "first_name": customer.full_name,
        //         "last_name": '-',
        //         "email": customer.email,
        //         "phone": customer.phone_number
        //     }
        // };

        // snap.createTransaction(parameter)
        //     .then((transaction)=>{
        //         // transaction token
        //         console.log(transaction)
        //         let transactionToken = transaction.token;
        //         console.log('transactionToken:',transactionToken);

        //         res.json({transactionToken})
        //     })
    }


  } catch (error) {
    return res.status(500).json({error: 'Error when create invoice ' + error})
  }
}

const callbackMid = async (req, res) => {

    try {
        const {order_id, gross_amount } = req.body

        console.log(req.body)

        if(order_id){
            try {

                const callbacks = await pool.query('INSERT INTO payment_logs (api, headers, body, order_id, result) VALUES ($1, $2, $3, $4, $5)', [req.headers.host, req.headers, req.body, order_id, 'ok'])

                if(!callbacks) return res.status(400).json({error: true, message: 'Error when handle callback'})


                const {rows} = await pool.query(`UPDATE orders SET order_status = 'successed' WHERE id = $1 AND total_amount = $2`, [order_id, gross_amount])

                if(!rows) return res.status(400).json({error: true, message: 'Error when update order: ' + error})

                const payments = await pool.query('UPDATE order_payments SET payment_status = $1 WHERE order_id = $2', ['successed', order_id])

                if(!payments) return res.status(400).json({error: true, message: 'Error when update payment'})


                res.status(200).json({error: true, message: 'Successfully save callback'})



            } catch (error) {
                return res.status(400).json({error: true, message: 'Error when store callback: ' + error})
            }
        }

    } catch (error) {
        return res.status(400).json({error: true, message: 'Error when send callback: ' + error})
    }
}

module.exports = {createInvoice, createInvoiceMid, callbackMid}