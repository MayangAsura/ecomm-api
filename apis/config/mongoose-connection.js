const mongoose = require('mongoose')

const dbgr = require('debug')('development:mongoose')

// require('dotenv').config();

// const MongoClient = require('mongodb').MongoClient;

// // MongoDB connection URL with authentication options
// let url = `${process.env.MONGO_URL}`;

// let dbInstance = null;
// const dbName = `${process.env.MONGO_DB}`;

// async function connectToDatabase() {
//     // if (dbInstance){
//     //     return dbInstance
//     // };

//     const client = new MongoClient(url);

//     // Task 1: Connect to MongoDB
//     // {{insert code}}
//     await client.connect()

//     // Task 2: Connect to database giftDB and store in variable dbInstance
//     //{{insert code}}
//     const dbInstance = client.db(dbName)

//     // Task 3: Return database instance
//     // {{insert code}}
//     return dbInstance
// }

// module.exports = connectToDatabase;

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