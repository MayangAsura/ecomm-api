const {pool} = require('../config/postgres')

const historyOrder = async (req, res) => {
  try {

    const {from, to} = req.query

    const uni = req.user.uni || 123123
    console.log('uni', uni, from, to)

    const users = await pool.query(`SELECT id FROM users WHERE uni = $1 AND deleted_at is null`, [uni])

    console.log('users>', users.rows)

    let histories = {}
    if(from || to){
      histories = await pool.query(`SELECT * FROM orders WHERE created_by = $1 AND created_at between $2 AND $3 limit 10` , [users.rows[0].id, from, to])
    }else{
      histories = await pool.query(`SELECT * FROM orders WHERE created_by = $1 limit 20` , [users.rows[0].id])
    }

    if(!histories){
      return res.status(400).json({error: true, message: 'History empty'})
    }

    res.status(200).json({error: false, message: 'Successfully get history orders', data: histories.rows})

  } catch (error) {
    return res.status(400).json({error: true, message: 'Error get history orders: ' + error })
  }
}

const historyOrderById = async (req, res) => {
  try {

    const {id} = req.params

    const uni = req.user.uni

    console.log('uni', req.user.uni)

    const users = await pool.query(`SELECT id FROM users WHERE uni = $1 AND deleted_at is null`, [uni])

    console.log('users>', users.rows)

    const {rows} = await pool.query(`SELECT * FROM orders WHERE created_by = $1 AND invoice_number = $2 AND deleted_at is null` , [users.rows[0].id, id])

    console.log('history', rows)

    if(!rows){
      return res.status(400).json({error: true, message: 'History empty'})
    }

    const products = await pool.query(`SELECT od.product_id, od.price, od.discount, od.amount, od.promo_code, od.admin_fee, p.name, p.image, p.slug FROM order_details od JOIN products p ON p.id = od.product_id WHERE od.order_id = $1 AND od.deleted_at is null`, [rows[0].id])

    console.log('products', products)

    const payment = await pool.query(`SELECT op.payment_code, op.payment_status, op.bank_code, op.settlement_date FROM order_payments op WHERE op.order_id = $1 AND op.deleted_at is null`, [rows[0].id])

    const history = {
      ...rows[0],
      items: products.rows,
      payments: payment.rows
    }

    res.status(200).json({error: false, message: 'Successfully get history orders', data: history})

  } catch (error) {
    return res.status(400).json({error: true, message: 'Error get history orders: ' + error })
  }
}

module.exports = {historyOrder, historyOrderById}