import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import config from '../config';

export class AuthService {
  async register(username: string, password: string, nickname?: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        nickname: nickname || username
      }
    });
    
    const token = this.generateToken(user.id, user.username);
    
    return {
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname
      },
      token
    };
  }
  
  async login(username: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { username }
    });
    
    if (!user) {
      throw new Error('用户不存在');
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new Error('密码错误');
    }
    
    const token = this.generateToken(user.id, user.username);
    
    return {
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname
      },
      token
    };
  }
  
  private generateToken(userId: string, username: string) {
    return jwt.sign(
      { id: userId, username },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }
}
