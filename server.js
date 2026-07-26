const jsonServer = require('json-server')
const crypto = require('crypto')
const path = require('path')

const server = jsonServer.create()
const router = jsonServer.router(path.join(__dirname, 'db.json'))
const middlewares = jsonServer.defaults({})

// Configure CORS with environment-specific settings
server.use((req, res, next) => {
  const origin = req.headers.origin
  const nodeEnv = process.env.NODE_ENV || 'development'
  
  // List of allowed origins
  const allowedOrigins = [
    'http://localhost:5173',          // Local Vite dev
    'http://localhost:3000',          // Local production build
    'http://127.0.0.1:5173',          // Local fallback
    'http://127.0.0.1:3000',          // Local fallback
    'http://localhost',               // Localhost
    process.env.FRONTEND_URL,         // Production frontend from env
  ].filter(url => url && url.trim())  // Filter out empty strings
  
  // In development: allow all origins for easier testing
  if (nodeEnv === 'development' || process.env.ALLOW_ALL_CORS === 'true') {
    res.header('Access-Control-Allow-Origin', '*')
  } else {
    // In production: only allow specific origins
    if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin)
    } else if (origin) {
      // Log rejected origins for debugging
      console.warn(`[CORS] Rejected origin: ${origin}`)
    }
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Max-Age', '86400')
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

server.use(middlewares)
server.use(jsonServer.bodyParser)

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

function omitPassword(user) {
  const { passwordHash, ...rest } = user
  return rest
}

server.post('/login', (req, res) => {
  const { email, passwordHash } = req.body
  if (!email || !passwordHash) {
    return res.status(400).json({ error: 'Email and password are required.' })
  }

  const user = router.db.get('users').find({ email }).value()
  if (!user || user.passwordHash !== passwordHash) {
    return res.status(401).json({ error: 'Invalid credentials.' })
  }

  return res.json(omitPassword(user))
})

server.post('/admin-login', (req, res) => {
  const { email, passwordHash } = req.body
  if (!email || !passwordHash) {
    return res.status(400).json({ error: 'Email and password are required.' })
  }

  const user = router.db.get('users').find({ email }).value()
  if (!user || user.passwordHash !== passwordHash) {
    return res.status(401).json({ error: 'Invalid credentials.' })
  }

  if (user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required.' })
  }

  // Update last login
  router.db
    .get('users')
    .find({ id: user.id })
    .assign({ lastLogin: new Date().toISOString() })
    .write()

  return res.json(omitPassword(user))
})

server.post('/register', (req, res) => {
  const {
    fullName,
    businessName,
    email,
    phone,
    password,
    confirmPassword,
    gstNumber,
    businessAddress,
    businessType,
    logoUrl,
    invoicePrefix,
    currency,
    taxSettings,
  } = req.body

  if (!fullName || !email || !phone || !password || !confirmPassword) {
    return res.status(400).json({ error: 'Full name, email, phone and password are required.' })
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' })
  }

  const existingEmail = router.db.get('users').find({ email }).value()
  if (existingEmail) {
    return res.status(400).json({ error: 'Email is already registered.' })
  }

  const normalizedPhone = phone.replace(/\D/g, '')
  const existingPhone = router.db.get('users').find(u => u.phone.replace(/\D/g, '') === normalizedPhone).value()
  if (existingPhone) {
    return res.status(400).json({ error: 'Mobile number is already registered.' })
  }

  const id = `u${Date.now()}`
  const user = {
    id,
    fullName,
    businessName: businessName || `${fullName}'s Business`,
    email,
    phone: normalizedPhone,
    passwordHash: hashPassword(password),
    gstNumber: gstNumber || '',
    businessAddress: businessAddress || '',
    businessType: businessType || '',
    logoUrl: logoUrl || '',
    invoicePrefix: invoicePrefix || 'INV',
    currency: currency || 'INR',
    taxSettings: taxSettings || 'GST',
    createdAt: new Date().toISOString(),
  }

  router.db.get('users').push(user).write()

  const business = {
    id: `b${Date.now()}`,
    userId: id,
    name: user.businessName,
    gstin: user.gstNumber,
  }
  router.db.get('businesses').push(business).write()

  const settings = {
    id: `s${Date.now()}`,
    userId: id,
    requireGSTIN: false,
    stopOnNegativeStock: true,
    passcodeLock: false,
    auditTrail: true,
    printTheme: 'GST Theme 1',
  }
  router.db.get('settings').push(settings).write()

  return res.json(omitPassword(user))
})

server.post('/reset-password', (req, res) => {
  const { email, phone, newPassword } = req.body
  if (!email || !phone || !newPassword) {
    return res.status(400).json({ error: 'Email, phone, and new password are required.' })
  }

  const normalizedPhone = phone.replace(/\D/g, '')
  const user = router.db
    .get('users')
    .find(u => u.email === email && u.phone.replace(/\D/g, '') === normalizedPhone)
    .value()

  if (!user) {
    return res.status(400).json({ error: 'Could not verify account with the provided email and phone number.' })
  }

  router.db
    .get('users')
    .find({ id: user.id })
    .assign({ passwordHash: hashPassword(newPassword) })
    .write()

  return res.json({ message: 'Password reset successfully.' })
})

server.delete('/account', (req, res) => {
  const { password } = req.body
  if (!password) {
    return res.status(400).json({ error: 'Password is required.' })
  }

  const auth = req.headers.authorization || ''
  const userId = auth.startsWith('Bearer ') ? auth.slice(7).trim() : null
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required.' })
  }

  const user = router.db.get('users').find({ id: userId }).value()
  if (!user) {
    return res.status(404).json({ error: 'User not found.' })
  }

  const passwordHash = hashPassword(password)
  if (user.passwordHash !== passwordHash) {
    return res.status(401).json({ error: 'Incorrect password.' })
  }

  try {
    const collections = ['businesses', 'products', 'customers', 'sales', 'purchases', 'expenses', 'settings']

    for (const collection of collections) {
      const items = router.db.get(collection).filter(item => item.userId === userId).value()
      items.forEach(item => {
        router.db.get(collection).remove({ id: item.id }).write()
      })
    }

    router.db.get('users').remove({ id: userId }).write()

    return res.json({ success: true, message: 'Your account has been permanently deleted.' })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete account.' })
  }
})

