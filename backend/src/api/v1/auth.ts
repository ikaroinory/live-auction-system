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

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: 用户注册
 *     tags: [认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - password
 *             properties:
 *               phone:
 *                 type: string
 *                 description: 手机号
 *                 example: "13800138000"
 *               password:
 *                 type: string
 *                 description: 密码
 *                 example: "password123"
 *               nickname:
 *                 type: string
 *                 description: 昵称（可选）
 *                 example: "张三"
 *     responses:
 *       201:
 *         description: 注册成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *       400:
 *         description: 参数错误
 */
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

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: 用户登录
 *     tags: [认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - password
 *             properties:
 *               phone:
 *                 type: string
 *                 description: 手机号
 *                 example: "13800138000"
 *               password:
 *                 type: string
 *                 description: 密码
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 认证失败
 */
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

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: 获取当前用户信息
 *     tags: [认证]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: 未认证
 *       404:
 *         description: 用户不存在
 */
router.get(
  '/me',
  authMiddleware,
  wrapAuthHandler(async (req: Request, res: Response<UserResponse>) => {
    const user = requireAuth(req)

    const [userData, stats] = await Promise.all([
      prisma.user.findUnique({
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
      }),
      prisma.$queryRaw<
        Array<{
          likes: number
          mutual: number
          following: number
          followers: number
        }>
      >`
        SELECT 
          COALESCE((SELECT COUNT(*) FROM Bid b WHERE b.userId = ${user.id}), 0) as likes,
          COALESCE((SELECT COUNT(*) FROM LiveRoomFollow lrf WHERE lrf.userId = ${user.id}), 0) as mutual,
          COALESCE((SELECT COUNT(*) FROM LiveRoomFollow lrf WHERE lrf.userId = ${user.id}), 0) as following,
          COALESCE((SELECT COUNT(DISTINCT lrf.userId) FROM LiveRoomFollow lrf 
            INNER JOIN LiveRoom lr ON lrf.liveRoomId = lr.id 
            WHERE lr.streamerId = ${user.id}), 0) as followers
      `
    ])

    if (!userData) {
      return res.status(404).json({ message: '用户不存在' } as unknown as UserResponse)
    }

    const response: UserResponse = {
      ...userData,
      birthday: userData.birthday ? userData.birthday.toISOString().split('T')[0] : undefined,
      createdAt: userData.createdAt.toISOString(),
      likes: Number(stats[0]?.likes) || 0,
      mutual: Number(stats[0]?.mutual) || 0,
      following: Number(stats[0]?.following) || 0,
      followers: Number(stats[0]?.followers) || 0
    }

    res.json(response)
  })
)

/**
 * @swagger
 * /api/v1/auth/sms-login:
 *   post:
 *     summary: 短信验证码登录
 *     tags: [认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - code
 *             properties:
 *               phone:
 *                 type: string
 *                 description: 手机号
 *                 example: "13800138000"
 *               code:
 *                 type: string
 *                 description: 验证码（测试环境：123456 或 666666）
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *       400:
 *         description: 参数错误或验证码错误
 */
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

/**
 * @swagger
 * /api/v1/auth/avatar:
 *   put:
 *     summary: 更新用户头像
 *     tags: [认证]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 description: 头像 URL
 *                 example: "https://example.com/avatar.jpg"
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未认证
 */
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

/**
 * @swagger
 * /api/v1/auth/profile:
 *   put:
 *     summary: 更新用户资料
 *     tags: [认证]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *                 description: 昵称
 *                 example: "张三"
 *               bio:
 *                 type: string
 *                 description: 个人简介
 *                 example: "喜欢收藏"
 *               gender:
 *                 type: number
 *                 description: 性别（0: 未知, 1: 男, 2: 女）
 *                 example: 1
 *               birthday:
 *                 type: string
 *                 format: date
 *                 description: 生日
 *                 example: "1990-01-01"
 *               location:
 *                 type: string
 *                 description: 所在地
 *                 example: "北京"
 *               douyinId:
 *                 type: string
 *                 description: 抖音号
 *                 example: "douyin123"
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未认证
 */
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
