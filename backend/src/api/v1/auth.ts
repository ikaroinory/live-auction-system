import { Router, Request, Response } from 'express'
import type { ParamsDictionary } from 'express-serve-static-core'
import { prisma } from '../../lib/prisma'
import { AuthService } from '../../services/auth.service'
import { authMiddleware } from '../../middleware/auth'
import { getLocationFromRequest } from '../../utils/ipLocation'
import { wrapAuthHandler, wrapHandler, requireAuth } from '../utils'
import type { UserResponse } from '../response'

interface LoginResponse {
  user: UserResponse
  token: string
}

const router = Router()
const authService = new AuthService()

interface RegisterRequest {
  phone: string
  password: string
  nickname?: string
}

interface LoginRequest {
  phone: string
  password: string
}

interface SmsLoginRequest {
  phone: string
  code: string
}

interface UpdateAvatarRequest {
  avatar: string
}

interface UpdateProfileRequest {
  nickname?: string
  bio?: string
  gender?: number
  birthday?: string
  location?: string
  douyinId?: string
}

router.post(
  '/register',
  wrapHandler(
    async (
      req: Request<ParamsDictionary, LoginResponse, RegisterRequest>,
      res: Response<LoginResponse>
    ) => {
      const { phone, password, nickname } = req.body

      if (!phone || !password) {
        return res.status(400).json({ message: '手机号和密码不能为空' } as unknown as LoginResponse)
      }

      const location = getLocationFromRequest(req)
      const result = await authService.register(phone, password, nickname, location)

      res.status(201).json(result)
    }
  )
)

router.post(
  '/login',
  wrapHandler(
    async (
      req: Request<ParamsDictionary, LoginResponse, LoginRequest>,
      res: Response<LoginResponse>
    ) => {
      const { phone, password } = req.body

      if (!phone || !password) {
        return res.status(400).json({ message: '手机号和密码不能为空' } as unknown as LoginResponse)
      }

      const result = await authService.login(phone, password)

      res.json(result)
    }
  )
)

router.get(
  '/me',
  authMiddleware,
  wrapAuthHandler(async (req: Request, res: Response<UserResponse>) => {
    const user = requireAuth(req)

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        phone: true,
        nickname: true,
        avatar: true,
        bio: true,
        gender: true,
        birthday: true,
        location: true,
        douyinId: true,
        createdAt: true
      }
    })

    if (!userData) {
      return res.status(404).json({ message: '用户不存在' } as unknown as UserResponse)
    }

    const response: UserResponse = {
      ...userData,
      birthday: userData.birthday ? userData.birthday.toISOString().split('T')[0] : undefined,
      createdAt: userData.createdAt.toISOString()
    }

    res.json(response)
  })
)

router.post(
  '/sms-login',
  wrapHandler(
    async (
      req: Request<ParamsDictionary, LoginResponse, SmsLoginRequest>,
      res: Response<LoginResponse>
    ) => {
      const { phone, code } = req.body

      if (!phone || !code) {
        return res
          .status(400)
          .json({ message: '手机号和验证码不能为空' } as unknown as LoginResponse)
      }

      if (!/^1[3-9]\d{9}$/.test(phone)) {
        return res.status(400).json({ message: '手机号格式不正确' } as unknown as LoginResponse)
      }

      if (code !== '123456' && code !== '666666') {
        return res.status(400).json({ message: '验证码错误' } as unknown as LoginResponse)
      }

      const location = getLocationFromRequest(req)
      const result = await authService.loginOrRegisterByPhone(phone, code, location)

      res.json(result)
    }
  )
)

router.put(
  '/avatar',
  authMiddleware,
  wrapAuthHandler(
    async (
      req: Request<ParamsDictionary, UserResponse, UpdateAvatarRequest>,
      res: Response<UserResponse>
    ) => {
      const user = requireAuth(req)
      const { avatar } = req.body

      if (!avatar) {
        return res.status(400).json({ message: '头像 URL 不能为空' } as unknown as UserResponse)
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { avatar },
        select: {
          id: true,
          phone: true,
          nickname: true,
          avatar: true,
          bio: true,
          gender: true,
          birthday: true,
          location: true,
          douyinId: true,
          createdAt: true
        }
      })

      const response: UserResponse = {
        ...updatedUser,
        birthday: updatedUser.birthday
          ? updatedUser.birthday.toISOString().split('T')[0]
          : undefined,
        createdAt: updatedUser.createdAt.toISOString()
      }

      res.json(response)
    }
  )
)

router.put(
  '/profile',
  authMiddleware,
  wrapAuthHandler(
    async (
      req: Request<ParamsDictionary, UserResponse, UpdateProfileRequest>,
      res: Response<UserResponse>
    ) => {
      const user = requireAuth(req)
      const { nickname, bio, gender, birthday, location, douyinId } = req.body

      const updateData: Partial<{
        nickname: string | null
        bio: string | null
        gender: number | undefined
        birthday: Date | null
        location: string
        douyinId: string | undefined
      }> = {}

      if (nickname !== undefined) {
        updateData.nickname = nickname === '' ? null : nickname
      }
      if (bio !== undefined) {
        updateData.bio = bio === '' ? null : bio
      }
      if (gender !== undefined) {
        updateData.gender = gender
      }
      if (birthday !== undefined) {
        updateData.birthday = birthday ? new Date(birthday) : null
      }
      if (location !== undefined) {
        updateData.location = location || '未知'
      }
      if (douyinId !== undefined) {
        updateData.douyinId = douyinId
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: updateData,
        select: {
          id: true,
          phone: true,
          nickname: true,
          avatar: true,
          bio: true,
          gender: true,
          birthday: true,
          location: true,
          douyinId: true,
          createdAt: true
        }
      })

      const response: UserResponse = {
        ...updatedUser,
        birthday: updatedUser.birthday
          ? updatedUser.birthday.toISOString().split('T')[0]
          : undefined,
        createdAt: updatedUser.createdAt.toISOString()
      }

      res.json(response)
    }
  )
)

export default router
