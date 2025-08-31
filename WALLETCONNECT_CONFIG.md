# WalletConnect 配置说明

## 问题描述

在终端中看到以下错误：
```
[Reown Config] Failed to fetch remote project configuration. Using local/default values. Error: HTTP status code: 403
```

这是因为 WalletConnect 项目配置未正确设置导致的。

## 解决方案

### 方案1：暂时禁用 WalletConnect（当前状态）

✅ **已实施**：在 `src/app/providers/Web3Provider.tsx` 中注释掉了 WalletConnect 连接器

**优点**：
- 立即解决 403 错误
- 不影响 MetaMask 等注入式钱包的使用
- 应用可以正常运行

**缺点**：
- 无法使用 WalletConnect 支持的移动钱包

### 方案2：配置真实的 WalletConnect Project ID

#### 步骤1：获取 Project ID
1. 访问 [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. 注册/登录账户
3. 创建新项目
4. 复制项目ID

#### 步骤2：设置环境变量
创建 `.env.local` 文件：
```bash
# WalletConnect Configuration
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=你的真实项目ID

# 其他环境变量
NEXT_PUBLIC_APP_NAME=DeFi 交互平台
NEXT_PUBLIC_APP_DESCRIPTION=现代化的区块链交互界面
```

#### 步骤3：启用 WalletConnect
在 `src/app/providers/Web3Provider.tsx` 中取消注释：
```typescript
connectors: [
  injected(),
  walletConnect({ 
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-walletconnect-project-id'
  }),
],
```

### 方案3：使用测试 Project ID（仅用于开发）

如果只是开发测试，可以使用：
```typescript
walletConnect({ 
  projectId: 'c4f79cc821944d9680842e34466bfbd9' // 测试用ID
}),
```

## 当前状态

✅ **已解决**：403 错误已通过禁用 WalletConnect 解决
✅ **功能正常**：MetaMask 等注入式钱包连接正常
✅ **Hex 输入框**：新添加的功能完全正常

## 建议

1. **开发阶段**：保持当前状态，专注于功能开发
2. **生产部署**：配置真实的 WalletConnect Project ID
3. **用户体验**：考虑同时支持多种钱包连接方式

## 相关文件

- `src/app/providers/Web3Provider.tsx` - Web3 配置
- `.env.local` - 环境变量（需要创建）
- `src/app/components/ContractInterface.tsx` - 主要功能组件

