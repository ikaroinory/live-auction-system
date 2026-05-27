import { Request, Response, NextFunction } from 'express'

export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', error)

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: '验证错误',
      errors: error.errors,
    })
  }

  if (error.code === 'P2002') {
    return res.status(409).json({
      message: '资源已存在',
    })
  }

  if (error.code === 'P2025') {
    return res.status(404).json({
      message: '资源不存在',
    })
  }

  res.status(500).json({
    message: '服务器内部错误',
  })
}
