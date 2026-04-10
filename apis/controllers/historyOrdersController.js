const historyOrder = async (req, res) => {
  try {
    const {rows} = await pool.query(`SELECT * FROM orders WHERE created_by = $1` , [req.user.id])

    if(!rows){
      return res.status(400).json({error: true, message: 'History empty'})
    }

    res.status(200).json({error: false, message: 'Successfully get history orders', data: rows})

  } catch (error) {
    return res.status(400).json({error: true, message: 'Error get history orders: '+ error })
  }
}

module.exports = historyOrder