const pool = require('../config/postgres')
const bcrypt = require('bcrypt')

const getCustomers = async (req, res) => {
  try {

    const {rows} = await pool.query(`SELECT * FROM customers WHERE deleted_at is null ORDER BY created_at desc`)

    if(!rows){
      return res.status(400).json({error: true, message: 'Customers empty'})
    }

    res.status(200).json({error: false, message: 'Successfully get customers', data: rows})

  } catch (error) {
    return res.status(400).json({error: true, message: 'Error when get customers: ' + error})
  }
}

const getCustomerById = async (req, res) => {
  try {
    const {id } = req.params.id

    const {rows} = await pool.query(`SELECT * FROM customers WHERE deleted_at is null AND id = $1`, [id])

    if(!rows){
      return res.status(400).json({error: true, message: 'Customers empty.'})
    }

    res.status(200).json({error: false, message: 'Successfully get customers', data: rows})

  } catch (error) {
    return res.status(400).json({error: true, message: 'Error when get customers: ' + error})
  }
}

const getProfile = async (req, res) => {
  try {
    const {uni } = req.user.uni

    const {rows} = await pool.query(`SELECT c.*
                                        FROM customers c
                                        LEFT JOIN users u ON u.account_id = c.id
                                        LEFT JOIN cities
                                        WHERE c.deleted_at is null
                                              AND u.uni = $1`, [uni])

    if(!rows){
      return res.status(400).json({error: true, message: 'Profile not found.'})
    }

    res.status(200).json({error: false, message: 'Successfully get profile', data: rows})

  } catch (error) {
    return res.status(400).json({error: true, message: 'Error when get profile: ' + error})
  }
}

const updateProfile = async (req, res, next) => {

  try {
    const { full_name, email, phone_number, password, address, city_id, country, zip, avatar } = req.body;

    const uni = req.user.uni;

    console.log('uni', uni)

    if (email) {
      const { rows } = await pool.query(
        "SELECT email FROM users WHERE uni = $1",
        [uni],
      );

      if (!rows) {
        return res
          .status(400)
          .json({ error: true, message: "Email tidak ditemukan" });
      } else {

        let query = ''
        let fields = []
        if(full_name){
          query.concat(' AND full_name = $' + fields.length + 1)
          fields.push(full_name)
        }
        if(email){
          query.concat(' AND email = $' + fields.length + 1)
          fields.push(email)
        }
        if(phone_number){
          query.concat(' AND phone_number = $' + fields.length + 1)
          fields.push(phone_number)
        }
        if(address){
          query.concat(' AND address = $' + fields.length + 1)
          fields.push(address)
        }
        if(city_id){
          query.concat(' AND city_id = $' + fields.length + 1)
          fields.push(city_id)
        }
        if(country){
          query.concat(' AND country = $' + fields.length + 1)
          fields.push(country)
        }
        if(zip){
          query.concat(' AND zip = $' + fields.length + 1)
          fields.push(country)
        }

        fields.push(uni)

        if(full_name || email || phone_number || address || city_id || country || zip || avatar){

          const { rows } = await pool.query(
            `UPDATE customers SET ${query} WHERE uni = $${fields.length + 1}`,
            fields,
          );
          // full_name = $1, email = $2, phone_number = $3, avatar = $4 WHERE uni = $5
        }

        if(password){
          const salt = await bcrypt.genSalt(10);
          const hash_password = await bcrypt.hash(password, salt);

          const { rows } = await pool.query(
          "UPDATE users SET password = $1 WHERE uni = $2",
          [hash_password, uni]
          )
        }else{
          const { rows } = await pool.query(
          "UPDATE users SET full_name = $1, email = $2 WHERE uni = $3",
          [full_name, email, uni])

        }

        // if (rows) {
        // );

          res
            .status(200)
            .json({ error: false, message: "Successfully update profile" });
        // }
      }
    }
  } catch (error) {
    return res
      .status(400)
      .json({ error: true, message: "Error when update profile: " + error });
  }
};

module.exports = { getCustomers, getCustomerById, getProfile, updateProfile }