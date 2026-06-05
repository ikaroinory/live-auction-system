import {
  ProductStatus,
  ProductAuctionStatus,
  ProductTag,
  Product,
  ProductFormData
} from '@live-auction/shared'

export { ProductStatus, ProductAuctionStatus, ProductTag }

export type Product = Product

export type ProductFormData = ProductFormData

export interface ProductWithAuctionRule extends Product {
  fixedIncrement: number
  durationSeconds: number
  autoExtendSeconds: number
}

export interface ProductFormDataWithAuctionRule extends ProductFormData {
  fixedIncrement: number
  maxPrice?: number
  durationSeconds: number
  autoExtendSeconds: number
}