const express = require('express')
const Owner = require('../models/owner.js')
const router = express.Router()

router.get('/', (req, res) => {
    res.send('message from owners')
})

router.get('/admin/products/create', (req, res) => {
    // res.render('products/create')
})

router.post('/create', async (req, res) => {
    let owner = await Owner.find()
    if(owner.length > 0){
        return res
                .status(502)
                .send("You don't have authority to create new owner")

    }

    let { fullname, email, password } = req.body

    const data = new Owner({
        fullname,
        email,
        password
    })

    data.save()

    res.status(201).send(data)
})

module.exports = router