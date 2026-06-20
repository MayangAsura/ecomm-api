const express = require('express')
const app = express()
const expressSession = require('express-session')
const flash = require('connect-flash')
const multer = require('multer')
const cors = require('cors')

const pool = require('./config/postgres.js')
const dotenv = require('dotenv')
dotenv.config()

const cookieParser = require('cookie-parser')
const path = require('path')
// const layout = require('express-ejs-layouts')

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

// app.use(cors({
//   credentials: true
// }))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:5175', 'https://7228-157-10-184-115.ngrok-free.app', 'http://localhost:5173', 'https://eshop-vini-sweethome.vercel.app', 'https://github.com/orgzpro-maryamalauzaiy/ecomm-api/blob/main/ca-cert-postgres-database/cert.pem'],
  // Allow these HTTP methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  // Allow these headers in requests
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-CSRF-Token', 'Accept', 'Accept-Version', 'Content-Length', 'Content-MD5', 'Date', 'X-Api-Version'],
  credentials: true
}))
app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.EXPRESS_SESSION_SECRET
}))
app.use(flash())
app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine', 'ejs')

// app.use(layout)
// app.use('layout', 'layouts/main')

// app.get('/', (req, res) => {
//     // res.redirect('/products')
//     res.render('home', {
//         title: 'Home',
//         layout: 'layouts/main'
//     })
//     // res.send('message from server')
// })

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Authentication page (Login & Register)
app.get('/auth', (req, res) => {
  if (req.user) {
    return res.redirect('/products');
  }

  res.render('auth/index', {
    title: 'Login / Register',
    error: req.query.error || null,
    success: req.query.success || null,
    formData: {},
    isLogin: true
  });
})

// Login process
// app.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   // Validation
//   if (!email || !password) {
//     return res.redirect('/auth?error=Email and password are required');
//   }

//   // Find user
//   const user = users.find(u => u.email === email);

//   if (!user) {
//     return res.redirect('/auth?error=Invalid email or password');
//   }

//   // Verify password (in real app, use bcrypt)
//   const isValidPassword = await bcrypt.compare(password, user.password);

//   if (!isValidPassword) {
//     return res.redirect('/auth?error=Invalid email or password');
//   }

//   // Set session
//   req.session.user = {
//     id: user.id,
//     name: user.name,
//     email: user.email,
//     role: user.role
//   };

//   res.redirect('/products');
// });

// Register process
// app.post('/register', async (req, res) => {
//   const { name, email, password, confirmPassword } = req.body;

//   // Validation
//   if (!name || !email || !password || !confirmPassword) {
//     return res.redirect('/auth?error=All fields are required');
//   }

//   if (password !== confirmPassword) {
//     return res.redirect('/auth?error=Passwords do not match');
//   }

//   if (password.length < 6) {
//     return res.redirect('/auth?error=Password must be at least 6 characters');
//   }

//   // Check if user exists
//   const userExists = users.find(u => u.email === email);
//   if (userExists) {
//     return res.redirect('/auth?error=Email already registered');
//   }

//   try {
//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create new user
//     const newUser = {
//       id: users.length + 1,
//       name,
//       email,
//       password: hashedPassword,
//       role: 'user'
//     };

//     users.push(newUser);

//     res.redirect('/auth?success=Registration successful! Please login.');
//   } catch (error) {
//     res.redirect('/auth?error=Registration failed. Please try again.');
//   }
// });

// // Logout
// app.get('/logout', (req, res) => {
//   req.session.destroy();
//   res.redirect('/auth');
// });

// Middleware to check authentication
// const requireAuth = (req, res, next) => {
//   if (!req.session.user) {
//     return res.redirect('/auth');
//   }
//   next();
// };

