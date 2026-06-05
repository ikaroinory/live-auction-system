import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import swaggerUi from 'swagger-ui-express'
import { createServer } from 'http'
import config from './config'
import { swaggerSpec } from './config/swagger'
import apiRouter from './api'
import { errorHandler } from './middleware/errorHandler'
import { connectRedis, disconnectRedis } from './lib/redis'
import { setupWebSocket } from './lib/websocket'

dotenv.config()

const app = express()
const httpServer = createServer(app)

export const io = setupWebSocket(httpServer)

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use('/api', apiRouter)

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use(errorHandler)

async function startServer(): Promise<void> {
  try {
    await connectRedis()

    httpServer.listen(config.port, () => {
      console.log(`🚀 服务器运行在 http://localhost:${config.port}`)
      console.log(`📚 API 文档: http://localhost:${config.port}/api-docs`)
      console.log(`🔌 WebSocket 服务已启动`)
    })
  } catch (error) {
    console.error('❌ 服务器启动失败:', error)
    process.exit(1)
  }
}

process.on('SIGTERM', async () => {
  console.log('📢 收到 SIGTERM 信号，正在关闭服务器...')
  await disconnectRedis()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('📢 收到 SIGINT 信号，正在关闭服务器...')
  await disconnectRedis()
  process.exit(0)
})

startServer()
