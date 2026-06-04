import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '直播竞拍系统 API',
      version: '1.0.0',
      description: '实时竞拍大师 - 抖音电商直播竞拍全栈系统 API 文档'
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3001}`,
        description: '开发服务器'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '用户ID' },
            phone: { type: 'string', description: '手机号' },
            nickname: { type: 'string', nullable: true, description: '昵称' },
            avatar: { type: 'string', nullable: true, description: '头像URL' },
            bio: { type: 'string', nullable: true, description: '个人简介' },
            gender: { type: 'number', nullable: true, description: '性别（0: 未知, 1: 男, 2: 女）' },
            birthday: { type: 'string', format: 'date', nullable: true, description: '生日' },
            location: { type: 'string', description: '所在地' },
            douyinId: { type: 'string', nullable: true, description: '抖音号' },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' }
          }
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '商品ID' },
            name: { type: 'string', description: '商品名称' },
            description: { type: 'string', nullable: true, description: '商品描述' },
            image: { type: 'string', description: '商品图片URL' },
            startingPrice: { type: 'number', description: '起拍价' },
            fixedIncrement: { type: 'number', description: '固定加价' },
            maxPrice: { type: 'number', nullable: true, description: '最高价' },
            durationMinutes: { type: 'number', description: '拍卖时长（分钟）' },
            extendSeconds: { type: 'number', description: '延时秒数' },
            tags: { type: 'array', items: { type: 'string' }, description: '标签' },
            status: { type: 'string', description: '状态' },
            creatorId: { type: 'string', description: '创建者ID' },
            creator: { $ref: '#/components/schemas/User', description: '创建者信息' },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' }
          }
        },
        Auction: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '拍卖ID' },
            productId: { type: 'string', description: '商品ID' },
            reservePrice: { type: 'number', description: '保留价' },
            currentPrice: { type: 'number', description: '当前价格' },
            status: { type: 'string', description: '状态（PENDING/LIVE/ENDED）' },
            startTime: { type: 'string', format: 'date-time', description: '开始时间' },
            endTime: { type: 'string', format: 'date-time', description: '结束时间' },
            fixedIncrement: { type: 'number', description: '固定加价' },
            currentWinnerId: { type: 'string', nullable: true, description: '当前赢家ID' },
            product: { $ref: '#/components/schemas/Product', description: '商品信息' },
            currentWinner: { $ref: '#/components/schemas/User', description: '当前赢家信息' },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' }
          }
        },
        Bid: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '出价ID' },
            auctionId: { type: 'string', description: '拍卖ID' },
            userId: { type: 'string', description: '用户ID' },
            amount: { type: 'number', description: '出价金额' },
            user: { $ref: '#/components/schemas/User', description: '出价用户信息' },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' }
          }
        },
        LiveRoom: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '直播间ID' },
            title: { type: 'string', description: '直播间标题' },
            description: { type: 'string', nullable: true, description: '直播间描述' },
            coverImage: { type: 'string', nullable: true, description: '封面图片URL' },
            status: { type: 'string', description: '状态（PENDING/LIVE/ENDED）' },
            hostId: { type: 'string', description: '主播ID' },
            startedAt: { type: 'string', format: 'date-time', nullable: true, description: '开始时间' },
            endedAt: { type: 'string', format: 'date-time', nullable: true, description: '结束时间' },
            host: { $ref: '#/components/schemas/User', description: '主播信息' },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' }
          }
        },
        PagedResponse: {
          type: 'object',
          properties: {
            list: { type: 'array', items: {}, description: '数据列表' },
            total: { type: 'number', description: '总数' },
            page: { type: 'number', description: '当前页码' },
            pageSize: { type: 'number', description: '每页数量' }
          }
        }
      }
    }
  },
  apis: ['./src/api/**/*.ts', './src/api/*.ts']
}

export const swaggerSpec = swaggerJsdoc(options)
