import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import config from '../config';
import { Gender } from '@live-auction/shared';

function generateRandomDouyinId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export class AuthService {
  async register(phone: string, password: string, nickname?: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    let douyinId = generateRandomDouyinId();
    let isUnique = false;
    
    while (!isUnique) {
      const existing = await prisma.user.findUnique({
        where: { douyinId }
      });
      if (!existing) {
        isUnique = true;
      } else {
        douyinId = generateRandomDouyinId();
      }
    }
    
    const user = await prisma.user.create({
      data: {
        phone,
        password: hashedPassword,
        nickname: nickname || phone,
        douyinId,
        gender: Gender.UNKNOWN,
        location: '中国·广东·深圳'
      }
    });
    
    const token = this.generateToken(user.id, user.phone);
    
    return {
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
        bio: user.bio,
        gender: user.gender,
        birthday: user.birthday ? user.birthday.toISOString().split('T')[0] : undefined,
        location: user.location,
        douyinId: user.douyinId,
        createdAt: user.createdAt.toISOString()
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
        nickname: user.nickname,
        avatar: user.avatar,
        bio: user.bio,
        gender: user.gender,
        birthday: user.birthday ? user.birthday.toISOString().split('T')[0] : undefined,
        location: user.location,
        douyinId: user.douyinId,
        createdAt: user.createdAt.toISOString()
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
          avatar: existingUser.avatar,
          bio: existingUser.bio,
          gender: existingUser.gender,
          birthday: existingUser.birthday ? existingUser.birthday.toISOString().split('T')[0] : undefined,
          location: existingUser.location,
          douyinId: existingUser.douyinId,
          createdAt: existingUser.createdAt.toISOString()
        },
        token,
        isNewUser: false
      };
    }

    let douyinId = generateRandomDouyinId();
    let isUnique = false;
    
    while (!isUnique) {
      const existing = await prisma.user.findUnique({
        where: { douyinId }
      });
      if (!existing) {
        isUnique = true;
      } else {
        douyinId = generateRandomDouyinId();
      }
    }

    const defaultPassword = await bcrypt.hash('sms_login_' + phone, 10);
    const newUser = await prisma.user.create({
      data: {
        phone,
        password: defaultPassword,
        nickname: `用户${phone.slice(-4)}`,
        douyinId,
        gender: Gender.UNKNOWN,
        location: '中国·广东·深圳'
      }
    });

    const token = this.generateToken(newUser.id, newUser.phone);
    
    return {
      user: {
        id: newUser.id,
        phone: newUser.phone,
        nickname: newUser.nickname,
        avatar: newUser.avatar,
        bio: newUser.bio,
        gender: newUser.gender,
        birthday: newUser.birthday ? newUser.birthday.toISOString().split('T')[0] : undefined,
        location: newUser.location,
        douyinId: newUser.douyinId,
        createdAt: newUser.createdAt.toISOString()
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