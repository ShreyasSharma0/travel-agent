import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import chatRoutes from './routes/chat.routes.js'

const app  = express()
const PORT = process.env.PORT || 3001

// ─── Middleware ──────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (e.g. curl, Postman) and listed origins
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true)
    cb(new Error(`CORS: origin ${origin} not allowed`))
  },
  methods: ['GET', 'POST'],
}))

app.use(express.json({ limit: '1mb' }))

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api', chatRoutes)

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[unhandled error]', err)
  res.status(500).json({ message: 'Internal server error' })
})

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✈  Travel CRM backend running on http://localhost:${PORT}`)
})
