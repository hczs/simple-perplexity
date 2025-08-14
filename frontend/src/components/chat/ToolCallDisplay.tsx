import { Card, CardContent } from "@/components/ui/card";
import { ToolCall } from "@/types/chat";

interface ToolCallDisplayProps {
  toolCall: ToolCall;
}

// 工具调用状态映射
const toolDisplayMap = {
  current_time: {
    calling: () => "正在获取当前时间",
    complete: (result: string) => `获取到当前时间为 ${result}`,
    icon: "🕐",
  },
  tavily_search: {
    calling: (param?: string) => `正在搜索 ${param || ""}`,
    complete: (result: string) => {
      const resultCount = result
        .split("\n")
        .filter((line) => line.trim()).length;
      return `搜索到 ${resultCount} 个结果，正在生成回答`;
    },
    icon: "🔍",
  },
} as const;

export function ToolCallDisplay({ toolCall }: ToolCallDisplayProps) {
  const toolConfig = toolDisplayMap[toolCall.name];
  const isComplete = toolCall.status === "complete";

  // 获取显示文本
  const getDisplayText = () => {
    if (isComplete && toolCall.result) {
      return toolConfig.complete(toolCall.result);
    }

    // 调用中状态
    if (toolCall.name === "tavily_search") {
      return toolConfig.calling(toolCall.param);
    }

    return toolConfig.calling();
  };

  return (
    <div className="flex justify-start w-full mb-3">
      <div className="max-w-[80%] mr-auto">
        <Card className="bg-accent/50 border-accent">
          <CardContent className="p-3">
            <div className="flex items-center space-x-3">
              {/* Tool icon */}
              <div className="flex-shrink-0">
                <span className="text-lg">{toolConfig.icon}</span>
              </div>

              {/* Tool status content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-accent-foreground">
                    {getDisplayText()}
                  </p>

                  {/* Loading indicator for calling status */}
                  {!isComplete && (
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-accent-foreground/60 rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-accent-foreground/60 rounded-full animate-bounce delay-100" />
                      <div className="w-1 h-1 bg-accent-foreground/60 rounded-full animate-bounce delay-200" />
                    </div>
                  )}
                </div>

                {/* Show parameter if available and calling */}
                {!isComplete &&
                  toolCall.param &&
                  toolCall.name === "tavily_search" && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      搜索关键词: {toolCall.param}
                    </p>
                  )}

                {/* Show result preview if complete */}
                {isComplete && toolCall.result && (
                  <div className="mt-2 p-2 bg-background/50 rounded border">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {toolCall.name === "current_time"
                        ? `时间: ${toolCall.result}`
                        : `搜索结果: ${toolCall.result.substring(0, 100)}${
                            toolCall.result.length > 100 ? "..." : ""
                          }`}
                    </p>
                  </div>
                )}
              </div>

              {/* Status indicator */}
              <div className="flex-shrink-0">
                {isComplete ? (
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                ) : (
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                )}
              </div>
            </div>

            {/* Timestamp */}
            <div className="mt-2 pt-2 border-t border-accent/20">
              <span className="text-xs text-muted-foreground">
                {new Date(toolCall.timestamp).toLocaleTimeString("zh-CN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
