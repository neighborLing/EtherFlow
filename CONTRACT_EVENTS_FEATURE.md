# 合约事件查询功能

## 功能概述

在合约调用功能页签下新增了"事件查询"标签页，用户可以通过输入合约地址来查询合约的历史事件记录。

## 主要特性

### 1. 事件类型支持
- **CountIncremented 事件**: 记录计数器增加的历史
- **MessageUpdated 事件**: 记录消息更新的历史

### 2. 查询功能
- 手动刷新按钮获取最新日志记录
- 支持查询最近20条事件记录
- 合约地址输入框用于记录（可选）

### 3. 数据展示
- 事件按时间倒序排列（最新的在前）
- 显示事件详细信息：
  - 新计数值（CountIncremented）
  - 新消息内容（MessageUpdated）
  - 更新者地址（MessageUpdated）
  - 区块号
  - 区块时间戳
  - 交易哈希

### 4. 用户体验
- 实时加载状态指示
- 错误处理和提示
- 空状态展示
- 地址和哈希的截断显示
- 响应式设计

## 技术实现

### GraphQL Schema
```graphql
type CountIncremented @entity(immutable: true) {
  id: Bytes!
  newCount: BigInt!
  blockNumber: BigInt!
  blockTimestamp: BigInt!
  transactionHash: Bytes!
}

type MessageUpdated @entity(immutable: true) {
  id: Bytes!
  newMessage: String!
  updatedBy: Bytes!
  blockNumber: BigInt!
  blockTimestamp: BigInt!
  transactionHash: Bytes!
}
```

### API端点
- **The Graph Studio**: `https://api.studio.thegraph.com/query/119874/tx/v0.0.2`

### 组件结构
```
ContractInterface.tsx
├── Tab切换（转账功能 | 合约调用 | 事件查询）
└── ContractEvents.tsx
    ├── 合约地址输入
    ├── 刷新按钮
    ├── 事件列表展示
    └── 错误处理
```

## 使用方法

1. 连接钱包后，点击"📊 事件查询"标签页
2. 点击"刷新"按钮获取最新的事件记录
3. 可选：在合约地址输入框中输入地址用于记录
4. 查看事件详情，包括时间、数据、交易哈希等信息

## 注意事项

- 合约地址输入框是可选的，用于记录目的
- 查询结果按时间倒序排列，最多显示20条记录
- 如果没有事件记录，会显示空状态提示
- 点击刷新按钮可以获取最新的索引事件

## 依赖项

- `lodash`: 用于防抖处理
- `fetch`: 用于GraphQL API调用
- React Hooks: 状态管理
- TypeScript: 类型安全

## 样式

使用了与现有组件一致的Uniswap风格设计：
- 玻璃态效果
- 渐变背景
- 响应式布局
- 现代化的UI组件