// Admin endpoints
function isAdmin(req, res, next) {
  const auth = req.headers.authorization || ''
  const adminId = auth.startsWith('Bearer ') ? auth.slice(7).trim() : null
  if (!adminId) {
    return res.status(401).json({ error: 'Authentication required.' })
  }

  const admin = router.db.get('users').find({ id: adminId }).value()
  if (!admin || admin.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required.' })
  }

  req.adminId = adminId
  next()
}

server.get('/admin/users', isAdmin, (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const offset = (page - 1) * limit

  const allUsers = router.db.get('users').filter(u => u.role !== 'ADMIN').value()
  const total = allUsers.length
  const users = allUsers.slice(offset, offset + limit).map(omitPassword)

  return res.json({
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  })
})

server.get('/admin/users/search/:term', isAdmin, (req, res) => {
  const term = decodeURIComponent(req.params.term).toLowerCase()
  const users = router.db.get('users')
    .filter(u => u.role !== 'ADMIN' && (
      u.fullName.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.businessName.toLowerCase().includes(term) ||
      u.phone.includes(term)
    ))
    .value()
    .map(omitPassword)

  return res.json(users)
})

server.get('/admin/users/:id', isAdmin, (req, res) => {
  const user = router.db.get('users').find({ id: req.params.id }).value()
  if (!user || user.role === 'ADMIN') {
    return res.status(404).json({ error: 'User not found.' })
  }

  const businesses = router.db.get('businesses').filter({ userId: user.id }).value()
  const products = router.db.get('products').filter({ userId: user.id }).value()
  const customers = router.db.get('customers').filter({ userId: user.id }).value()
  const sales = router.db.get('sales').filter({ userId: user.id }).value()
  const purchases = router.db.get('purchases').filter({ userId: user.id }).value()

  const totalSalesAmount = sales.reduce((sum, s) => sum + (parseFloat(s.total) || 0), 0)
  const totalPurchasesAmount = purchases.reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0)

  return res.json({
    ...omitPassword(user),
    statistics: {
      totalBusinesses: businesses.length,
      totalProducts: products.length,
      totalCustomers: customers.length,
      totalSales: sales.length,
      totalPurchases: purchases.length,
      totalSalesAmount,
      totalPurchasesAmount,
    },
  })
})

server.patch('/admin/users/:id', isAdmin, (req, res) => {
  const user = router.db.get('users').find({ id: req.params.id }).value()
  if (!user || user.role === 'ADMIN') {
    return res.status(404).json({ error: 'User not found.' })
  }

  const { status } = req.body
  if (!status) {
    return res.status(400).json({ error: 'Status is required.' })
  }

  router.db
    .get('users')
    .find({ id: req.params.id })
    .assign({ status, updatedAt: new Date().toISOString() })
    .write()

  const updatedUser = router.db.get('users').find({ id: req.params.id }).value()
  return res.json(omitPassword(updatedUser))
})

