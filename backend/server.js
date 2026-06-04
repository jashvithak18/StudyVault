import http from 'http'
import { config } from 'dotenv'
import { connect } from 'mongoose'
import app from './app.js'
import { initSocket } from './config/socket.js'
config()
// connect to the database & start server
const connectDB = async () => { 
  try {
    await connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studyvault')
    console.log("DB Connected")
    const server = http.createServer(app)
    // initialize whiteboard sockets
    initSocket(server)
    const port = process.env.PORT || 5000
    server.listen(port, () => console.log(`StudyVault server listening on port ${port}...`))
  } catch (err) {
    console.log("Error in db connection", err)
    process.exit(1)
  }
}
connectDB()
