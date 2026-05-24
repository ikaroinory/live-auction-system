import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import config from '../config';

export class AuthService {
  async register(phone: string, password: string, nickname?: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        phone,
        password: hashedPassword,
        nickname: nickname || phone
      }
    });
    
    const token = this.generateToken(user.id, user.phone);
    
    return {
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname
      },
      token
    };
  }
  
  async login(phone: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { phone }
    });
    
    if (!user) {
      throw new Error('用户不存在');
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new Error('密码错误');
    }
    
    const token = this.generateToken(user.id, user.phone);
    
    return {
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname
      },
      token
    };
  }

  async loginOrRegisterByPhone(phone: string, code: string) {
    const existingUser = await prisma.user.findUnique({
      where: { phone }
    });

    if (existingUser) {
      const token = this.generateToken(existingUser.id, existingUser.phone);
      return {
        user: {
          id: existingUser.id,
          phone: existingUser.phone,
          nickname: existingUser.nickname,
          avatar: existingUser.avatar
        },
        token,
        isNewUser: false
      };
    }

    const defaultPassword = await bcrypt.hash('sms_login_' + phone, 10);
    const newUser = await prisma.user.create({
      data: {
        phone,
        password: defaultPassword,
        nickname: `用户${phone.slice(-4)}`
      }
    });

    const token = this.generateToken(newUser.id, newUser.phone);
    
    return {
      user: {
        id: newUser.id,
        phone: newUser.phone,
        nickname: newUser.nickname,
        avatar: newUser.avatar
      },
      token,
      isNewUser: true
    };
  }
  
  private generateToken(userId: string, phone: string) {
    return jwt.sign(
      { id: userId, phone },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }
}
