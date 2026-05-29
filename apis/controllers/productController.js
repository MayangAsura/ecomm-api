const pool = require('../config/postgres.js')
const { idString } = require('../utils/generateSlug.js')

const createProduct = async (req, res, next) => {

  try {

    const { image, name, description, price, original_price, discount, bg_color, panel_color, text_color, stock, category, sku, colors } = req.body
    // const { image } = req.body

    console.log('image', image)
    const slug = idString(name)

    const results = await pool.query(`INSERT INTO products (image, name, slug, description, price, original_price, discount, bg_color, panel_color, text_color, stock, category, sku, colors)
                            VALUES ( $1, $2, $3 , $4, $5 , $6, $7 , $8, $9 , $10, $11 , $12, $13, $14 )
      `, [image, name, slug, description, price, original_price, discount, bg_color, panel_color, text_color, stock, category, sku, colors])

    console.log(results)

    if(!results) return res.status(400).json({error: true, message: 'Error when insert product', data: results[0]})

    res.status(200).json({error: false, message: 'Successfully insert product', data: results[0]})


  } catch (error) {
    next(error)
  }
}

const getProducts = async (req, res, next) => {

  try {

    const {color, category, min_price, max_price, type} = req.query
    // const min = range_price?.split(' - ')[0]
    // const max = range_price?.split(' - ')[1]

    let query = ''
    let fields = []
    if(color){
      query.concat(query + ' AND color = $' + fields.length + 1)
      fields.push(color)
    }
    if(category){
      query.concat(query + ' AND category_id = $' + fields.length + 1)
      fields.push(category)
    }
    if(min_price){
      query.concat(query + ' AND price between $' + fields.length + 1)
      fields.push(min_price)
    }
    if(max_price){
      query.concat(query + 'AND $' + fields.length + 1)
      fields.push(max_price)
    }
    if(type){
      query.concat(query + ' AND type = $' + fields.length + 1)
      fields.push(type)
    }
    // if(color){
    //   where.concat(where + ' AND color = $1')
    // }

    console.log(query, type, fields)
    let products = []
    if(color || category || min_price || max_price || type){

      // products = await pool.query(`SELECT * FROM products WHERE deleted_at is null `, [color || null, category || null, range_price && range_price.split(' - ')[0] || null, range_price && range_price.split(' - ')[1] || null, type || null])
      products = await pool.query(`SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.deleted_at is null AND c.deleted_at is null ${query}`, [fields])
    }else{
      products = await pool.query(`SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.deleted_at is null AND c.deleted_at is null `)
    }

    console.log('products', products)
    res.status(200).json({error: false, message: 'Successfully get product', data: products.rows})


  } catch (error) {
    next(error)
  }
}

const getProductsNewArrivals = async (req, res, next) => {

  try {

    const { rows } = await pool.query(`SELECT * FROM products WHERE pin_product = 'newarrivals' AND deleted_at is null ORDER BY created_at desc limit 6`)

    // console.log('rows', rows)
    res.status(200).json({error: false, message: 'Successfully get product', data: rows})



  } catch (error) {
    next(error)
  }
}

const getProductsBestSellers = async (req, res, next) => {

  try {

    const { rows } = await pool.query(`SELECT * FROM products WHERE pin_product='bestseller' AND deleted_at is null ORDER BY created_at desc limit 6`)

    // console.log(rows)
    res.status(200).json({error: false, message: 'Successfully get product bestseller', data: rows})



  } catch (error) {
    next(error)
  }
}

const getProductsSpecialOffers = async (req, res, next) => {

  try {

    const { rows } = await pool.query(`SELECT * FROM products WHERE deleted_at is null AND pin_product='special-offer' ORDER BY created_at desc limit 6`)

    // console.log(rows)
    res.status(200).json({error: false, message: 'Successfully get product special offer', data: rows})



  } catch (error) {
    next(error)
  }
}

const getProductById = async (req, res, next) => {

  try {
    const {id} = req.params

    const { rows } = await pool.query(`SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.deleted_at is null AND c.deleted_at is null AND p.id = $1`, [id])

    console.log('rows', rows, id)
    res.status(200).json({error: false, message: 'Successfully get product', data: rows[0]})



  } catch (error) {
    next(error)
  }
}

const updateProduct = async (req, res, next) => {

  try {

    const {id} = req.params

    const { image, name, description, price, original_price, discount, bg_color, panel_color, text_color, stock, category, sku, colors } = req.body
    // const { image } = req.body

    console.log('image', image)

    const slug = idString(name)

    const results = await pool.query(`UPDATE products SET image = $1, name = $2, slug = $3, description = $4, price = $5, original_price = $6, discount = $7, bg_color = $8, panel_color = $9, text_color = $10, stock = $11, category = $12, sku = $13, colors = $14
                                      WHERE id = $15
      `, [image, name, slug, description, price, original_price, discount, bg_color, panel_color, text_color, stock, category, sku, colors, id])

    console.log('results', results)

    if(!results) return res.status(400).json({error: true, message: 'Error when update product'})

    res.status(200).json({error: false, message: 'Successfully update product', data: results[0]})


  } catch (error) {
    return res.status(400).json({error: true, message: 'Error when update product'})
    // next(error)
  }
}

const deleteProduct = async (req, res, next) => {

  try {

    const {id} = req.query
    // const { image, name, description, price, original_price, discount, bg_color, panel_color, text_color, stock, category, sku, colors } = req.body
    // const { image } = req.body

    const results = await pool.query(`DELETE products WHERE id = $1`, [id])

    console.log(results)

    res.status(200).json({error: false, message: 'Successfully delete product'})


  } catch (error) {
    next(error)
  }
}


module.exports = {createProduct, getProducts, getProductById, updateProduct, deleteProduct,  getProductsNewArrivals, getProductsBestSellers, getProductsSpecialOffers}