export interface User {
  id: string
  phone: string
  nickname?: string
  avatar?: string
  createdAt: string
  douyinId?: string
  likes?: number
  mutual?: number
  following?: number
  followers?: number
}

export interface LoginParams {
  phone: string
  code: string
}
