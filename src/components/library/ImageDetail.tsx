import { useCallback } from 'react'
import { useUIStore } from '../../stores/uiStore'
import { useImageStore } from '../../stores/imageStore'
import { useTagStore } from '../../stores/tagStore'
import * as api from '../../api/tauri'

export default function ImageDetail() {
  const detailImageId = useUIStore((s) => s.detailImageId)
  const closeDetail = useUIStore((s) => s.closeDetail)
  const addFloatingWindow = useUIStore((s) => s.addFloatingWindow)
  const images = useImageStore((s) => s.images)
  const tags = useTagStore((s) => s.tags)
  const categories = useTagStore((s) => s.categories)
  const imageTags = useTagStore((s) => s.imageTags)
  const setImageTags = useTagStore((s) => s.setImageTags)

  const image = images.find((img) => img.id === detailImageId)
  if (!image) return null

  const currentImageTags = imageTags[image.id] || []
  const currentTagIds = new Set(currentImageTags.map((it) => it.tagId))

  const toggleTag = useCallback(async (tagId: string) => {
    const nextIds = currentTagIds.has(tagId)
      ? [...currentTagIds].filter((id) => id !== tagId)
      : [...currentTagIds, tagId]
    try {
      const result = await api.setImageTags(image.id, nextIds)
      setImageTags(image.id, result)
    } catch {
      setImageTags(image.id, nextIds.map((tagId) => ({
        imageId: image.id, tagId, isAuto: false,
      })))
    }
  }, [image.id, currentTagIds, setImageTags])

  return (
    <aside className="w-80 h-full bg-surface-900 border-l border-surface-700 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-surface-700">
        <h3 className="text-sm font-semibold text-surface-300">图片详情</h3>
        <button
          onClick={closeDetail}
          className="p-1 rounded hover:bg-surface-700 transition-colors"
        >
          <svg className="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Preview */}
      <div className="p-3 border-b border-surface-700">
        <div className="rounded-lg overflow-hidden bg-surface-800">
          {image.thumbnailPath ? (
            <img src={image.thumbnailPath} alt={image.filename} className="w-full object-contain" />
          ) : (
            <div className="aspect-[4/3] flex items-center justify-center text-surface-500 text-sm">
              无预览
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 border-b border-surface-700 space-y-1.5">
        <p className="text-sm text-surface-200 font-medium break-all">{image.filename}</p>
        <p className="text-xs text-surface-500">
          {image.width} x {image.height} · {image.format.toUpperCase()}
        </p>
        {image.sourceUrl && (
          <p className="text-xs text-surface-500 truncate" title={image.sourceUrl}>
            来源: {image.sourceUrl}
          </p>
        )}
      </div>

      {/* Tags by category */}
      <div className="flex-1 overflow-y-auto p-3">
        <h4 className="text-xs font-semibold text-surface-400 uppercase mb-2">标签</h4>

        {categories.map((cat) => {
          const catTags = tags.filter((t) => t.categoryId === cat.id)
          if (catTags.length === 0) return null
          return (
            <div key={cat.id} className="mb-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-[11px] text-surface-500">{cat.name}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {catTags.map((tag) => {
                  const isActive = currentTagIds.has(tag.id)
                  return (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                        isActive
                          ? 'bg-accent/20 text-accent border border-accent/30'
                          : 'bg-surface-800 text-surface-400 border border-surface-700 hover:border-surface-500'
                      }`}
                    >
                      {tag.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

        {tags.length === 0 && (
          <p className="text-xs text-surface-500">暂无标签，请先导入图片并创建标签</p>
        )}
      </div>

      {/* AI Analysis */}
      <div className="p-3 border-t border-surface-700">
        <button
          className="w-full text-xs px-3 py-1.5 rounded bg-surface-700 hover:bg-surface-600 text-surface-300 transition-colors mb-2"
          onClick={() => alert('AI 分析将在 Step 4 实现')}
        >
          AI 自动分析标签
        </button>
      </div>

      {/* Actions */}
      <div className="p-3 pt-0 space-y-2">
        <button
          onClick={() => addFloatingWindow(image.id)}
          className="w-full text-xs px-3 py-2 rounded bg-accent hover:bg-accent-hover text-white transition-colors"
        >
          在浮窗中打开
        </button>
      </div>
    </aside>
  )
}
