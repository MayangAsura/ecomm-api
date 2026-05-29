const pool = require('../config/postgres')

const getOrders = async (req, res, next) => {
  try {
    const {status, series} = req.query

    console.log('series', series)
    let orders = []

    if(series == 'mothly'){
      orders = await pool.query(`SELECT months.month
                  ,COUNT(orders.id)
  from      (
                  select TO_CHAR((current_date - interval '1 month' * a),'YYYY-MM') as month
                  from generate_series(0,3,1) AS s(a)
                  ) months
                  LEFT OUTER JOIN orders
                                  ON months.month=to_char(orders.created_at,'YYYY-MM')
                                  GROUP BY months.month`)

    }else{
      orders = await pool.query(`SELECT distinct on (created_at )* FROM orders WHERE deleted_at is null`)

    }

    if(!orders.rows){
      return res.status(400).json({error: true, message: 'Orders not found'})
    }

    res.status(200).json({error: false, message: 'Succesfully get orders', data: orders.rows})


  } catch (error) {
    return res.status(400).json({error: true, message: 'Error when get orders : ' + error})
  }
}

const getOrderHistories = async (req, res, next) => {
  try {
    const {status, series} = req.query

    const uni = req.user.uni

    console.log('uni', uni)
    let orders = []

    if(series == 'mothly'){
      orders = await pool.query(`SELECT months.month
                  ,COUNT(orders.id)
  from      (
                  select TO_CHAR((current_date - interval '1 month' * a),'YYYY-MM') as month
                  from generate_series(0,3,1) AS s(a)
                  ) months
                  LEFT OUTER JOIN orders
                                  ON months.month=to_char(orders.created_at,'YYYY-MM')
                  LEFT JOIN users u ON u.id = orders.created_by
                  WHERE orders.deleted_at is null
                  GROUP BY months.month`)

    }else{

      orders = await pool.query(`SELECT * FROM orders LEFT JOIN users u ON u.id = orders.created_by WHERE orders.deleted_at is null AND u.uni = $1`, [uni])

    }

    if(!orders.rows){
      return res.status(400).json({error: true, message: 'Orders not found'})
    }

    res.status(200).json({error: false, message: 'Succesfully get orders', data: orders.rows})


  } catch (error) {
    return res.status(400).json({error: true, message: 'Error when get orders : ' + error})
  }
}

const getLatestOrders = async (req, res, next) => {

  const {limit} = req.query

  console.log('limit', limit)

  try {

    const {rows} = await pool.query('SELECT invoice_number, total_price, total_amount, total_discount, promo_code, c.full_name customer_fullname, order_status FROM orders LEFT JOIN users u ON u.id = orders.created_by LEFT JOIN customers c ON c.id = u.account_id WHERE orders.deleted_at is null limit $1', [limit])

  if(!rows) res.status(400).json({error: true, message: 'Error when get latest orders'})

    res.status(200).json({error: false, message: 'Successfully get latest orders', data: rows})

  } catch (error) {
    next(error)
  }

}

const getOrderHistoryById = async (req, res, next) => {
  try {
    const {id} = req.params
    const {rows} = await pool.query(`SELECT * FROM orders
                                    WHERE deleted_at is null AND invoice_number = $1`, [id])

    if(!rows){
      return res.status(400).json({error: true, message: 'Select order not found'})
    }

    let data = rows[0]

    const items = await pool.query(`SELECT product_id, price, amount, discount, promo_code, admin_fee
                                      FROM order_details WHERE order_id = $1 AND deleted_at is null`, [rows[0].id])

    data.items = items.rows

    const payment = await pool.query(`SELECT payment_code, payment_status, bank_code, settlement_date
                                      FROM order_payments WHERE order_id = $1 AND deleted_at is null`, [rows[0].id])

    data.payment = payment.rows[0]

    res.status(200).json({error: false, message: 'Succesfully get order', data: rows[0]})


  } catch (error) {
    return res.status(400).json({error: true, message: 'Error when get order : ' + error})
  }
}


const getOrderById = async (req, res, next) => {
  try {
    const {id} = req.params
    const {rows} = await pool.query(`SELECT orders.*, c.full_name customer_name, c.phone_number customer_phone, c.email customer_email, op.payment_code, op.payment_status, op.bank_code, op.settlement_date FROM orders
                                    LEFT JOIN users u ON u.id = orders.created_by
                                    LEFT JOIN customers c ON c.id = u.account_id
                                    LEFT JOIN order_payments op ON op.order_id = orders.id
                                    WHERE orders.deleted_at is null AND orders.id = $1`, [id])

    if(!rows){
      return res.status(400).json({error: true, message: 'Select orders not found'})
    }

    const items = await pool.query(`SELECT product_id, p.name product_name, order_details.price, order_details.amount quantity, order_details.promo_code, order_details.discount FROM order_details
                                    LEFT JOIN products p ON p.id = order_details.product_id
                                    WHERE order_id = $1 AND order_details.deleted_at is null`, [rows[0].id])

    const data = {
      ...rows[0],
      items: items.rows
    }

    res.status(200).json({error: false, message: 'Succesfully get orders', data: data})


  } catch (error) {
    return res.status(400).json({error: true, message: 'Error when get orders : ' + error})
  }
}

const deleteOrder = async (req, res) => {
  try {
    const {id} = req.params

    const {rows} = await pool.query(`DELETE orders WHERE id = $1`, [id])

    if(!rows){
      return res.status(400).json({error, message: 'Error when delete order'})
    }
    res.status(200).json({error: false, message: 'Successfully delete order'})
  } catch (error) {
    return res.status(400).json({error: true, message: 'Error when delete order: ' + error })
  }
}

module.exports = {getOrders, getOrderHistories, getLatestOrders, getOrderHistoryById, getOrderById, deleteOrder}