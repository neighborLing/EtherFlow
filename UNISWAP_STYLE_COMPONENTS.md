# Uniswap 风格组件

本项目已经集成了 Uniswap 风格的网络选择器和钱包头像组件，提供了现代化的用户界面体验。

## 组件概览

### 1. UniswapStyleHeader
主要的头部组件，根据连接状态动态显示不同的组件。

**特性：**
- 渐变背景效果
- 动态显示连接状态
- 响应式设计

### 2. UniswapNetworkSelector
网络选择器组件，支持多链切换。

**特性：**
- 圆形网络图标
- 渐变背景效果
- 下拉菜单选择
- 支持的网络：Ethereum、Polygon、Arbitrum、Optimism
- 悬停动画效果

### 3. UniswapWalletAvatar
钱包头像组件，显示用户信息和状态。

**特性：**
- 圆形头像设计
- ENS 名称支持
- 状态指示器
- 地址复制功能
- 悬停提示

### 4. UniswapConnectButton
连接钱包按钮组件。

**特性：**
- 渐变按钮设计
- 钱包选择下拉菜单
- 连接状态指示
- 动画效果

## 设计特点

### 视觉风格
- **圆角设计**：使用 `rounded-2xl` 实现现代圆角效果
- **渐变色彩**：蓝色到紫色的渐变主题
- **阴影效果**：多层次的阴影增强深度感
- **动画过渡**：流畅的 hover 和点击动画

### 交互体验
- **悬停效果**：组件在悬停时会有缩放和阴影变化
- **状态反馈**：清晰的状态指示和反馈
- **响应式设计**：适配不同屏幕尺寸

### 技术实现
- **TypeScript**：完整的类型安全
- **Tailwind CSS**：现代化的样式系统
- **Wagmi Hooks**：与以太坊生态的完美集成
- **组件化设计**：可复用的模块化组件

## 使用方法

```tsx
import UniswapStyleHeader from './components/UniswapStyleHeader'

export default function App() {
  return (
    <div>
      <UniswapStyleHeader />
      {/* 其他内容 */}
    </div>
  )
}
```

## 自定义配置

### 网络配置
在 `UniswapNetworkSelector.tsx` 中可以修改支持的网络：

```tsx
const supportedChains: IChainInfo[] = [
  { 
    id: mainnet.id, 
    name: 'Ethereum', 
    icon: '🔷', 
    color: '#627EEA',
    bgColor: '#F0F4FF',
    gradient: 'from-blue-500 to-purple-600'
  },
  // 添加更多网络...
]
```

### 颜色主题
可以通过修改 CSS 变量或 Tailwind 类来自定义颜色主题：

```css
:root {
  --primary-gradient: linear-gradient(135deg, #3B82F6, #8B5CF6);
  --secondary-gradient: linear-gradient(135deg, #8B5CF6, #EC4899);
}
```

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 性能优化

- 组件懒加载
- 图片优化
- 动画性能优化
- 内存泄漏防护

## 未来改进

- [ ] 添加更多网络支持
- [ ] 实现主题切换功能
- [ ] 添加移动端优化
- [ ] 支持自定义钱包图标
- [ ] 添加网络状态指示器
