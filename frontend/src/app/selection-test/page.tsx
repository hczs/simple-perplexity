import { FloatingThemeToggle } from "@/components/chat/FloatingThemeToggle";

export default function SelectionTestPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold">文本选择测试页面</h1>

        <div className="space-y-6">
          {/* 普通文本选择 */}
          <div className="enhanced-card p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">普通文本选择</h2>
            <p className="text-muted-foreground">
              这是普通的文本内容，选择这段文字应该使用默认的选择高亮色。
              测试一下选择效果是否在亮色和暗色模式下都清晰可见。
            </p>
          </div>

          {/* 模拟用户消息 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">用户消息选择测试</h2>

            <div className="flex justify-end">
              <div className="bg-primary text-primary-foreground px-4 py-3 rounded-2xl rounded-br-md max-w-[80%] user-message-bubble">
                <div className="text-sm leading-relaxed">
                  这是用户发送的消息内容。请选择这段文字来测试在不同主题下的选择高亮效果。
                  在亮色模式下，这里是深色背景配浅色文字；在暗色模式下，这里是浅色背景配深色文字。
                  选择文字时应该有足够的对比度来清晰显示选中的内容。
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <div className="bg-primary text-primary-foreground px-4 py-3 rounded-2xl rounded-br-md max-w-[80%] user-message-bubble">
                <div className="text-sm leading-relaxed">
                  这是另一条用户消息，用来测试多条消息的选择效果是否一致。
                  专业的设计应该确保用户在任何情况下都能清晰地看到选中的文本。
                </div>
              </div>
            </div>
          </div>

          {/* 模拟AI消息 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">AI消息选择测试</h2>

            <div className="flex justify-start">
              <div className="enhanced-card text-card-foreground px-4 py-3 rounded-2xl rounded-bl-md max-w-full">
                <div className="text-sm leading-relaxed">
                  这是AI助手的回复消息。选择这段文字来测试AI消息的文本选择效果。
                  AI消息使用卡片样式，应该与用户消息有不同的选择高亮效果。
                  这样可以确保在不同的背景色下都有最佳的可读性。
                </div>
              </div>
            </div>
          </div>

          {/* 对比测试 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="enhanced-card p-4 rounded-lg">
              <h3 className="font-semibold mb-3">亮色模式测试</h3>
              <p className="text-sm text-muted-foreground mb-3">
                在亮色模式下选择文字，应该看到适当的高亮效果。
              </p>
              <div className="bg-primary text-primary-foreground px-3 py-2 rounded-lg user-message-bubble">
                <span className="text-sm">用户消息：选择这段文字测试效果</span>
              </div>
            </div>

            <div className="enhanced-card p-4 rounded-lg">
              <h3 className="font-semibold mb-3">暗色模式测试</h3>
              <p className="text-sm text-muted-foreground mb-3">
                在暗色模式下选择文字，应该看到相应调整的高亮效果。
              </p>
              <div className="bg-primary text-primary-foreground px-3 py-2 rounded-lg user-message-bubble">
                <span className="text-sm">用户消息：选择这段文字测试效果</span>
              </div>
            </div>
          </div>

          {/* 使用说明 */}
          <div className="enhanced-card p-6 rounded-lg border-l-4 border-l-primary">
            <h3 className="text-lg font-semibold mb-3">测试说明</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• 使用鼠标选择不同区域的文字</li>
              <li>• 切换亮色/暗色主题观察选择效果</li>
              <li>• 确保在任何背景下选中文字都清晰可见</li>
              <li>• 用户消息和AI消息应该有不同的选择高亮效果</li>
            </ul>
          </div>
        </div>
      </div>

      <FloatingThemeToggle />
    </div>
  );
}
