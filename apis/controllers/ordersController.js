const getOrders = async (req, res, next) => {
  try {
    const {rows} = await pool.query(`SELECT * FROM orders WHERE deleted_at = null`)

    if(!rows){
      return res.status(400).json({error: true, message: 'Orders not found'})
    }

    res.status(200).json({error: false, message: 'Succesfully get orders'})


  } catch (error) {
    return res.status(400).json({error: true, message: 'Error when get orders : ' + error})
  }
}

const getOrderById = async (req, res, next) => {
  try {
    const {id} = req.params
    const {rows} = await pool.query(`SELECT * FROM orders WHERE deleted_at = null AND id = $1`, [id])

    if(!rows){
      return res.status(400).json({error: true, message: 'Select orders not found'})
    }

    res.status(200).json({error: false, message: 'Succesfully get orders', data: rows[0]})


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

module.exports = getOrders, getOrderById, deleteOrder