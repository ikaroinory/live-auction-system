
# WebSocket 商品状态更新方案

## 问题描述
当后台启动商品开始竞拍时（调用 `/products/{id}/start-auction 接口），前端 H5 页面的商品列表不会自动刷新，用户需要通过 WebSocket 通知直播间更新商品列表。

## 分析

### 当前架构
- **后端**：WebSocket 服务在 `backend/src/lib/websocket.ts`
- **前端 H5**：WebSocket 服务在 `frontend/h5/src/services/websocket.ts`
- **共享类型**：`shared/src/websocket.ts`
- **商品 API**：`backend/src/api/v1/products.ts`

### 当前状态
- 已有 `EXPLAINING_UPDATE` 事件用于更新讲解状态
- 缺少商品状态变更（开始/结束竞拍）的 WebSocket 通知

## 解决方案

### 步骤 1：更新共享类型定义
在 `shared/src/websocket.ts` 中：
1. 添加新的 WebSocket 消息类型 `PRODUCT_STATUS_UPDATE`
2. 定义相关的 Payload 类型

### 步骤 2：后端更新后端 WebSocket 服务
在 `backend/src/lib/websocket.ts` 中：
1. 添加 `broadcastProductStatusUpdate` 函数
2. 该函数向房间广播商品状态更新

### 步骤 3：更新商品 API
在 `backend/src/api/v1/products.ts` 中：
1. 在 `start-auction` 接口中调用新的 WebSocket 广播
2. 在 `end-auction` 接口中调用新的 WebSocket 广播
3. 需要获取与商品关联的直播间 ID

### 步骤 4：更新前端 WebSocket 服务
在 `frontend/h5/src/services/websocket.ts` 中：
1. 添加对 `PRODUCT_STATUS_UPDATE` 事件监听
2. 添加回调函数设置接口

### 步骤 5：更新前端 LiveRoom 组件
在 `frontend/h5/src/pages/LiveRoom/index.tsx` 中：
1. 设置 `websocketService 的新回调
2. 收到更新时重新获取商品列表

## 涉及文件
1. `shared/src/websocket.ts`
2. `backend/src/lib/websocket.ts`
3. `backend/src/api/v1/products.ts`
4. `frontend/h5/src/services/websocket.ts`
5. `frontend/h5/src/pages/LiveRoom/index.tsx`

