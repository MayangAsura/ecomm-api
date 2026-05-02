const express = require('express')

const searchProduct = async (req, res) => {

  try {

    const {keyword} = req.query
    let query = ''
    let fields = []
    if(keyword && keyword.trim() !== ""){
      query.concat(query + ' name ilike %$' + fields.length + 1 + '% OR categoris.name ilike %$' + fields.length + '%')
      fields.push(keyword)
    }
    // if(name && name.trim() !== ""){
    //   query.concat(query + ' AND name = $' + fields.length + 1)
    //   fields.push(name)
    // }
    if(category){
      query.concat(query + ' AND category_id = $' + fields.length + 1)
      fields.push(category)
    }

    const {rows} = await pool.query(`SELECT * FROM products LEFT JOIN categories c ON c.id = products.category_id WHERE ${query}`, [fields])
    // const {rows} = await pool.query(`SELECT * FROM products WHERE ${query}`, [fields])

    if(!rows){
      res.status(400).json({error: true, message: 'Error when get products'})
    }
    if(rows.length === 0){
      res.status(200).json({error: false, message: 'Products empty', data: rows})
    }

    res.status(200).json({error: false, message: 'Successfully get products', data: rows})

  } catch (error) {

  }

}

module.exports = {searchProduct}