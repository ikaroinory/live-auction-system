import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import swaggerUi from 'swagger-ui-express'
import config from './config'
import { swaggerSpec } from './config/swagger'
import apiRouter from './api'
import { errorHandler } from './middleware/errorHandler'

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// API Routes
app.use('/api', apiRouter)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Error handler
app.use(errorHandler)

// Start server
app.listen(config.port, () => {
  console.log(`🚀 服务器运行在 http://localhost:${config.port}`)
  console.log(`📚 API 文档: http://localhost:${config.port}/api-docs`)
})
