import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import config from '../config'

export interface AuthRequest extends Request {
  user?: {
    id: string
    phone: string
  }
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({ message: '未提供认证令牌' })
    }

    const token = authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ message: '认证令牌格式错误' })
    }

    const decoded = jwt.verify(token, config.jwt.secret) as { id: string; phone: string }

    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ message: '无效的认证令牌' })
  }
}

// 可选认证中间件 - 有token就解析，没有也允许访问
export const optionalAuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization

    if (authHeader) {
      const token = authHeader.split(' ')[1]
      if (token) {
        try {
          const decoded = jwt.verify(token, config.jwt.secret) as { id: string; phone: string }
          req.user = decoded
        } catch (error) {
          // token 无效但不阻止访问
        }
      }
    }

    next()
  } catch (error) {
    // 任何错误都不阻止访问
    next()
  }
}
