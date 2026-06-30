const {pool} = require('../config/postgres.js')
const { idString, generateSlug } = require('../utils/generateSlug.js')
const {handleUpload} = require("../utils/handleUpload.js")

const createProduct = async (req, res, next) => {

  try {

    console.log('body', req)

    const { image, name, description, price, original_price, discount, bg_color, panel_color, text_color, stock, category_id, sku, variations } = req.body
    // const { image } = req.body

    console.log('file',  req.file, req.file.buffer, req.file.mimetype)
    // image, image.buffer,

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    // req.file.buffer
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    // req.file
    const response = await handleUpload(dataURI);
    // console.log(cldRes)
    // res.json(cldRes);

    // const slug = generateSlug(name)

    const results = await pool.query(`INSERT INTO products (image, name, description, price, original_price, discount, bg_color, panel_color, text_color, stock, category_id, sku)
                            VALUES ( $1, $2, $3 , $4, $5 , $6, $7 , $8, $9 , $10, $11 , $12)
      `, [response.url, name, description, price, original_price, discount, bg_color, panel_color, text_color, stock, category_id, sku])

    console.log(results.rows[0])

    if(!results) return res.status(400).json({error: true, message: 'Error when insert product'})

    const inserted_product = await pool.query(`SELECT id FROM products WHERE slug = $1 AND deleted_at is null`, [slug])

    if(!inserted_product){
      return res.status(400).json({error: true, message: 'Error when save product'})
    }

    console.log('variations', JSON.parse(variations))
    console.log('product', inserted_product)

    const pVariations = JSON.parse(variations)

    if(pVariations.length > 0){
      // variations.map( async variation => )

        console.log('variations', pVariations[0].color, pVariations.length)

      for (let i = 0; i < pVariations.length; i++) {
        const variation = pVariations[i];

        console.log('variation', variation.color)

        const {rows} = await pool.query(`INSERT INTO product_variations (product_id, color, size, price, stock) VALUES ($1, $2, $3, $4, $5)`, [inserted_product.rows[0].id, variation.color, variation.size, variation.price, variation.stock])

        if(!rows){
          return res.status(400).json({error: true, message: 'Error when insert product'})
        }
        const product = {...results.rows[0], variations: rows[0]}
      }

      res.status(200).json({error: false, message: 'Successfully insert product', data: results.rows[0]})
    }


  } catch (error) {
    next(error)
  }
}

const getProducts = async (req, res, next) => {

  try {

    // const {color, category_id, min_price, max_price, type} = req.query
    // const min = range_price?.split(' - ')[0]
    // const max = range_price?.split(' - ')[1]

    let query = ''
    let fields = []

    if(Object.keys(req.query).length > 0){

      const {min_price, max_price, sort_by, ...filters} = req.query

      Object.keys(filters).forEach(element => {
        query += `AND ${element} = $${fields.length + 1}`
        fields.push(req.query[element])
      })

      if(min_price){
        query += ` AND price between $${fields.length + 1}`
        // query.concat(query + ' AND price between $' + fields.length + 1)
        fields.push(min_price)
      }
      if(max_price){
        query += ` AND $${fields.length + 1}`
        // query.concat(query + 'AND $' + fields.length + 1)
        fields.push(max_price)
      }
      if(sort_by){
        query += ` AND pin_product = $${fields.length + 1}`
        // query.concat(query + 'AND $' + fields.length + 1)
        fields.push(max_price)
      }
    }
    // if(color){
    //   query.concat(query + ' AND color = $' + fields.length + 1)
    //   fields.push(color)
    // }
    // if(category){
    //   query.concat(query + ' AND category_id = $' + fields.length + 1)
    //   fields.push(category)
    // }
    // if(type){
    //   query.concat(query + ' AND type = $' + fields.length + 1)
    //   fields.push(type)
    // }
    // if(color){
    //   where.concat(where + ' AND color = $1')
    // }

    // console.log(query, type, fields)

    // if(){

      // products = await pool.query(`SELECT * FROM products WHERE deleted_at is null `, [color || null, category || null, range_price && range_price.split(' - ')[0] || null, range_price && range_price.split(' - ')[1] || null, type || null])
      const {rows} = await pool.query(`SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.deleted_at is null AND c.deleted_at is null ${query} ORDER BY created_at desc`, fields)

      console.log('rows', rows)

      if(rows){
        Promise.all(rows.map(async product => {
          const variations = await pool.query(`SELECT * FROM product_variations WHERE product_id = $1 AND deleted_at is null`, [product.id])

          return ({
            ...product, variations: variations.rows || []
          })
        }))
        .then(results => {
          // products = results

          res.status(200).json({error: false, message: 'Successfully get product', data: results})
        })
        .catch(error => {
          next(error)
        })


      }
    // }else{
    //   const {rows} = await pool.query(`SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.deleted_at is null AND c.deleted_at is null `)

    //   console.log('rows', rows)

    //   if(rows){
    //     Promise.all(rows.map(async product => {
    //       const variations = await pool.query(`SELECT * FROM product_variations WHERE product_id = $1 AND deleted_at is null`, [product.id])

    //       return ({
    //         ...product, variations: variations.rows || []
    //       })
    //     }))
    //     .then(results => {
    //       console.log('results', results)
    //       // console.log('products', products)

    //       res.status(200).json({error: false, message: 'Successfully get product', data: results})

    //     })
    //     .catch(error => {
    //       next(error)
    //     })
    //   }

    // }


  } catch (error) {
    next(error)
  }
}

