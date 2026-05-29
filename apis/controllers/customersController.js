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

    console.log('id', id)

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
    const uni = req.user.uni

    console.log('uni', uni, req.user)

    const {rows} = await pool.query(`SELECT c.*
                                        FROM customers c
                                        LEFT JOIN users u ON u.account_id = c.id
                                        WHERE c.deleted_at is null
                                              AND u.uni = $1`, [uni])

    if(!rows){
      return res.status(400).json({error: true, message: 'Profile not found.'})
    }

    res.status(200).json({error: false, message: 'Successfully get profile', data: rows[0]})

  } catch (error) {
    return res.status(400).json({error: true, message: 'Error when get profile: ' + error})
  }
}

const updateProfile = async (req, res, next) => {

  try {
    const { full_name, email, phone_number, password, address, province_id, city_id, country, zip, avatar } = req.body;

    const {uni} = req.user;

    console.log('uni', uni)

    let query = ''
    let fields = []
    let columns = Object.keys(req.body);
    let params = [];

    const {rows} = await pool.query('SELECT account_id FROM users WHERE uni = $1', [uni])
    params.push(rows[0].account_id)

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

        // if(full_name){
        //   query.concat(query + ' full_name = $' + fields.length + 1)
        //   fields.push(full_name)
        // }
        // if(email){
        //   console.log(email)
        //   query.concat(query + query!==''? ', ': ' ' + 'email = $' + fields.length + 1)
        //   fields.push(email)
        // }
        // if(phone_number){
        //   query.concat(query + query!==''? ', ': ' ' + 'phone_number = $' + fields.length + 1)
        //   fields.push(phone_number)
        //   console.log('phone_number', phone_number, query)
        // }
        // if(address){
        //   query.concat(query + query!==''? ', ': ' ' + 'address = $' + fields.length + 1)
        //   fields.push(address)
        // }
        // if(city_id){
        //   query.concat(query + query!==''? ', ': ' ' + 'city_id = $' + fields.length + 1)
        //   fields.push(city_id)
        // }
        // if(country){
        //   query.concat(query + query!==''? ', ': ' ' + 'country = $' + fields.length + 1)
        //   fields.push(country)
        // }
        // if(zip){
        //   query.concat(query + query!==''? ', ': ' ' + 'zip = $' + fields.length + 1)
        //   fields.push(zip)
        // }

      query = "UPDATE customers SET ";
      for(let i = 0; i < columns.length; i++) {
        query = `${query}${columns[i]} = $${params.length + 1},`
        params.push(req.body[columns[i]]);
      }
      query = `, ${query}updated_at = $${params.length + 1}`
      params.push(new Date().toDateString())
      query = `${query.substring(0, query.length-1)} WHERE id = $1`
      console.log(query);
      console.log(fields)


        if(full_name || email || phone_number || address || province_id || city_id || country || zip || avatar){

          console.log('query', query)
          console.log('fields', fields)

          const customer = await pool.query(query, params)

          console.log('customer', customer)

          // const customers = await pool.query(
          //   `UPDATE customers SET ${full_name? ' full_name = $ ' : "" } ${query} WHERE id = $${fields.length + 1}`,
          //   [fields],
          // );
          // full_name = $1, email = $2, phone_number = $3, avatar = $4 WHERE uni = $5
        }

        if(password){
          const salt = await bcrypt.genSalt(10);
          const hash_password = await bcrypt.hash(password, salt);

          const { rows } = await pool.query(
          "UPDATE users SET password = $2, updated_at = $3 WHERE uni = $1",
          [uni, hash_password, new Date().toDateString()]
          )
        }else{
          const { rows } = await pool.query(
          "UPDATE users SET full_name = $2, email = $3, updated_at = $4 WHERE uni = $1",
          [uni, full_name, email, new Date().toDateString()])

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