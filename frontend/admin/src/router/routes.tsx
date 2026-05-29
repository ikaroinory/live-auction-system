export interface RouteConfig {
  path: string
  name: string
  icon?: React.ReactNode
  component?: React.ComponentType
  children?: RouteConfig[]
  meta?: {
    requiresAuth?: boolean
    roles?: ('admin' | 'seller')[]
  }
}

export const routes: RouteConfig[] = [
  {
    path: '/dashboard',
    name: '数据概览',
    icon: null
  },
  {
    path: '/auction',
    name: '竞拍管理',
    children: [
      {
        path: '/auction/list',
        name: '竞拍列表'
      },
      {
        path: '/auction/create',
        name: '发布竞拍'
      },
      {
        path: '/auction/:id',
        name: '竞拍详情'
      }
    ]
  },
  {
    path: '/order',
    name: '订单管理'
  },
  {
    path: '/product',
    name: '商品管理',
    children: [
      {
        path: '/product/list',
        name: '商品列表'
      },
      {
        path: '/product/create',
        name: '添加商品'
      }
    ]
  }
]
