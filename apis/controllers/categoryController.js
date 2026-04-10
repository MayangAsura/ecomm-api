const pool = require('../config/postgres.js')

const createCategory = async (req, res, next) => {

  try {

    const { image, name, description, price, original_price, discount, bg_color, panel_color, text_color, stock, category, sku, colors } = req.body
    // const { image } = req.body

  //   invoice_number varchar(200),
	// total_price int8,
	// total_amount int8,
	// admin_fee int8,
	// total_discount int8,
	// promo_code varchar(100),

    const results = await pool.query(`INSERT INTO products (image, name, description, price, original_price, discount, bg_color, panel_color, text_color, stock, category, sku, colors)
                            VALUES ( $1, $2, $3 , $4, $5 , $6, $7 , $8, $9 , $10, $11 , $12, $13 )
      `, [image, name, description, price, original_price, discount, bg_color, panel_color, text_color, stock, category, sku, colors])

    console.log(results)

    res.status(200).json({error: false, message: 'Successfully insert product', data: results[0]})


  } catch (error) {
    next(error)
  }
}

const getCategories = async (req, res, next) => {

  try {

    const { rows } = await pool.query(`SELECT * FROM categories WHERE deleted_at = null`)

    console.log(rows)
    res.status(200).json({error: false, message: 'Successfully get categories', data: rows[0]})



  } catch (error) {
    next(error)
  }
}

const getOrderById = async (req, res, next) => {

  try {
    const {id} = req.query

    const { rows } = await pool.query(`SELECT * FROM orders WHERE deleted_at = null AND id = $1`, [id])

    console.log(rows)
    res.status(200).json({error: false, message: 'Successfully get order', data: rows[0]})



  } catch (error) {
    next(error)
  }
}

const updateProduct = async (req, res, next) => {

  try {

    const { image, name, description, price, original_price, discount, bg_color, panel_color, text_color, stock, category, sku, colors } = req.body
    // const { image } = req.body

    const results = await pool.query(`UPDATE products SET (image, name, description, price, original_price, discount, bg_color, panel_color, text_color, stock, category, sku, colors)
                            VALUES ( $1, $2, $3 , $4, $5 , $6, $7 , $8, $9 , $10, $11 , $12, $13 )
      `, [image, name, description, price, original_price, discount, bg_color, panel_color, text_color, stock, category, sku, colors])

    console.log(results)

    res.status(200).json({error: false, message: 'Successfully insert product', data: results[0]})


  } catch (error) {
    next(error)
  }
}

const deleteProduct = async (req, res, next) => {

  try {

    const {id} = req.query
    // const { image, name, description, price, original_price, discount, bg_color, panel_color, text_color, stock, category, sku, colors } = req.body
    // const { image } = req.body

    const results = await pool.query(`DELETE products WHERE id = $1
      `, [id])

    console.log(results)

    res.status(200).json({error: false, message: 'Successfully delete product'})


  } catch (error) {
    next(error)
  }
}


module.exports = {createProduct, getCategories, updateProduct, deleteProduct}