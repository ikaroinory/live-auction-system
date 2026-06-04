import { Request, Response, NextFunction } from 'express'

interface PrismaError {
  code: string
  meta?: Record<string, unknown>
}

interface ValidationError extends Error {
  name: 'ValidationError'
  errors: Record<string, unknown>
}

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  console.error('Error:', error)

  if (error instanceof Error && error.name === 'ValidationError') {
    const validationError = error as ValidationError
    return res.status(400).json({
      message: '验证错误',
      errors: validationError.errors
    })
  }

  if (error instanceof Error) {
    const prismaError = error as unknown as PrismaError
    if (prismaError.code === 'P2002') {
      return res.status(409).json({
        message: '资源已存在'
      })
    }

    if (prismaError.code === 'P2025') {
      return res.status(404).json({
        message: '资源不存在'
      })
    }
  }

  res.status(500).json({
    message: '服务器内部错误'
  })
}