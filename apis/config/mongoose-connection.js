const mongoose = require('mongoose')

const dbgr = require('debug')('development:mongoose')

mongoose.connect(process.env.MONGO_URI, )
    .then(() => {
        console.log('Connected to MongoDB')
        dbgr('db connected')
    })
    .catch((error) => {
        console.error('Could not connect to MongoDB', error)
        dbgr('db disconnect', error)
    })

// const mongoose = require('mongoose');

// mongoose.connect('your_mongodb_uri', { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('Connected to MongoDB'))
//   .catch(err => console.error('Could not connect to MongoDB', err));

module.exports = mongoose.connection