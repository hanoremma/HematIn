const express = require('express')
const cors = require('cors')

require('dotenv').config()

const authRoutes = require('./routes/authRoutes')
const walletRoutes = require('./routes/walletRoutes')
const categoryRoutes = require('./routes/categoryRoutes')
const transactionRoutes = require('./routes/transactionRoutes')
const budgetRoutes = require('./routes/budgetRoutes')
const transactionImgRoutes = require('./routes/transactionImgRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')
const recommendationRoutes = require('./routes/recommendationRoutes');

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {

  res.json({
    message: 'API Hematin berjalan'
  })

})

app.use('/auth', authRoutes)
app.use('/wallet', walletRoutes)
app.use('/category', categoryRoutes)
app.use('/transaction', transactionRoutes)
app.use('/budget', budgetRoutes)
app.use('/transaction-img', transactionImgRoutes)
app.use('/dashboard', dashboardRoutes)
app.use('/recommendation', recommendationRoutes);


app.listen(3000, () => {

  console.log('Server running on port 3000')

})