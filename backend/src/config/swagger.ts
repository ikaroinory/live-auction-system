import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '直播竞拍系统 API',
      version: '1.0.0',
      description: '实时竞拍大师 - 抖音电商直播竞拍全栈系统 API 文档',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3001}`,
        description: '开发服务器',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/api/**/*.ts', './src/api/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
