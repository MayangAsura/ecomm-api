const express = require('express')
const productModel = require('../models/product.js')
const {createInvoice, createInvoiceMid, callbackMid} = require('../controllers/paymentController.js')
const { verifyUser } = require('../utils/verifyToken.js')
const upload = require('../config/multer-config.js')
const router = express.Router()
const fs = require('fs');
var path = require('path');

router.post('/request-invoices', createInvoiceMid)
router.post('/mid-callback', callbackMid)
// router.post('/request-invoices', createInvoice)

router.get('/', async (req, res) => {
    // const products = await productModel.find()
    // console.log('products', products)
    const mocked_products = [
        {
            "_id": "698595627807115e36b708a9",
            "image": "https://res.cloudinary.com/dodrj3l9p/image/upload/v1770299808/boots_wanita_jvfb26.webp",
            "bgColor": "white",
            "name": "Orange BootShoe",
            "price": 1300000,
            "discount": 30,
            "textColor": "blue",
            "panelColor": "gray",
            "stock": "25",
            "category": "Boots Shoes",
            "sku": "BS-000X3"
            },
            {
            "_id": "698595627807115e36b708a1",
            "image": "https://res.cloudinary.com/dodrj3l9p/image/upload/v1770299808/boots_wanita_jvfb26.webp",
            "bgColor": "white",
            "name": "Orange BootShoe",
            "price": 1300000,
            "discount": 30,
            "textColor": "blue",
            "panelColor": "gray",
            "stock": "25",
            "category": "Boots Shoes",
            "sku": "BS-000X3"
            },
            {
            "_id": "698595627807115e36b708a2",
            "image": "https://res.cloudinary.com/dodrj3l9p/image/upload/v1770299808/boots_wanita_jvfb26.webp",
            "bgColor": "white",
            "name": "Orange BootShoe",
            "price": 1300000,
            "discount": 30,
            "textColor": "blue",
            "panelColor": "gray",
            "stock": "25",
            "category": "Boots Shoes",
            "sku": "BS-000X3"
            },
            {
            "_id": "698595627807115e36b708a2",
            "image": "https://res.cloudinary.com/dodrj3l9p/image/upload/v1770299808/boots_wanita_jvfb26.webp",
            "bgColor": "white",
            "name": "Orange BootShoe",
            "price": 1300000,
            "discount": 30,
            "textColor": "blue",
            "panelColor": "gray",
            "stock": "25",
            "category": "Boots Shoes",
            "sku": "BS-000X3"
            },
            {
            "_id": "698595627807115e36b708a3",
            "image": "https://res.cloudinary.com/dodrj3l9p/image/upload/v1770299808/boots_wanita_jvfb26.webp",
            "bgColor": "white",
            "name": "Orange BootShoe",
            "price": 1300000,
            "discount": 30,
            "textColor": "blue",
            "panelColor": "gray",
            "stock": "25",
            "category": "Boots Shoes",
            "sku": "BS-000X3"
            },
            {
            "_id": "698595627807115e36b708a4",
            "image": "https://res.cloudinary.com/dodrj3l9p/image/upload/v1770299808/boots_wanita_jvfb26.webp",
            "bgColor": "white",
            "name": "Orange BootShoe",
            "price": 1300000,
            "discount": 30,
            "textColor": "blue",
            "panelColor": "gray",
            "stock": "25",
            "category": "Boots Shoes",
            "sku": "BS-000X3"
            },
            {
            "_id": "698595627807115e36b708a6",
            "image": "https://res.cloudinary.com/dodrj3l9p/image/upload/v1770299808/boots_wanita_jvfb26.webp",
            "bgColor": "white",
            "name": "Orange BootShoe",
            "price": 1300000,
            "discount": 30,
            "textColor": "blue",
            "panelColor": "gray",
            "stock": "25",
            "category": "Boots Shoes",
            "sku": "BS-000X3"
            }
    ]
    res.json({message: 'Successfully get products', data: mocked_products})
})

// router.post('/add', async (req, res) => {
//     res.json(req.body)
// })

router.post('/', upload.single('image') , async (req, res) => {
    console.log(req.file)
    try {
        let { name, description, price, originalPrice, discount, panelColor, bgColor, textColor, stock, category, sku, colors } = req.body

        // {
        //     data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
        //     contentType: 'image/png'
        // }
        let product = await productModel.create({
            image: req.file.filename,
            name,
            description,
            price,
            originalPrice,
            discount,
            bgColor,
            panelColor,
            textColor,
            stock,
            category,
            sku,
            colors
        })

        res.send(product)

    } catch (error) {
        res.send(error.message)
    }
})

module.exports = router