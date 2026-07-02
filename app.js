const express = require('express')
const app = express()
const expressSession = require('express-session')
const flash = require('connect-flash')
const multer = require('multer')
const cors = require('cors')

const { pool } = require('./config/postgres.js')
const dotenv = require('dotenv')
dotenv.config()

const cookieParser = require('cookie-parser')
const path = require('path')

const ownersRouter = require('./routes/ownersRouter.js')
const usersRouter = require('./routes/usersRouter.js')
const productsRouter = require('./routes/productsRouter.js')
const cartsRouter = require('./routes/cartsRouter.js')
const paymentsRouter = require('./routes/paymentsRouter.js')
const authRouter = require('./routes/authRouter.js')
const categoriesRouter = require('./routes/categoriesRouter.js')
const countsRouter = require('./routes/countsRouter.js')
const ordersRouter = require('./routes/ordersRouter.js')
const historyOrdersRouter = require('./routes/historyOrderRouter.js')
const customersRouter = require('./routes/customersRouter.js')
const balanceRouter = require('./routes/balanceRouter.js')
const orderReportsRouter = require('./routes/orderReportRouter.js')
const searchRouter = require('./routes/customersRouter.js')
const citiesRouter = require('./routes/citiesRouter.js')
const couponsRouter = require('./routes/couponsRouter.js')

const db = require('./config/mongoose-connection')

const { getProfile, updateProfile } = require('./controllers/customersController.js')
const { verifyToken } = require('./utils/verifyToken.js')

// ✅ CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5175',
  'https://7228-157-10-184-115.ngrok-free.app',
  'https://eshop-vini-sweethome.vercel.app',
  'https://github.com'
]

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
  credentials: true
};

// ✅ Middleware
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
app.use(cors(corsOptions))
app.use(express.static(path.join(__dirname, 'public')))

// ✅ Health Check Route
app.get('/', async (req, res) => {
  res.send("Hello from ecomm API")
})

// ✅ Test Database Route (with error handling)
app.get('/test', async (req, res) => {
  try {
    const result = await pool.query("SELECT current_database()")
    res.send("database: " + result.rows[0].current_database)
  } catch (error) {
    console.error('Database error:', error)
    res.status(500).send('Database connection failed: ' + error.message)
  }
})

// ✅ All Routes - UNCOMMENT these if you need them
app.use('/owners', ownersRouter)
app.use('/users', usersRouter)
app.use('/products', productsRouter)
app.use('/cart', cartsRouter)
app.use('/payments', paymentsRouter)
app.use('/auth', authRouter)
app.use('/histories', historyOrdersRouter)
app.use('/admin/auth', authRouter)
app.use('/count', countsRouter)
app.use('/orders', ordersRouter)
app.use('/coupons', couponsRouter)
app.use('/customers', customersRouter)
app.use('/categories', categoriesRouter)
app.use('/order-reports', orderReportsRouter)
app.use('/balance', balanceRouter)
app.use('/search', searchRouter)
app.use('/cities', citiesRouter)
app.use('/histories', historyOrdersRouter)

app.get('/accounts/profile', verifyToken, getProfile)
app.patch('/accounts/profile', verifyToken, updateProfile) // Fixed typo: 'accouts' -> 'accounts'

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err)
  const errStatus = err.status || 500
  const errMessage = err.message || "Server error"

  return res.status(errStatus).json({
    error: errStatus,
    message: errMessage,
    ...(process.env.NODE_ENV === 'development' && { errorStack: err.stack })
  })
})

// ✅ FOR VERCEL: Export the app (DO NOT use app.listen)
module.exports = app

// ✅ FOR LOCAL DEVELOPMENT: Only listen when running directly
if (require.main === module) {
  const PORT = process.env.PORT || 3030
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}