server.post('/admin/users/:id/reset-password', isAdmin, (req, res) => {
  const user = router.db.get('users').find({ id: req.params.id }).value()
  if (!user || user.role === 'ADMIN') {
    return res.status(404).json({ error: 'User not found.' })
  }

  const tempPassword = Math.random().toString(36).slice(2, 10)
  const passwordHash = hashPassword(tempPassword)

  router.db
    .get('users')
    .find({ id: req.params.id })
    .assign({ passwordHash })
    .write()

  return res.json({
    success: true,
    message: 'Password reset successful. Temporary password has been set.',
    tempPassword: tempPassword,
  })
})

server.delete('/admin/users/:id', isAdmin, (req, res) => {
  const user = router.db.get('users').find({ id: req.params.id }).value()
  if (!user || user.role === 'ADMIN') {
    return res.status(404).json({ error: 'User not found.' })
  }

  try {
    const userId = req.params.id
    const collections = ['businesses', 'products', 'customers', 'sales', 'purchases', 'expenses', 'settings']

    for (const collection of collections) {
      const items = router.db.get(collection).filter(item => item.userId === userId).value()
      items.forEach(item => {
        router.db.get(collection).remove({ id: item.id }).write()
      })
    }

    router.db.get('users').remove({ id: userId }).write()

    return res.json({ success: true, message: 'User account deleted successfully.' })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete user.' })
  }
})

server.get('/admin/dashboard-stats', isAdmin, (req, res) => {
  const users = router.db.get('users').filter(u => u.role !== 'ADMIN').value()
  const businesses = router.db.get('businesses').value()
  const products = router.db.get('products').value()
  const customers = router.db.get('customers').value()
  const sales = router.db.get('sales').value()
  const purchases = router.db.get('purchases').value()

  const totalSalesAmount = sales.reduce((sum, s) => sum + (parseFloat(s.total) || 0), 0)
  const totalPurchasesAmount = purchases.reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0)
  const totalRevenue = totalSalesAmount
  const activeUsers = users.filter(u => u.status === 'active').length
  const recentUsers = users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)

  return res.json({
    totalUsers: users.length,
    totalBusinesses: businesses.length,
    totalProducts: products.length,
    totalCustomers: customers.length,
    totalSales: sales.length,
    totalPurchases: purchases.length,
    totalRevenue,
    activeUsers,
    recentUsers: recentUsers.map(omitPassword),
    stats: {
      totalSalesAmount,
      totalPurchasesAmount,
    },
  })
})

server.use((req, res, next) => {
  const publicPaths = ['/login', '/register', '/reset-password']
  if (publicPaths.includes(req.path)) {
    return next()
  }

  const auth = req.headers.authorization || ''
  const userId = auth.startsWith('Bearer ') ? auth.slice(7).trim() : null
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required.' })
  }

  req.userId = userId

  if (req.method === 'GET') {
    if (req.path.startsWith('/users')) {
      return next()
    }
    req.query = req.query || {}
    req.query.userId = userId
  }

  if (req.method === 'POST') {
    if (!req.path.startsWith('/users')) {
      req.body = req.body || {}
      req.body.userId = userId
    }
  }

  if (['PATCH', 'PUT', 'DELETE'].includes(req.method)) {
    const match = req.path.match(/^\/([^\/]+)\/([^\/]+)/)
    if (match) {
      const collection = match[1]
      const id = match[2]
      const item = router.db.get(collection).find({ id }).value()
      if (!item || item.userId !== userId) {
        return res.status(404).json({ error: 'Resource not found.' })
      }
      if (collection === 'users' && id !== userId) {
        return res.status(403).json({ error: 'Cannot modify another user.' })
      }
    }
  }

  next()
})

server.use(router)

const port = process.env.PORT || 4000
const host = process.env.HOST || '0.0.0.0'

server.listen(port, host, () => {
  const address = host === '0.0.0.0' ? 'localhost' : host
  console.log(`JSON Server is running on http://${address}:${port}`)
  if (host === '0.0.0.0') {
    console.log(`[Mobile Access] Use your machine IP address instead of localhost`)
    console.log(`[Example] http://<YOUR_IP>:${port}`)
  }
})
