# 文本选择对比度问题修复

## 问题描述

在 Chat 界面中，用户消息的文本选择存在对比度问题：

- **亮色模式**：用户消息是深色背景，选择文字时高亮色与背景冲突，看不清选中内容
- **暗色模式**：用户消息是浅色背景，选择文字时高亮色与背景冲突，看不清选中内容

## 根本原因

用户消息使用 `bg-primary text-primary-foreground` 样式：

- 亮色模式：`primary` 是深色，`primary-foreground` 是浅色
- 暗色模式：`primary` 是浅色，`primary-foreground` 是深色

但全局的 `::selection` 样式是固定的，没有考虑到不同背景色的需求。

## 解决方案

### 1. 添加用户消息标识类

```tsx
className={cn(
  "px-4 py-3 rounded-2xl transition-all duration-200",
  isUser
    ? "bg-primary text-primary-foreground rounded-br-md user-message-bubble"
    : "enhanced-card text-card-foreground rounded-bl-md"
)}
```

### 2. 智能文本选择样式

```css
/* 用户消息气泡内的文本选择优化 */
.user-message-bubble ::selection {
  /* 亮色模式：深色背景上用浅色高亮 */
  background-color: hsl(var(--primary-foreground) / 0.25);
  color: hsl(var(--primary));
}

/* 暗色模式下的用户消息文本选择 */
html.dark .user-message-bubble ::selection,
.dark .user-message-bubble ::selection,
[data-theme="dark"] .user-message-bubble ::selection {
  /* 暗色模式：浅色背景上用深色高亮 */
  background-color: hsl(var(--primary) / 0.25);
  color: hsl(var(--primary-foreground));
}
```

## 技术细节

### 颜色逻辑

- **亮色模式**：
  - 消息背景：深色 (`primary`)
  - 消息文字：浅色 (`primary-foreground`)
  - 选择高亮：浅色背景 + 深色文字
- **暗色模式**：
  - 消息背景：浅色 (`primary`)
  - 消息文字：深色 (`primary-foreground`)
  - 选择高亮：深色背景 + 浅色文字

### 透明度设置

使用 `0.25` 透明度确保：

- 高亮效果明显但不过度
- 保持文字的可读性
- 与背景色形成足够对比度

## 测试验证

创建了专门的测试页面 `/selection-test`：

- 测试普通文本选择
- 测试用户消息选择
- 测试 AI 消息选择
- 对比不同主题下的效果

## 设计原则

1. **可访问性优先**：确保在任何主题下文本选择都清晰可见
2. **语义化设计**：使用主题变量而非硬编码颜色
3. **一致性体验**：不同组件的选择效果保持协调
4. **智能适配**：根据背景色自动调整选择高亮色

这就是专业级前端开发应该考虑的细节 - 不仅要功能正确，更要确保用户体验的每一个细节都完美。
