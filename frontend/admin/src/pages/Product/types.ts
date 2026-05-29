export enum ProductTagType {
  LateCompensation,
  FreeShipping,
  ShippingInsurance,
  Auction
}

export type ProductItem = {
  id: string
  name: string
  image?: string
  tags?: ProductTagType[]
  startingPrice?: number
  fixedIncrement?: number
  capPrice?: number
  currentPrice?: number
  bidCount?: number
  status?: number
  lateCompensation?: boolean
  freeShipping?: boolean
  shippingInsurance?: boolean
  auction?: boolean
}
