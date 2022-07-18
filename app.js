import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors';
import connectDB from './config/connectdb.js'
import userRoutes from './routes/userRoutes.js'


// const path = import('path');

// app.use(express.static('public'))

// app.set('views', path.join(__dirname, 'views'))


const app = express()
const port = process.env.PORT
const DATABASE_URL = process.env.DATABASE_URL

// CORS Policy for finding errors whene we connect with front end
app.use(cors())

// Database Connection
connectDB(DATABASE_URL)

// we use JSON  for making API
app.use(express.json())

// Load Routes
app.use("/api/user", userRoutes)
// app.use('/',userRoutes)
// app.use("/api/user",TransactionDetails)



app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})

app.set('view engine', 'ejs');

// app.set('views', path.join(__dirname, 'views'))

// module.exports = app;