// const products = [
//   {
//     id: 1,
//     name: 'Premium Wireless Headphones',
//     description: 'Noise-cancelling wireless headphones with premium sound quality and long battery life.',
//     price: 299.99,
//     discount: 20,
//     originalPrice: 374.99,
//     image: '/uploads/headphones.jpg',
//     bgColor: '#1a1a2e',
//     panelColor: '#16213e',
//     category: 'Electronics',
//     tags: ['wireless', 'audio', 'premium'],
//     createdAt: new Date('2024-01-15'),
//     updatedAt: new Date('2024-01-20')
//   },
//   {
//     id: 2,
//     name: 'Smart Fitness Watch',
//     description: 'Track your fitness with heart rate monitoring, GPS, and sleep tracking.',
//     price: 199.99,
//     discount: 15,
//     originalPrice: 234.99,
//     image: '/uploads/smartwatch.jpg',
//     bgColor: '#0c2461',
//     panelColor: '#1e3799',
//     category: 'Wearables',
//     tags: ['fitness', 'smartwatch', 'health'],
//     createdAt: new Date('2024-01-10'),
//     updatedAt: new Date('2024-01-18')
//   },
//   {
//     id: 3,
//     name: 'Organic Coffee Beans',
//     description: 'Premium organic coffee beans from Colombia, medium roast.',
//     price: 24.99,
//     discount: 10,
//     originalPrice: 27.77,
//     image: '/uploads/coffee.jpg',
//     bgColor: '#3c2a21',
//     panelColor: '#6d4c41',
//     category: 'Food',
//     tags: ['organic', 'coffee', 'premium'],
//     createdAt: new Date('2024-01-05'),
//     updatedAt: new Date('2024-01-12')
//   },
//   {
//     id: 4,
//     name: 'Yoga Mat Premium',
//     description: 'Non-slip yoga mat with carrying strap, perfect for all levels.',
//     price: 39.99,
//     discount: 0,
//     originalPrice: 39.99,
//     image: '/uploads/yogamat.jpg',
//     bgColor: '#1b5e20',
//     panelColor: '#2e7d32',
//     category: 'Fitness',
//     tags: ['yoga', 'fitness', 'mat'],
//     createdAt: new Date('2024-01-08'),
//     updatedAt: new Date('2024-01-08')
//   }
// ];

// Products page
// app.get('/products', (req, res) => {
//   const category = req.query.category || 'all';
//   const search = req.query.search || '';
//   const sort = req.query.sort || 'featured';

//   // Filter products
//   let filteredProducts = [...products];

//   // Filter by category
//   if (category !== 'all') {
//     filteredProducts = filteredProducts.filter(p => p.category === category);
//   }

//   // Filter by search
//   if (search) {
//     filteredProducts = filteredProducts.filter(p =>
//       p.name.toLowerCase().includes(search.toLowerCase()) ||
//       p.description.toLowerCase().includes(search.toLowerCase())
//     );
//   }

//   // Sort products
//   switch (sort) {
//     case 'price-low':
//       filteredProducts.sort((a, b) => a.price - b.price);
//       break;
//     case 'price-high':
//       filteredProducts.sort((a, b) => b.price - a.price);
//       break;
//     case 'rating':
//       filteredProducts.sort((a, b) => b.rating - a.rating);
//       break;
//     case 'newest':
//       filteredProducts.sort((a, b) => b.id - a.id);
//       break;
//   }

//   // Get unique categories
//   const categories = ['all', ...new Set(products.map(p => p.category))];

//   res.render('products/index', {
//     title: 'Products',
//     products: filteredProducts,
//     categories,
//     user: req.session.user,
//     currentPage: 'products',
//     currentCategory: category,
//     currentSearch: search,
//     currentSort: sort
//   });
// });

// Product detail page
// app.get('/products/:id', requireAuth, (req, res) => {
//   const productId = parseInt(req.params.id);
//   const product = products.find(p => p.id === productId);

//   if (!product) {
//     return res.status(404).render('error', {
//       title: 'Product Not Found',
//       message: 'The product you are looking for does not exist.'
//     });
//   }

//   // Get related products (same category)
//   const relatedProducts = products
//     .filter(p => p.category === product.category && p.id !== product.id)
//     .slice(0, 4);

//   res.render('products/detail', {
//     title: product.name,
//     product,
//     relatedProducts,
//     currentPage: 'products',
//     user: req.session.user
//   });
// });

// Add to cart (simplified)
// app.post('/cart/add', requireAuth, (req, res) => {
//   const { productId, quantity = 1 } = req.body;

