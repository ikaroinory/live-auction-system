import { PrismaClient, Gender, ProductAuctionStatus, ProductStatus, ProductTag } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = '123456';

// 随机用户名和昵称数据
const USER_NAMES = [
  { phone: '13800138001', nickname: '星辰大海' },
  { phone: '13800138002', nickname: '夏日微风' },
  { phone: '13800138003', nickname: '阳光少年' },
  { phone: '13800138004', nickname: '星空旅人' },
  { phone: '13800138005', nickname: '清晨阳光' },
  { phone: '13800138006', nickname: '梦想家' },
  { phone: '13800138007', nickname: '追风者' },
  { phone: '13800138008', nickname: '小确幸' },
  { phone: '13800138009', nickname: '时光机' },
  { phone: '13800138010', nickname: '薄荷糖' },
  { phone: '13800138011', nickname: '云卷云舒' },
  { phone: '13800138012', nickname: '岁月如歌' },
  { phone: '13800138013', nickname: '花开盛夏' },
  { phone: '13800138014', nickname: '风轻云淡' },
  { phone: '13800138015', nickname: '青山绿水' },
  { phone: '13800138016', nickname: '梦里水乡' },
  { phone: '13800138017', nickname: '一叶知秋' },
  { phone: '13800138018', nickname: '春暖花开' },
  { phone: '13800138019', nickname: '海阔天空' },
  { phone: '13800138020', nickname: '诗意人生' },
];

const GENDERS = [Gender.MALE, Gender.FEMALE, Gender.UNKNOWN];

const LOCATIONS = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '西安', '重庆'];

// 商品数据
const PRODUCT_TEMPLATES = [
  { name: '手工陶瓷茶具套装', startingPrice: 199, image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400' },
  { name: '限量版球鞋', startingPrice: 899, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
  { name: '复古机械手表', startingPrice: 2999, image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400' },
  { name: '高品质真丝围巾', startingPrice: 399, image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400' },
  { name: '名家书法作品', startingPrice: 1999, image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400' },
  { name: '精致银饰项链', startingPrice: 299, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400' },
  { name: '珍藏版邮票册', startingPrice: 1599, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
  { name: '实木家具摆件', startingPrice: 799, image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400' },
  { name: '进口红酒礼盒', startingPrice: 599, image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400' },
  { name: '原创油画作品', startingPrice: 3999, image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400' },
];

// 直播间标题模板
const ROOM_TITLES = [
  '精品拍卖会 - 好物等你来',
  '直播间特惠场',
  '限量版好物限时拍',
  '每日精选好物直播',
  '收藏家的聚集地',
];

// 生成随机价格
function randomPrice(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 生成随机抖音ID
function generateDouyinId(): string {
  return `dy_${Math.random().toString(36).substring(2, 15)}`;
}

// 主函数
async function seedData() {
  console.log('开始生成模拟数据...');

  try {
    // 清空现有数据（可选）
    console.log('正在清空现有数据...');
    await prisma.bid.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.auction.deleteMany({});
    await prisma.liveRoomFollow.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.liveRoom.deleteMany({});
    await prisma.user.deleteMany({});

    console.log('正在创建用户...');
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
    const users = [];

    for (let i = 0; i < 20; i++) {
      const userData = USER_NAMES[i];
      const user = await prisma.user.create({
        data: {
          phone: userData.phone,
          password: hashedPassword,
          nickname: userData.nickname,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
          bio: `热爱生活，喜欢分享好物。关注我，每天都有惊喜！`,
          gender: GENDERS[Math.floor(Math.random() * GENDERS.length)],
          location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
          douyinId: generateDouyinId(),
        },
      });
      users.push(user);
      console.log(`✓ 创建用户: ${user.nickname} (${user.phone})`);
    }

    console.log('正在创建直播间和商品...');
    const products = [];

    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      // 创建直播间
      const roomTitle = ROOM_TITLES[i % ROOM_TITLES.length] + ` (第${i + 1}号)`;
      const liveRoom = await prisma.liveRoom.create({
        data: {
          streamerId: user.id,
          title: roomTitle,
          description: `欢迎来到${user.nickname}的直播间！这里有各种精品好物等你来拍！`,
          coverImage: `https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&crop=entropy&cs=tinysrgb`,
          status: Math.random() > 0.3 ? 1 : 0, // 70%概率正在直播
        },
      });

      console.log(`  ✓ 创建直播间: ${liveRoom.title}`);

      // 为每个直播间创建5个商品
      for (let j = 0; j < 5; j++) {
        const templateIndex = (i * 5 + j) % PRODUCT_TEMPLATES.length;
        const template = PRODUCT_TEMPLATES[templateIndex];

        const product = await prisma.product.create({
          data: {
            creatorId: user.id,
            name: template.name + (j > 0 ? ` #${j + 1}` : ''),
            image: template.image,
            startingPrice: template.startingPrice + Math.floor(Math.random() * 100),
            fixedIncrement: Math.floor(template.startingPrice * 0.1),
            maxPrice: template.startingPrice * 3 + Math.floor(Math.random() * 500),
            tags: [
              Math.random() > 0.5 ? ProductTag.FREE_SHIPPING : null,
              Math.random() > 0.6 ? ProductTag.AUCTION : null,
              Math.random() > 0.7 ? ProductTag.SHIPPING_INSURANCE : null,
            ].filter(Boolean) as ProductTag[],
            durationMinutes: 30 + Math.floor(Math.random() * 90),
            extendSeconds: 10 + Math.floor(Math.random() * 20),
            auctionStatus: ProductAuctionStatus.NOT_STARTED,
            status: ProductStatus.PUBLISHED,
          },
        });

        products.push(product);
        console.log(`    ✓ 创建商品: ${product.name}`);
      }
    }

    console.log('\n数据生成完成！');
    console.log(`用户: ${users.length} 个`);
    console.log(`直播间: ${users.length} 个`);
    console.log(`商品: ${products.length} 个`);
    console.log(`默认密码: ${DEFAULT_PASSWORD}`);
  } catch (error) {
    console.error('生成数据时出错:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedData()
  .then(() => {
    console.log('脚本执行完成！');
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
