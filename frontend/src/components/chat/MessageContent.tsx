"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

interface MessageContentProps {
  content: string;
  isUser: boolean;
  isStreaming?: boolean;
  status?: "sending" | "streaming" | "complete" | "error";
}

export function MessageContent({
  content,
  isUser,
  isStreaming = false,
  status = "complete",
}: MessageContentProps) {
  const { theme } = useTheme();
  const [displayedContent, setDisplayedContent] = useState("");
  const [showCursor, setShowCursor] = useState(false);

  // 智能打字机效果 - 只对AI消息生效
  useEffect(() => {
    if (!isUser && status === "streaming" && content) {
      setShowCursor(true);
      const currentIndex = displayedContent.length;

      if (currentIndex < content.length) {
        // 动态调整打字速度 - 代码块慢一点，普通文本快一点
        const char = content[currentIndex];
        const isInCodeBlock =
          content.slice(0, currentIndex).split("```").length % 2 === 0;
        const speed = isInCodeBlock ? 15 : char === " " ? 5 : 25;

        const timer = setTimeout(() => {
          setDisplayedContent(content.slice(0, currentIndex + 1));
        }, speed);

        return () => clearTimeout(timer);
      }
    } else if (!isUser && status === "complete") {
      setDisplayedContent(content);
      setShowCursor(false);
    } else if (isUser) {
      setDisplayedContent(content);
      setShowCursor(false);
    }
  }, [content, status, isUser, displayedContent.length]);

  // 重置显示内容当消息ID变化时
  useEffect(() => {
    if (isUser || status !== "streaming") {
      setDisplayedContent(content);
    }
  }, [content, isUser, status]);

  // 用户消息 - 简洁直接
  if (isUser) {
    return (
      <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
        {content}
      </div>
    );
  }

  // AI消息 - 富文本渲染
  const contentToRender = isStreaming ? displayedContent : content;

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          // 代码块 - 专业级语法高亮
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "";

            if (!inline && language) {
              return (
                <div className="relative group">
                  {/* 语言标签 */}
                  <div className="absolute top-0 right-0 px-2 py-1 text-xs font-mono text-muted-foreground bg-muted/50 rounded-bl-md rounded-tr-md">
                    {language}
                  </div>
                  <SyntaxHighlighter
                    style={theme === "dark" ? oneDark : oneLight}
                    language={language}
                    PreTag="div"
                    className="!mt-0 !mb-4 !bg-transparent"
                    customStyle={{
                      margin: 0,
                      padding: "1rem",
                      background: "hsl(var(--muted))",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                      lineHeight: "1.5",
                    }}
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                </div>
              );
            }

            // 行内代码
            return (
              <code
                className={cn(
                  "relative rounded px-1.5 py-0.5 font-mono text-sm",
                  "bg-muted text-muted-foreground",
                  "before:content-none after:content-none"
                )}
                {...props}
              >
                {children}
              </code>
            );
          },

          // 段落 - 优化间距
          p({ children }) {
            return <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>;
          },

          // 列表 - 清晰的层级
          ul({ children }) {
            return <ul className="mb-4 space-y-1 pl-4">{children}</ul>;
          },

          ol({ children }) {
            return <ol className="mb-4 space-y-1 pl-4">{children}</ol>;
          },

          li({ children }) {
            return <li className="leading-relaxed">{children}</li>;
          },

          // 标题 - 适度的层级感
          h1({ children }) {
            return (
              <h1 className="text-lg font-semibold mb-3 mt-6 first:mt-0 text-foreground">
                {children}
              </h1>
            );
          },

          h2({ children }) {
            return (
              <h2 className="text-base font-semibold mb-2 mt-5 first:mt-0 text-foreground">
                {children}
              </h2>
            );
          },

          h3({ children }) {
            return (
              <h3 className="text-sm font-semibold mb-2 mt-4 first:mt-0 text-foreground">
                {children}
              </h3>
            );
          },

          // 引用块 - 优雅的视觉区分
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-primary/30 pl-4 py-2 my-4 bg-muted/30 rounded-r-md">
                <div className="text-muted-foreground italic">{children}</div>
              </blockquote>
            );
          },

          // 表格 - 清晰的数据展示
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border-collapse border border-border rounded-md">
                  {children}
                </table>
              </div>
            );
          },

          th({ children }) {
            return (
              <th className="border border-border bg-muted/50 px-3 py-2 text-left font-semibold text-sm">
                {children}
              </th>
            );
          },

          td({ children }) {
            return (
              <td className="border border-border px-3 py-2 text-sm">
                {children}
              </td>
            );
          },

          // 链接 - 清晰的交互提示
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
              >
                {children}
              </a>
            );
          },

          // 分割线
          hr() {
            return <hr className="my-6 border-border" />;
          },

          // 强调文本
          strong({ children }) {
            return (
              <strong className="font-semibold text-foreground">
                {children}
              </strong>
            );
          },

          em({ children }) {
            return <em className="italic text-muted-foreground">{children}</em>;
          },
        }}
      >
        {contentToRender}
      </ReactMarkdown>

      {/* 打字机光标 */}
      {showCursor && (
        <span className="inline-block w-0.5 h-4 ml-1 bg-primary animate-pulse" />
      )}
    </div>
  );
}
