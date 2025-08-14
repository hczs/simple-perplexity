"use client";

import { MessageItem } from "@/components/chat/MessageItem";
import { Message } from "@/types/chat";
import { useState } from "react";

const sampleMessages: Message[] = [
  {
    id: "1",
    type: "user",
    content: "请给我展示一些代码示例和 Markdown 格式",
    timestamp: Date.now(),
    status: "complete",
  },
  {
    id: "2",
    type: "assistant",
    content: `# AI 助手回复示例

这是一个展示 **Markdown 渲染能力** 的示例回复。

## 代码示例

这里是一个 React 组件的例子：

\`\`\`tsx
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={\`btn btn-\${variant}\`}
    >
      {children}
    </button>
  );
}
\`\`\`

## 列表和引用

### 功能特性：
- ✅ 语法高亮
- ✅ 主题适配
- ✅ 智能打字机效果
- ✅ 响应式设计

> 这是一个引用块的示例。设计不是让东西看起来漂亮，而是让东西工作得更好。

## 表格示例

| 特性 | 状态 | 优先级 |
|------|------|--------|
| Markdown 渲染 | ✅ 完成 | 高 |
| 代码高亮 | ✅ 完成 | 高 |
| 主题切换 | ✅ 完成 | 中 |

## 行内代码

你可以使用 \`useState\` 钩子来管理组件状态，或者使用 \`useEffect\` 来处理副作用。

---

这就是重新定义的消息体验。每个细节都经过深思熟虑。`,
    timestamp: Date.now(),
    status: "complete",
  },
];
export default function MarkdownTestPage() {
  const [isStreaming, setIsStreaming] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Markdown 渲染测试</h1>
          <p className="text-muted-foreground">
            测试新的消息渲染系统，支持完整的 Markdown 语法和代码高亮
          </p>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
            >
              {isStreaming ? "停止流式" : "模拟流式"}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {sampleMessages.map((message) => (
            <MessageItem
              key={message.id}
              message={{
                ...message,
                status:
                  isStreaming && message.type === "assistant"
                    ? "streaming"
                    : "complete",
              }}
              isStreaming={isStreaming && message.type === "assistant"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
