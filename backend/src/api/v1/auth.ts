import { Router, Request, Response } from 'express';
import { AuthService } from '../../services/auth.service';
import { authMiddleware, AuthRequest } from '../../middleware/auth';

const router = Router();
const authService = new AuthService();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags: [认证]
 *     summary: 用户注册
 *     description: 创建新用户账号
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: 用户名
 *               password:
 *                 type: string
 *                 description: 密码
 *               nickname:
 *                 type: string
 *                 description: 昵称
 *     responses:
 *       201:
 *         description: 注册成功
 *       400:
 *         description: 参数错误
 *       409:
 *         description: 用户名已存在
 */
router.post('/register', async (req: Request, res: Response, next: Function) => {
  try {
    const { username, password, nickname } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码不能为空' });
    }
    
    const result = await authService.register(username, password, nickname);
    
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [认证]
 *     summary: 用户登录
 *     description: 用户登录获取认证令牌
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: 用户名
 *               password:
 *                 type: string
 *                 description: 密码
 *     responses:
 *       200:
 *         description: 登录成功
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 认证失败
 */
router.post('/login', async (req: Request, res: Response, next: Function) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码不能为空' });
    }
    
    const result = await authService.login(username, password);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     tags: [认证]
 *     summary: 获取当前用户信息
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取用户信息
 *       401:
 *         description: 未认证
 */
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response, next: Function) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: '未认证' });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        nickname: true,
        avatar: true,
        createdAt: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
