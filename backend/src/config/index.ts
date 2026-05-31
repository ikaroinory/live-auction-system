import dotenv from 'dotenv'

dotenv.config()

export default {
  port: parseInt(process.env.PORT || '3001', 10),
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: '7d'
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    timeout: parseInt(process.env.REDIS_TIMEOUT || '30000', 10),
    maxConnections: parseInt(process.env.REDIS_MAX_CONNECTIONS || '10', 10),
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'auction:'
  }
}
