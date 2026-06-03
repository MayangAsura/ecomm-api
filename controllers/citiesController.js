const {pool} = require("../config/postgres")

const getCities = async (req, res) => {
  try {

    // console.log('uni', req.user.uni)

    const {rows} = await pool.query('SELECT * FROM cities WHERE deleted_at is null')

    if(!rows){
      return res.status(400).json({error: true, message: 'Error get cities'})
    }

    res.status(200).json({error: false, message: 'Successfully get cities', data: rows})

  } catch (error) {
    return res.status(500).json({error: true, message: 'Error get cities: ' + error})
  }
}

module.exports = {getCities}