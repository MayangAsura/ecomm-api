const pool = require('../config/postgres')

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

    console.log('uni', req)

    const users = await pool.query(`SELECT id FROM orders WHERE uni = $1 AND deleted_at is null`, [uni])

    console.log('users>', users.rows)

    const histories = await pool.query(`SELECT * FROM orders WHERE created_by = $1 AND id` , [users.rows[0].id, id])


    if(!histories){
      return res.status(400).json({error: true, message: 'History empty'})
    }

    res.status(200).json({error: false, message: 'Successfully get history orders', data: histories.rows[0]})

  } catch (error) {
    return res.status(400).json({error: true, message: 'Error get history orders: ' + error })
  }
}

module.exports = {historyOrder, historyOrderById}