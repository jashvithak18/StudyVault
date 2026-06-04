import exp from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { fileURLToPath } from 'url'
import path from 'path'
import { notFound, errorHandler } from './middlewares/errorMiddleware.js'
import authRoutes from './routes/authRoutes.js'
import notesRoutes from './routes/notesRoutes.js'
import doubtRoute from './routes/doubtRoute.js'
import aiRoutes from './routes/aiRoutes.js'
import whiteboardRoutes from './routes/whiteboardRoutes.js'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = exp()
app.use(cookieParser())
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin.endsWith('.vercel.app') || 
                      origin.endsWith('.onrender.com');
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}))
app.use(exp.json())
app.use(exp.urlencoded({ extended: true }))
// API Routes
app.use('/auth', authRoutes)
app.use('/user-api/notes', notesRoutes)
app.use('/user-api/forum', doubtRoute)
app.use('/user-api/ai', aiRoutes)
app.use('/user-api/whiteboard', whiteboardRoutes)
// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'StudyVault API' })
})
// Error handlers
app.use(notFound)
app.use(errorHandler)

export default app