const getProductsNewArrivals = async (req, res, next) => {

  try {

    const { rows } = await pool.query(`SELECT * FROM products WHERE pin_product = 'newarrivals' AND deleted_at is null ORDER BY created_at desc limit 6`)

    if(rows){
      Promise.all(rows.map(async product => {
        const variations = await pool.query(`SELECT * FROM product_variations WHERE product_id = $1 AND deleted_at is null`, [product.id])

        return ({
          ...product, variations: variations.rows || []
        })
      }))
      .then(results => {
        // products = results

        res.status(200).json({error: false, message: 'Successfully get product', data: results})
      })
      .catch(error => {
        next(error)
      })

    }

  } catch (error) {
    next(error)
  }
}

const getProductsBestSellers = async (req, res, next) => {

  try {

    const { rows } = await pool.query(`SELECT * FROM products WHERE pin_product='bestseller' AND deleted_at is null ORDER BY created_at desc limit 6`)

    if(rows){
      Promise.all(rows.map(async product => {
        const variations = await pool.query(`SELECT * FROM product_variations WHERE product_id = $1 AND deleted_at is null`, [product.id])

        return ({
          ...product, variations: variations.rows || []
        })
      }))
      .then(results => {
        console.log('results', results)
        // console.log('products', products)

        res.status(200).json({error: false, message: 'Successfully get product', data: results})

      })
      .catch(error => {
        next(error)
      })
    }



  } catch (error) {
    next(error)
  }
}

const getProductsSpecialOffers = async (req, res, next) => {

  try {

    const { rows } = await pool.query(`SELECT * FROM products WHERE deleted_at is null AND pin_product='special-offer' ORDER BY created_at desc limit 6`)

    if(rows){
      Promise.all(rows.map(async product => {
        const variations = await pool.query(`SELECT * FROM product_variations WHERE product_id = $1 AND deleted_at is null`, [product.id])

        return ({
          ...product, variations: variations.rows || []
        })
      }))
      .then(results => {
        console.log('results', results)
        // console.log('products', products)

        res.status(200).json({error: false, message: 'Successfully get product', data: results})

      })
      .catch(error => {
        next(error)
      })
    }


  } catch (error) {
    next(error)
  }
}

const getProductById = async (req, res, next) => {

  try {
    const {id} = req.params

    const { rows } = await pool.query(`SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.deleted_at is null AND c.deleted_at is null AND p.id = $1`, [id])

    console.log('rows', rows, id)

    if(rows){
      const variations = await pool.query('SELECT * FROM product_variations WHERE product_id = $1 AND deleted_at is null', [id])

      if(variations){
        rows[0].variations = variations.rows || []
      }
    }
    res.status(200).json({error: false, message: 'Successfully get product', data: rows[0]})



  } catch (error) {
    next(error)
  }
}

// const getProductClientDetail = async (req, res, next) => {

//   try {
//     const {slug} = req.params

//     const { rows } = await pool.query(`SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.deleted_at is null AND c.deleted_at is null AND p.slug = $1`, [slug])

//     console.log('rows', rows, id)

//     if(rows){
//       const variations = await pool.query('SELECT * FROM product_variations WHERE product_id = $1 AND deleted_at is null', [id])

//       if(variations){
//         rows[0].variations = variations.rows || []
//       }
//     }
//     res.status(200).json({error: false, message: 'Successfully get product', data: rows[0]})



//   } catch (error) {
//     next(error)
//   }
// }

const updateProduct = async (req, res, next) => {

  try {

    const {id} = req.params

    const { image, name, description, price, original_price, discount, bg_color, panel_color, text_color, stock, category, sku, variations } = req.body
    // const { image } = req.body

    console.log('image', image)

    const slug = idString(name)

    const results = await pool.query(`UPDATE products SET image = $1, name = $2, slug = $3, description = $4, price = $5, original_price = $6, discount = $7, bg_color = $8, panel_color = $9, text_color = $10, stock = $11, category = $12, sku = $13
                                      WHERE id = $16
      `, [image, name, slug, description, price, original_price, discount, bg_color, panel_color, text_color, stock, category, sku, id])

    if(variations){
      variations.map( async variation => {
        const {rows} = await pool.query(`UPDATE product_variations SET color = $1, size = $2, price = $3 WHERE id = $4`, [variation.color, variation.size, variation.price, variation.id])

        if(rows){
          results.rows[0].variations = rows
        }
      })
    }

    console.log('results', results)

    if(!results.rows) return res.status(400).json({error: true, message: 'Error when update product'})

    res.status(200).json({error: false, message: 'Successfully update product', data: results.rows[0]})


  } catch (error) {
    return res.status(400).json({error: true, message: 'Error when update product'})
    // next(error)
  }
}

const deleteProduct = async (req, res, next) => {

  try {

    const {id} = req.params
    // const { image, name, description, price, original_price, discount, bg_color, panel_color, text_color, stock, category, sku, colors } = req.body
    // const { image } = req.body

    const results = await pool.query(`UPDATE products SET deleted_at = $2 WHERE id = $1`, [id, new Date().toDateString()])

    console.log(results)

    res.status(200).json({error: false, message: 'Successfully delete product'})


  } catch (error) {
    next(error)
  }
}


module.exports = {createProduct, getProducts, getProductById, updateProduct, deleteProduct,  getProductsNewArrivals, getProductsBestSellers, getProductsSpecialOffers}