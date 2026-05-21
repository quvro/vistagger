interface SettingsPageProps {
  onClose?: () => void
}

export default function SettingsPage({ onClose }: SettingsPageProps) {
  const isModal = !!onClose

  const content = (
    <div className={`bg-surface-900 ${isModal ? '' : 'h-full'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-surface-700">
        <h1 className="text-lg font-semibold text-surface-200">设置</h1>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-surface-700 transition-colors"
          >
            <svg className="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Library path */}
        <section>
          <h2 className="text-sm font-semibold text-surface-300 mb-2">图库路径</h2>
          <p className="text-xs text-surface-500 mb-2">图片将存储在此文件夹中</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="选择文件夹..."
              className="flex-1 bg-surface-800 text-sm text-surface-200 px-3 py-2 rounded border border-surface-600 focus:border-accent focus:outline-none"
              readOnly
            />
            <button className="px-3 py-2 text-sm rounded bg-surface-700 hover:bg-surface-600 text-surface-300 transition-colors">
              浏览
            </button>
          </div>
        </section>

        {/* AI Settings */}
        <section>
          <h2 className="text-sm font-semibold text-surface-300 mb-2">AI 标签分析</h2>

          <div className="space-y-3">
            {/* Local model */}
            <label className="flex items-center gap-3">
              <input type="checkbox" className="rounded accent-accent" defaultChecked />
              <div>
                <span className="text-sm text-surface-300">启用本地模型</span>
                <p className="text-xs text-surface-500">离线使用，隐私安全，需要下载模型文件</p>
              </div>
            </label>

            {/* Cloud API */}
            <div>
              <label className="flex items-center gap-3 mb-2">
                <input type="checkbox" className="rounded accent-accent" />
                <div>
                  <span className="text-sm text-surface-300">启用云端 API</span>
                  <p className="text-xs text-surface-500">识别更精准，需要网络连接和 API Key</p>
                </div>
              </label>

              <div className="ml-8 space-y-2">
                <select className="w-full bg-surface-800 text-sm text-surface-200 px-3 py-1.5 rounded border border-surface-600 focus:border-accent focus:outline-none">
                  <option value="">选择 API 类型...</option>
                  <option value="claude">Claude Vision</option>
                  <option value="openai">OpenAI Vision</option>
                </select>
                <input
                  type="password"
                  placeholder="API Key"
                  className="w-full bg-surface-800 text-sm text-surface-200 px-3 py-2 rounded border border-surface-600 focus:border-accent focus:outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* About */}
        <section>
          <h2 className="text-sm font-semibold text-surface-300 mb-2">关于</h2>
          <p className="text-xs text-surface-500">VisTagger v0.1.0 - 轻量级绘画参考工具</p>
        </section>
      </div>
    </div>
  )

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-[480px] max-h-[80vh] overflow-y-auto rounded-lg shadow-2xl">
          {content}
        </div>
      </div>
    )
  }

  return content
}
