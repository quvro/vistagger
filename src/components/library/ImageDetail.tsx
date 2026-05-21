import { useCallback } from 'react'
import { useUIStore } from '../../stores/uiStore'
import { useImageStore } from '../../stores/imageStore'
import { useAttributeStore } from '../../stores/attributeStore'
import * as api from '../../api/tauri'
import { isTauri } from '../../api/tauri'

function assetUrl(path: string | undefined): string {
  if (!path) return ''
  if (isTauri && path.startsWith('/')) return `https://asset.localhost/${path}`
  return path
}

export default function ImageDetail() {
  const detailImageId = useUIStore((s) => s.detailImageId)
  const closeDetail = useUIStore((s) => s.closeDetail)
  const addFloatingWindow = useUIStore((s) => s.addFloatingWindow)
  const images = useImageStore((s) => s.images)
  const dimensions = useAttributeStore((s) => s.dimensions)
  const attributes = useAttributeStore((s) => s.attributes)
  const imageAttributes = useAttributeStore((s) => s.imageAttributes)
  const setImageAttributes = useAttributeStore((s) => s.setImageAttributes)

  const image = images.find((img) => img.id === detailImageId)
  if (!image) return null

  const currentImageAttrs = imageAttributes[image.id] || []
  const currentAttrIds = new Set(currentImageAttrs.map((ia) => ia.attributeId))

  const toggleAttr = useCallback(async (attrId: string) => {
    const nextIds = currentAttrIds.has(attrId)
      ? [...currentAttrIds].filter((id) => id !== attrId)
      : [...currentAttrIds, attrId]
    try {
      const result = await api.setImageAttributes(image.id, nextIds)
      setImageAttributes(image.id, result)
    } catch {
      setImageAttributes(image.id, nextIds.map((attributeId) => ({
        imageId: image.id, attributeId, isAuto: false, isPrimary: false,
      })))
    }
  }, [image.id, currentAttrIds, setImageAttributes])

  return (
    <aside className="w-80 h-full bg-surface-900 border-l border-surface-700 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-surface-700">
        <h3 className="text-sm font-semibold text-surface-300">图片详情</h3>
        <button onClick={closeDetail} className="p-1 rounded hover:bg-surface-700">
          <svg className="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Preview */}
      <div className="p-3 border-b border-surface-700">
        <div className="rounded-lg overflow-hidden bg-surface-800">
          {image.thumbnailPath ? (
            <img src={assetUrl(image.thumbnailPath)} alt={image.filename} className="w-full object-contain" />
          ) : (
            <div className="aspect-[4/3] flex items-center justify-center text-surface-500 text-sm">无预览</div>
          )}
        </div>
      </div>

      {/* File info */}
      <div className="p-3 border-b border-surface-700 space-y-1">
        <p className="text-sm text-surface-200 font-medium break-all">{image.filename}</p>
        <p className="text-xs text-surface-500">
          {image.width} x {image.height} · {(image.fileSize! / 1024).toFixed(1)} KB
        </p>
      </div>

      {/* Structured attributes by dimension */}
      <div className="flex-1 overflow-y-auto p-3">
        <h4 className="text-xs font-semibold text-surface-400 uppercase mb-3">属性</h4>
        {dimensions.map((dim) => {
          const dimAttrs = attributes.filter((a) => a.dimensionId === dim.id)
          return (
            <div key={dim.id} className="mb-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dim.color }} />
                <span className="text-[11px] text-surface-500">{dim.name}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {dimAttrs.map((attr) => {
                  const isActive = currentAttrIds.has(attr.id)
                  return (
                    <button key={attr.id} onClick={() => toggleAttr(attr.id)}
                      className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                        isActive
                          ? 'bg-accent/15 text-accent border border-accent/30'
                          : 'bg-surface-800 text-surface-500 border border-surface-700 hover:border-surface-500'
                      }`}
                    >
                      {attr.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Actions */}
      <div className="p-3 border-t border-surface-700 space-y-2">
        <button
          className="w-full text-xs px-3 py-1.5 rounded bg-surface-700 hover:bg-surface-600 text-surface-300"
          onClick={() => alert('AI 分析将在 Step 4 实现')}
        >
          AI 自动分析属性
        </button>
        <button
          onClick={() => addFloatingWindow(image.id)}
          className="w-full text-xs px-3 py-2 rounded bg-accent hover:bg-accent-hover text-white"
        >
          在浮窗中打开
        </button>
      </div>
    </aside>
  )
}
