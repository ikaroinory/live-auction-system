"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductTag = exports.ProductAuctionStatus = exports.ProductStatus = void 0;
var ProductStatus;
(function (ProductStatus) {
    ProductStatus["PENDING"] = "PENDING";
    ProductStatus["PUBLISHED"] = "PUBLISHED";
})(ProductStatus || (exports.ProductStatus = ProductStatus = {}));
var ProductAuctionStatus;
(function (ProductAuctionStatus) {
    ProductAuctionStatus["NOT_STARTED"] = "NOT_STARTED";
    ProductAuctionStatus["IN_PROGRESS"] = "IN_PROGRESS";
    ProductAuctionStatus["ENDED"] = "ENDED";
})(ProductAuctionStatus || (exports.ProductAuctionStatus = ProductAuctionStatus = {}));
var ProductTag;
(function (ProductTag) {
    ProductTag["LATE_COMPENSATION"] = "LATE_COMPENSATION";
    ProductTag["FREE_SHIPPING"] = "FREE_SHIPPING";
    ProductTag["SHIPPING_INSURANCE"] = "SHIPPING_INSURANCE";
    ProductTag["AUCTION"] = "AUCTION";
})(ProductTag || (exports.ProductTag = ProductTag = {}));
