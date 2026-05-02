const pool = require('../config/postgres')

const countProducts = async (req, res) => {
  try {

    const {rows } = await pool.query('SELECT count(id) as count_products FROM customers WHERE created_at interval 1 week AND deleted_at is null')

    if(!rows){
      return res.status(400).json({error: true, message: 'Produk empty'})
    }

    res.status(200).json({error: false, message: 'Successfully get count customers', data: rows[0].count_products})


  } catch (error) {
    return res.status(400).json({error: true, message: 'Error when get count products: ' + error})
  }
}

const countCustomers = async (req, res) => {
  try {

    const {rows } = await pool.query('SELECT count(id) count_customers FROM customers WHERE created_at interval 1 week AND deleted_at is null')

    if(!rows){
      return res.status(400).json({error: true, message: 'Customers empty'})
    }

    res.status(200).json({error: false, message: 'Successfully get count customers', data: rows[0].count_customers})


  } catch (error) {
    return res.status(400).json({error: true, message: 'Error when get count customers: ' + error})
  }
}

const countOrders = async (req, res) => {
  try {

    const {rows } = await pool.query('SELECT count(id) count_orders FROM orders WHERE created_at interval 1 week AND deleted_at is null')

    if(!rows){
      return res.status(400).json({error: true, message: 'Orders empty'})
    }

    res.status(200).json({error: false, message: 'Successfully get count orders', data: rows[0].count_orders})


  } catch (error) {
    return res.status(400).json({error: true, message: 'Error when get count orders: ' + error})
  }
}
const countCompleteOrders = async (req, res) => {
  try {

    const {status, quarter} = req.query

    let query = ''
    let fields = []
    if(status){
      query.concat(' AND order_status = $' + fields.length + 1)
    }
    if(quarter){
      query.concat(' ')
    }

    const {rows } = await pool.query('SELECT count(id) count_c_orders FROM customers WHERE created_at interval 1 week AND deleted_at is null')

    if(!rows){
      return res.status(400).json({error: true, message: 'Complete orders empty'})
    }

    res.status(200).json({error: false, message: 'Successfully get count complete orders', data: rows[0].count_c_orders})


  } catch (error) {
    return res.status(400).json({error: true, message: 'Error when get count complete orders: ' + error})
  }
}

module.exports = { countProducts, countCustomers, countOrders, countCompleteOrders}