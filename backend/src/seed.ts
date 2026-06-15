import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import 'dotenv/config'

const prisma = new PrismaClient()

const SALT_ROUNDS = 10
const DEFAULT_PASSWORD = '123456'

const USER_NAMES = [
  { phone: '13800000001', nickname: '星辰大海' },
  { phone: '13800000002', nickname: '夏日微风' },
  { phone: '13800000003', nickname: '阳光少年' },
  { phone: '13800000004', nickname: '星空旅人' },
  { phone: '13800000005', nickname: '清晨阳光' },
  { phone: '13800000006', nickname: '梦想家' },
  { phone: '13800000007', nickname: '追风者' },
  { phone: '13800000008', nickname: '小确幸' },
  { phone: '13800000009', nickname: '时光机' },
  { phone: '13800000010', nickname: '薄荷糖' },
  { phone: '13800000011', nickname: '云卷云舒' },
  { phone: '13800000012', nickname: '岁月如歌' },
  { phone: '13800000013', nickname: '花开盛夏' },
  { phone: '13800000014', nickname: '风轻云淡' },
  { phone: '13800000015', nickname: '青山绿水' },
  { phone: '13800000016', nickname: '梦里水乡' },
  { phone: '13800000017', nickname: '一叶知秋' },
  { phone: '13800000018', nickname: '春暖花开' },
  { phone: '13800000019', nickname: '海阔天空' },
  { phone: '13800000020', nickname: '诗意人生' }
]

const GENDERS: ('MALE' | 'FEMALE' | 'UNKNOWN')[] = ['MALE', 'FEMALE', 'UNKNOWN']

const LOCATIONS = [
  '北京',
  '上海',
  '广东 · 广州',
  '广东 · 深圳',
  '浙江 · 杭州',
  '四川 · 成都',
  '湖北 · 武汉',
  '江苏 · 南京',
  '陕西 · 西安',
  '重庆'
]

const PRODUCT_TEMPLATES = [
  {
    name: '手工陶瓷茶具套装',
    startingPrice: 199,
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400'
  },
  {
    name: '限量版球鞋',
    startingPrice: 899,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'
  },
  {
    name: '复古机械手表',
    startingPrice: 2999,
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400'
  },
  {
    name: '高品质真丝围巾',
    startingPrice: 399,
    image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400'
  },
  {
    name: '名家书法作品',
    startingPrice: 1999,
    image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400'
  },
  {
    name: '精致银饰项链',
    startingPrice: 299,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400'
  },
  {
    name: '珍藏版邮票册',
    startingPrice: 1599,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'
  },
  {
    name: '实木家具摆件',
    startingPrice: 799,
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400'
  },
  {
    name: '进口红酒礼盒',
    startingPrice: 599,
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400'
  },
  {
    name: '原创油画作品',
    startingPrice: 3999,
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400'
  }
]

const ROOM_TITLES = [
  '精品拍卖会 - 好物等你来',
  '直播间特惠场',
  '限量版好物限时拍',
  '每日精选好物直播',
  '收藏家的聚集地'
]

function generateDouyinId(): string {
  return `dy_${Math.random().toString(36).substring(2, 15)}`
}

async function seedData() {
  console.log('🚀 开始生成模拟数据...')
  const startTime = Date.now()

  try {
    console.log('🗑️ 正在清空现有数据...')
    await prisma.bid.deleteMany({})
    await prisma.liveRoomFollow.deleteMany({})
    await prisma.product.deleteMany({})
    await prisma.liveRoom.deleteMany({})
    await prisma.user.deleteMany({})

    console.log('👤 正在批量创建用户...')
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS)

    const userData = USER_NAMES.map((user, index) => ({
      phone: user.phone,
      password: hashedPassword,
      nickname: user.nickname,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${index}`,
      bio: '热爱生活，喜欢分享好物。关注我，每天都有惊喜！',
      gender: GENDERS[Math.floor(Math.random() * GENDERS.length)],
      location: '中国 · ' + LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
      douyinId: generateDouyinId()
    }))

    await prisma.user.createMany({
      data: userData,
      skipDuplicates: true
    })
    console.log(`  ✓ 批量创建用户: ${userData.length} 个`)

    const users = await prisma.user.findMany({
      orderBy: { phone: 'asc' }
    })

    console.log('📺 正在批量创建直播间...')
    const liveRoomData = users.map((user, index) => ({
      streamerId: user.id,
      title: ROOM_TITLES[index % ROOM_TITLES.length] + ` (第${index + 1}号)`,
      description: `欢迎来到${user.nickname}的直播间！这里有各种精品好物等你来拍！`,
      coverImage: `https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&crop=entropy&cs=tinysrgb`,
      status: Math.random() > 0.3 ? 1 : 0
    }))

    await prisma.liveRoom.createMany({
      data: liveRoomData
    })
    console.log(`  ✓ 批量创建直播间: ${liveRoomData.length} 个`)

    console.log('🛍️ 正在批量创建商品...')
    const productData: {
      creatorId: string
      name: string
      image: string
      startingPrice: number
      fixedIncrement: number
      maxPrice: number
      tags: string[]
      durationMinutes: number
      extendSeconds: number
      auctionStatus: 'NOT_STARTED'
      status: 'PUBLISHED' | 'PENDING'
    }[] = []

    for (let i = 0; i < users.length; i++) {
      const user = users[i]
      for (let j = 0; j < 5; j++) {
        const templateIndex = (i * 5 + j) % PRODUCT_TEMPLATES.length
        const template = PRODUCT_TEMPLATES[templateIndex]

        const randomTags: string[] = []
        if (Math.random() > 0.5) randomTags.push('FREE_SHIPPING')
        if (Math.random() > 0.6) randomTags.push('AUCTION')
        if (Math.random() > 0.7) randomTags.push('SHIPPING_INSURANCE')

        productData.push({
          creatorId: user.id,
          name: template.name + (j > 0 ? ` #${j + 1}` : ''),
          image: template.image,
          startingPrice: template.startingPrice + Math.floor(Math.random() * 100),
          fixedIncrement: Math.floor(template.startingPrice * 0.1),
          maxPrice: template.startingPrice * 3 + Math.floor(Math.random() * 500),
          tags: randomTags,
          durationMinutes: 30 + Math.floor(Math.random() * 90),
          extendSeconds: 10 + Math.floor(Math.random() * 20),
          auctionStatus: 'NOT_STARTED',
          status: 'PENDING'
        })
      }
    }

    await prisma.product.createMany({
      data: productData
    })
    console.log(`  ✓ 批量创建商品: ${productData.length} 个`)

    const endTime = Date.now()
    const duration = (endTime - startTime) / 1000

    console.log('\n✨ 数据生成完成！')
    console.log(`  👤 用户: ${users.length} 个`)
    console.log(`  📺 直播间: ${users.length} 个`)
    console.log(`  🛍️  商品: ${productData.length} 个`)
    console.log(`  🔑 默认密码: ${DEFAULT_PASSWORD}`)
    console.log(`  ⏱️  耗时: ${duration.toFixed(2)} 秒`)
  } catch (error) {
    console.error('❌ 生成数据时出错:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedData()
  .then(() => {
    console.log('✅ 脚本执行完成！')
    process.exit(0)
  })
  .catch((e) => {
    console.error('❌ 执行失败:', e)
    process.exit(1)
  })
