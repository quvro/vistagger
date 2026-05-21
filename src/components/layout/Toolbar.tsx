import { useImageStore } from '../../stores/imageStore'
import { useUIStore } from '../../stores/uiStore'

export default function Toolbar() {
  const searchQuery = useImageStore((s) => s.searchQuery)
  const setSearchQuery = useImageStore((s) => s.setSearchQuery)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const toggleSettings = useUIStore((s) => s.toggleSettings)

  const handleImport = () => {
    // Will be implemented via Tauri dialog in Step 2
    alert('导入功能将在 Step 2 中实现')
  }

  const handleScreenshot = () => {
    // Will be implemented via Tauri screenshot in Step 5
    alert('截图功能将在 Step 5 中实现')
  }

  return (
    <header className="h-12 flex items-center gap-2 px-3 border-b border-surface-700 bg-surface-900 flex-shrink-0">
      {/* Sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className="p-1.5 rounded hover:bg-surface-700 transition-colors"
        title={sidebarOpen ? '收起侧栏' : '展开侧栏'}
      >
        <svg className="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索图片名称..."
            className="w-full bg-surface-800 text-sm text-surface-200 pl-8 pr-3 py-1.5 rounded border border-surface-600 focus:border-accent focus:outline-none placeholder-surface-500"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleImport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded bg-accent hover:bg-accent-hover text-white transition-colors"
          title="导入图片"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          导入
        </button>

        <button
          onClick={handleScreenshot}
          className="p-1.5 rounded hover:bg-surface-700 transition-colors"
          title="截图导入"
        >
          <svg className="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        <button
          onClick={toggleSettings}
          className="p-1.5 rounded hover:bg-surface-700 transition-colors"
          title="设置"
        >
          <svg className="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </header>
  )
}
