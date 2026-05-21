import { useState } from 'react'
import { useTagStore } from '../../stores/tagStore'
import { useTags } from '../../hooks/useTags'
import TagChip from './TagChip'
import type { SimilarTagGroup } from '../../types'

export default function TagPanel() {
  const [newTagName, setNewTagName] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCatName, setNewCatName] = useState('')

  const categories = useTagStore((s) => s.categories)
  const tags = useTagStore((s) => s.tags)
  const similarGroups = useTagStore((s) => s.similarGroups)
  const removeCategory = useTagStore((s) => s.removeCategory)

  const { createTag, createCategory, deleteTag, mergeSimilarTags } = useTags()

  const handleCreateTag = () => {
    const name = newTagName.trim()
    const catId = selectedCategoryId || categories[0]?.id
    if (!name || !catId) return
    createTag(name, catId)
    setNewTagName('')
  }

  const handleCreateCategory = () => {
    const name = newCatName.trim()
    if (!name) return
    createCategory(name)
    setNewCatName('')
    setShowNewCategory(false)
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-surface-300">标签管理</h3>

      {/* Add tag */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
            placeholder="新标签名称..."
            className="flex-1 bg-surface-800 text-xs text-surface-200 px-2 py-1.5 rounded border border-surface-600 focus:border-accent focus:outline-none"
          />
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="bg-surface-800 text-xs text-surface-200 px-2 py-1.5 rounded border border-surface-600 focus:border-accent focus:outline-none max-w-[100px]"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <button
            onClick={handleCreateTag}
            className="text-xs px-2 py-1.5 rounded bg-accent hover:bg-accent-hover text-white transition-colors whitespace-nowrap"
          >
            添加
          </button>
        </div>
      </div>

      {/* Categories & Tags */}
      <div className="space-y-3">
        {categories.map((cat) => {
          const catTags = tags.filter((t) => t.categoryId === cat.id)
          return (
            <div key={cat.id}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-xs font-medium text-surface-400">{cat.name}</span>
                <span className="text-[10px] text-surface-600">({catTags.length})</span>
                {categories.length > 1 && cat.id !== 'default' && (
                  <button
                    onClick={() => {
                      if (confirm(`删除分类"${cat.name}"？`)) removeCategory(cat.id)
                    }}
                    className="text-[10px] text-surface-600 hover:text-red-400 ml-auto"
                  >
                    删除
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {catTags.map((tag) => (
                  <TagChip
                    key={tag.id}
                    name={tag.name}
                    color={cat.color}
                    onRemove={() => deleteTag(tag.id)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add category */}
      {showNewCategory ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
            placeholder="分类名称..."
            className="flex-1 bg-surface-800 text-xs text-surface-200 px-2 py-1.5 rounded border border-surface-600 focus:border-accent focus:outline-none"
            autoFocus
          />
          <button
            onClick={handleCreateCategory}
            className="text-xs px-2 py-1.5 rounded bg-accent hover:bg-accent-hover text-white"
          >
            确定
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowNewCategory(true)}
          className="text-xs text-accent hover:text-accent-hover transition-colors"
        >
          + 新建分类
        </button>
      )}

      {/* Similar tag suggestions */}
      {similarGroups.length > 0 && (
        <div className="border-t border-surface-700 pt-4">
          <h4 className="text-xs font-semibold text-surface-400 uppercase mb-2">
            相似标签建议合并
          </h4>
          <div className="space-y-2">
            {similarGroups.map((group: SimilarTagGroup, i: number) => (
              <div key={i} className="bg-surface-800 rounded p-2">
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {group.tags.map((tag) => (
                    <TagChip key={tag.id} name={tag.name} />
                  ))}
                </div>
                <p className="text-[10px] text-surface-500 mb-1.5">{group.reason}</p>
                <div className="flex gap-1">
                  <button
                    onClick={() => mergeSimilarTags(i, group.tags[0]?.name || group.suggestedName)}
                    className="text-[10px] px-2 py-0.5 rounded bg-accent/20 text-accent hover:bg-accent/30"
                  >
                    合并为「{group.tags[0]?.name}」
                  </button>
                  <button
                    onClick={() => useTagStore.getState().setSimilarGroups(
                      similarGroups.filter((_, j) => j !== i)
                    )}
                    className="text-[10px] px-2 py-0.5 rounded text-surface-500 hover:text-surface-300"
                  >
                    忽略
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