//   if (!req.session.cart) {
//     req.session.cart = [];
//   }

//   const existingItem = req.session.cart.find(item => item.productId === parseInt(productId));

//   if (existingItem) {
//     existingItem.quantity += parseInt(quantity);
//   } else {
//     req.session.cart.push({
//       productId: parseInt(productId),
//       quantity: parseInt(quantity),
//       addedAt: new Date()
//     });
//   }

//   res.json({ success: true, cartCount: req.session.cart.length });
// });

// Cart page
// app.get('/cart', requireAuth, (req, res) => {
//   const cartItems = req.session.cart || [];
//   const cartProducts = cartItems.map(item => {
//     const product = products.find(p => p.id === item.productId);
//     return {
//       ...product,
//       quantity: item.quantity,
//       total: product.price * item.quantity
//     };
//   });

//   const subtotal = cartProducts.reduce((sum, item) => sum + item.total, 0);
//   const shipping = subtotal > 100 ? 0 : 9.99;
//   const tax = subtotal * 0.08;
//   const total = subtotal + shipping + tax;

//   res.render('cart', {
//     title: 'Shopping Cart',
//     cartProducts,
//     subtotal,
//     shipping,
//     tax,
//     total,
//     user: req.session.user
//   });
// });

// app.get('/products/new', (req, res) => {
//   res.render('products/create', {
//     title: 'Add New Product',
//     user: req.session.user,
//     product: {},
//     categories: ['Electronics', 'Fashion', 'Home', 'Food', 'Sports', 'Books', 'Other'],
//     colorPresets: [
//       { name: 'Dark Blue', bg: '#1a1a2e', panel: '#16213e' },
//       { name: 'Ocean Blue', bg: '#0c2461', panel: '#1e3799' },
//       { name: 'Forest Green', bg: '#1b5e20', panel: '#2e7d32' },
//       { name: 'Warm Brown', bg: '#3c2a21', panel: '#6d4c41' },
//       { name: 'Purple', bg: '#4a148c', panel: '#6a1b9a' },
//       { name: 'Red', bg: '#b71c1c', panel: '#d32f2f' },
//       { name: 'Dark Gray', bg: '#212121', panel: '#424242' },
//       { name: 'Custom', bg: '#ffffff', panel: '#f5f5f5' }
//     ]
//   });
// });

// app.post('/products', requireAuth, upload.single('image'), (req, res) => {
//   try {
//     const {
//       name,
//       description,
//       price,
//       discount,
//       originalPrice,
//       category,
//       bgColor,
//       panelColor,
//       tags
//     } = req.body;

//     // Validate required fields
//     if (!name || !price) {
//       throw new Error('Name and price are required');
//     }

//     // Create new product
//     const newProduct = {
//       id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
//       name,
//       description: description || '',
//       price: parseFloat(price),
//       discount: discount ? parseInt(discount) : 0,
//       originalPrice: originalPrice ? parseFloat(originalPrice) : parseFloat(price),
//       image: req.file ? '/uploads/' + req.file.filename : '/images/default-product.jpg',
//       bgColor: bgColor || '#ffffff',
//       panelColor: panelColor || '#f5f5f5',
//       category: category || 'Other',
//       tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
//       createdAt: new Date(),
//       updatedAt: new Date()
//     };

//     products.push(newProduct);

//     res.redirect('/products');
//   } catch (error) {
//     console.error('Error creating product:', error);
//     res.redirect('/products/new?error=' + encodeURIComponent(error.message));
//   }
// });

app.get('/', async (req, res) => {
  res.send("Hello from ecomm API")
})

app.get('/test', async (req, res) => {
  const result = await pool.query("SELECT current_database()")
  res.send("database: " + result.rows[0].current_database)
})

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

// app.use('/histories', historyOrdersRouter)

app.get('/accounts/profile', verifyToken, getProfile)
app.patch('/accouts/profile', verifyToken, updateProfile)

app.use((err, req, res, next) => {
    const errStatus = err.status || 500
    const errMessage = err.message || "Server error"

    return res.status(500).json({error: errStatus, message: errMessage, errorStack : err.stack})
})

const PORT = process.env.PORT || 3030

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})