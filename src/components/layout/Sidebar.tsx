import { useState } from 'react'
import { useTagStore } from '../../stores/tagStore'
import { useImageStore } from '../../stores/imageStore'
import { useTags } from '../../hooks/useTags'

export default function Sidebar() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  const categories = useTagStore((s) => s.categories)
  const tags = useTagStore((s) => s.tags)
  const filterTagIds = useImageStore((s) => s.filterTagIds)
  const toggleFilterTag = useImageStore((s) => s.toggleFilterTag)
  const setFilterTagIds = useImageStore((s) => s.setFilterTagIds)
  const removeCategory = useTagStore((s) => s.removeCategory)
  const { createCategory } = useTags()

  const handleAddCategory = async () => {
    const name = newCategoryName.trim()
    if (!name) return
    const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#f43f5e', '#eab308']
    const color = colors[Math.floor(Math.random() * colors.length)]
    await createCategory(name, color)
    setNewCategoryName('')
    setShowAddCategory(false)
  }

  return (
    <aside className="w-64 h-full bg-surface-900 border-r border-surface-700 flex flex-col select-none">
      {/* Header */}
      <div className="px-4 py-3 border-b border-surface-700 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wider">
          标签筛选
        </h2>
        <button
          onClick={() => setShowAddCategory(true)}
          className="p-0.5 rounded hover:bg-surface-700 transition-colors"
          title="新建分类"
        >
          <svg className="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Add category input */}
      {showAddCategory && (
        <div className="px-3 py-2 border-b border-surface-700 flex gap-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            onBlur={() => !newCategoryName && setShowAddCategory(false)}
            placeholder="分类名称..."
            className="flex-1 bg-surface-800 text-xs text-surface-200 px-2 py-1 rounded border border-surface-600 focus:border-accent focus:outline-none"
            autoFocus
          />
          <button
            onClick={handleAddCategory}
            className="text-xs px-2 py-1 rounded bg-accent hover:bg-accent-hover text-white transition-colors"
          >
            确定
          </button>
        </div>
      )}

      {/* Active filters */}
      {filterTagIds.length > 0 && (
        <div className="px-3 py-2 border-b border-surface-700">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-surface-400">已选 {filterTagIds.length} 个标签</span>
            <button
              onClick={() => setFilterTagIds([])}
              className="text-xs text-accent hover:text-accent-hover"
            >
              清除
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {filterTagIds.map((tagId) => {
              const tag = tags.find((t) => t.id === tagId)
              if (!tag) return null
              return (
                <span
                  key={tagId}
                  className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent cursor-pointer hover:bg-accent/30"
                  onClick={() => toggleFilterTag(tagId)}
                >
                  {tag.name} x
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Category list */}
      <div className="flex-1 overflow-y-auto py-2">
        {categories.map((cat) => {
          const catTags = tags.filter((t) => t.categoryId === cat.id)
          const isExpanded = expandedCategory === cat.id

          return (
            <div key={cat.id} className="mb-0.5">
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-surface-800/50 transition-colors text-left group"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-sm text-surface-300 flex-1">{cat.name}</span>
                <span className="text-xs text-surface-500">{catTags.length}</span>
                <svg
                  className={`w-3 h-3 text-surface-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
                </svg>

                {/* Delete category button (only if not the last one) */}
                {categories.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm(`删除分类"${cat.name}"？其中的标签会移到默认分类。`)) {
                        removeCategory(cat.id)
                      }
                    }}
                    className="p-0.5 opacity-0 group-hover:opacity-100 hover:bg-surface-600 rounded transition-all"
                    title="删除分类"
                  >
                    <svg className="w-3 h-3 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </button>

              {isExpanded && (
                <div className="px-4 pb-1">
                  {catTags.length === 0 ? (
                    <p className="text-xs text-surface-500 py-1 px-2">暂无标签</p>
                  ) : (
                    catTags.map((tag) => {
                      const isActive = filterTagIds.includes(tag.id)
                      return (
                        <button
                          key={tag.id}
                          onClick={() => toggleFilterTag(tag.id)}
                          className={`w-full text-left text-xs px-2 py-1 rounded mb-0.5 transition-colors ${
                            isActive
                              ? 'bg-accent/20 text-accent'
                              : 'text-surface-400 hover:bg-surface-800'
                          }`}
                        >
                          {tag.name}
                        </button>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bottom: tag count */}
      <div className="px-4 py-2 border-t border-surface-700">
        <p className="text-xs text-surface-500">
          共 {categories.length} 个分类，{tags.length} 个标签
        </p>
      </div>
    </aside>
  )
}
