import { FloatingThemeToggle } from "@/components/chat/FloatingThemeToggle";

export default function ThemeTestPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold">主题测试页面</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 基础卡片测试 */}
          <div className="enhanced-card p-6 rounded-lg transition-all duration-300 hover:shadow-lg">
            <h2 className="text-xl font-semibold mb-4">基础卡片</h2>
            <p className="text-muted-foreground mb-4">
              这是重新设计的卡片组件，具有更好的层次感和视觉深度。
            </p>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-muted-foreground">状态指示器</span>
            </div>
          </div>

          {/* 按钮测试 */}
          <div className="enhanced-card p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">交互元素</h2>
            <div className="space-y-3">
              <button className="w-full bg-primary text-primary-foreground px-4 py-2.5 rounded-md font-medium transition-all duration-200 hover:opacity-90 focus:ring-2 focus:ring-ring focus:ring-offset-2">
                主要操作
              </button>
              <button className="w-full bg-secondary text-secondary-foreground px-4 py-2.5 rounded-md font-medium transition-all duration-200 hover:bg-secondary/80">
                次要操作
              </button>
              <button className="w-full border border-border text-foreground px-4 py-2.5 rounded-md font-medium transition-all duration-200 hover:bg-accent">
                边框按钮
              </button>
            </div>
          </div>

          {/* 输入框测试 */}
          <div className="enhanced-card p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">表单元素</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">输入框</label>
                <input
                  type="text"
                  placeholder="输入内容..."
                  className="w-full bg-input border border-border rounded-md px-3 py-2.5 transition-all duration-200 focus:ring-2 focus:ring-ring focus:border-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">选择框</label>
                <select className="w-full bg-input border border-border rounded-md px-3 py-2.5 transition-all duration-200 focus:ring-2 focus:ring-ring focus:border-ring">
                  <option>选项一</option>
                  <option>选项二</option>
                </select>
              </div>
            </div>
          </div>

          {/* 颜色系统测试 */}
          <div className="enhanced-card p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">色彩系统</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-foreground rounded"></div>
                <span className="text-sm">主要文本</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-muted-foreground rounded"></div>
                <span className="text-sm text-muted-foreground">次要文本</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-destructive rounded"></div>
                <span className="text-sm text-destructive">错误状态</span>
              </div>
            </div>
          </div>

          {/* 层级测试 */}
          <div className="enhanced-card p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">视觉层级</h2>
            <div className="space-y-3">
              <div
                className="p-3 rounded"
                style={{ backgroundColor: "hsl(var(--surface-1))" }}
              >
                <div className="text-sm font-medium">Surface 1</div>
                <div
                  className="p-2 mt-2 rounded"
                  style={{ backgroundColor: "hsl(var(--surface-2))" }}
                >
                  <div className="text-xs">Surface 2</div>
                  <div
                    className="p-2 mt-1 rounded"
                    style={{ backgroundColor: "hsl(var(--surface-3))" }}
                  >
                    <div className="text-xs">Surface 3</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 状态指示器 */}
          <div className="enhanced-card p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">状态反馈</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-accent rounded-md">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm">处理中...</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded-md">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">操作成功</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-md">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm">操作失败</span>
              </div>
            </div>
          </div>
        </div>

        {/* 高级渐变背景测试 */}
        <div className="relative p-8 rounded-xl border shadow-sm overflow-hidden">
          {/* 背景渐变层 - 确保在暗色模式下有足够对比度 */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-surface-1/80 via-surface-2/60 to-surface-1/80"
            style={{
              background:
                "linear-gradient(to bottom right, hsl(var(--surface-1) / 0.8), hsl(var(--surface-2) / 0.6), hsl(var(--surface-1) / 0.8))",
            }}
          ></div>

          {/* 内容层 - 使用明确的文本颜色 */}
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              优雅渐变背景
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              重新设计的渐变背景，在暗色主题下提供更舒适的视觉体验，避免了过度对比造成的眼部疲劳。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-background/80 rounded-lg backdrop-blur-sm border border-border/50">
                <h3 className="font-semibold mb-2 text-foreground">半透明层</h3>
                <p className="text-sm text-muted-foreground">
                  使用背景模糊和透明度创造深度感
                </p>
              </div>
              <div className="p-4 bg-background/60 rounded-lg backdrop-blur-sm border border-border/50">
                <h3 className="font-semibold mb-2 text-foreground">微妙层次</h3>
                <p className="text-sm text-muted-foreground">
                  精心调校的透明度确保内容可读性
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 专业提示 */}
        <div className="enhanced-card p-6 rounded-lg border-l-4 border-l-primary">
          <h3 className="text-lg font-semibold mb-3">设计原则</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• 暗色背景使用温暖的深灰（240 4% 9%）而非纯黑，减少眼部疲劳</li>
            <li>• 文本对比度严格遵循 WCAG AA 标准，确保可访问性</li>
            <li>• 层级系统提供清晰的视觉深度，帮助用户理解界面结构</li>
            <li>• 过渡动画使用 cubic-bezier 缓动函数，提供自然的交互反馈</li>
            <li>• 色彩饱和度经过精心调校，在暗色环境下保持舒适度</li>
          </ul>
        </div>
      </div>

      <FloatingThemeToggle />
    </div>
  );
}
