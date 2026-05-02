const pool = require('../config/postgres')
const axios = require('axios')

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

    const {product_id, amount, price, admin_fee, discount, promo_code} = req.body
    const uni = req.user.uni

    const prefix = 'INS-'
    const orders = await pool.query('SELECT invoice_number FROM orders ORDER BY invoice_number desc')

    console.log('orders', orders.rows, uni)

    let inv_number = `${prefix}-${new Date().getFullYear()}`
    let order = '00000'
    if(!orders){
        order = String(1).padStart(4, '0')
    }else{
        order = String(parseInt(orders.rows[0].invoice_number.split('/')[2]) + 1).padStart(4, '0')
    }

    inv_number = `${inv_number}-${order}`
    const new_order = await pool.query('INSERT INTO orders (invoice_number, total_price, total_amount, total_discount, admin_fee, promo_code, order_status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [inv_number, price, amount, discount, admin_fee, promo_code, 'pending' ]
    )

    // console.log('new_order', new_order.rows[0].id)

    if(!new_order){
        return res.status(400).json({error: true, message: 'Error create order'})
    }

    // const order_id = 'INS/' + new Date().getSeconds()

    // req.user.uni ||
    // req.user.account_id ||
    // const account_id = '004d28d4-a4b6-4a70-bc24-5dc55ace83f1'
    // const users = await pool.query('SELECT id FROM users WHERE uni = $1', [uni])

    const customers = await pool.query('SELECT c.email,c.full_name,c.phone_number FROM customers c LEFT JOIN users u ON u.account_id = c.id WHERE uni = $1 AND u.deleted_at is null', [uni])

    if(customers){
        // const { rows } = await pool.query('INSERT INTO order_details (order_id, product_id, price, amount, discount, promo_code, admin_fee) VALUES ($1, $2, $3, $4, $5, $6, $7)', ['d4faee69-ff7e-4d61-80b5-94a1bdea8a26', product_id, price, amount, discount, promo_code, admin_fee])

        // if(!rows){
        //     return res.status(200).json({error: true, message: 'Error when create order'})
        // }
        const customer = customers.rows[0]

        const username = process.env.PG_SANDBOX_SERVER_KEY
        console.log('username', username)
        const AUTH_STRING = 'Basic ' + btoa(username + ":")
        console.log('AUTH_STRING', AUTH_STRING)
        // const AUTH_STRING = 'Basic ' + new Buffer(username + ":").toString('base64')

        await axios.post(`${PG_API_URL}/transactions`, {transaction_details: {order_id: inv_number, gross_amount: amount}}, {headers: {accept: 'application/json', 'content-type': 'application/json', Authorization: AUTH_STRING}})
                    .then(result => {
                        console.log('result', result)
                        if(result.status == 200){
                            res.status(200).json({error: false, message: 'Successfull create invoice', data: result.data.data})

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

module.exports = {createInvoice, createInvoiceMid}