import { useState, useCallback } from 'react'
import { useUIStore } from '../../stores/uiStore'
import { useImageStore } from '../../stores/imageStore'
import { useAttributeStore } from '../../stores/attributeStore'
import * as api from '../../api/tauri'
import { isTauri } from '../../api/tauri'
import type { AIStructuredResult } from '../../types'

function assetUrl(path: string | undefined): string {
  if (!path) return ''
  if (isTauri && path.startsWith('/')) return `https://asset.localhost${path}`
  return path
}

export default function ImageDetail() {
  const detailImageId = useUIStore((s) => s.detailImageId)
  const closeDetail = useUIStore((s) => s.closeDetail)
  const addFloatingWindow = useUIStore((s) => s.addFloatingWindow)
  const images = useImageStore((s) => s.images)
  const dimensions = useAttributeStore((s) => s.dimensions)
  const attributes = useAttributeStore((s) => s.attributes)
  const addAttribute = useAttributeStore((s) => s.addAttribute)
  const imageAttributes = useAttributeStore((s) => s.imageAttributes)
  const setImageAttributes = useAttributeStore((s) => s.setImageAttributes)

  const [addingForDim, setAddingForDim] = useState<string | null>(null)
  const [newAttrName, setNewAttrName] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  const image = images.find((img) => img.id === detailImageId)
  if (!image) return null

  const currentImageAttrs = imageAttributes[image.id] || []
  const currentAttrIds = new Set(currentImageAttrs.map((ia) => ia.attributeId))
  const primaryAttrIds = new Set(
    currentImageAttrs.filter((ia) => ia.isPrimary).map((ia) => ia.attributeId)
  )

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

  const togglePrimary = async (attrId: string) => {
    if (!currentAttrIds.has(attrId)) return
    const nextPrimary = primaryAttrIds.has(attrId)
      ? [...primaryAttrIds].filter((id) => id !== attrId)
      : [...primaryAttrIds, attrId]
    try {
      await api.setPrimaryAttributes(image.id, nextPrimary)
      setImageAttributes(image.id, currentImageAttrs.map((ia) => ({
        ...ia,
        isPrimary: nextPrimary.includes(ia.attributeId),
      })))
    } catch {}
  }

  const handleAddAttribute = async (dimId: string) => {
    const name = newAttrName.trim()
    if (!name) return
    try {
      const attr = await api.createAttribute(dimId, name)
      addAttribute(attr)
      const nextIds = [...currentAttrIds, attr.id]
      const result = await api.setImageAttributes(image.id, nextIds)
      setImageAttributes(image.id, result)
    } catch {
      // If attribute was created but linking failed, still try to link locally
      // The attribute exists in DB, user can re-add from the panel
    }
    setNewAttrName('')
    setAddingForDim(null)
  }

  const handleAnalyze = async () => {
    setAnalyzing(true)
    setAiError(null)
    try {
      await api.analyzeImageCloud(image.id)
      const [imgAttrs, allAttrs] = await Promise.all([
        api.getImageAttributes(image.id),
        api.getAttributes(),
      ])
      setImageAttributes(image.id, imgAttrs)
      useAttributeStore.getState().setAttributes(allAttrs)
    } catch (e: any) {
      setAiError(e?.toString() || '分析失败')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <aside className="w-80 h-full bg-surface-900 border-l border-surface-700 flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between px-3 py-2 border-b border-surface-700">
        <h3 className="text-sm font-semibold text-surface-300">图片详情</h3>
        <button onClick={closeDetail} className="p-1 rounded hover:bg-surface-700">
          <svg className="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-3 border-b border-surface-700">
        <div className="rounded-lg overflow-hidden bg-surface-800">
          {image.thumbnailPath ? (
            <img src={assetUrl(image.thumbnailPath)} alt={image.filename} className="w-full object-contain" />
          ) : (
            <div className="aspect-[4/3] flex items-center justify-center text-surface-500 text-sm">无预览</div>
          )}
        </div>
      </div>

      <div className="p-3 border-b border-surface-700 space-y-1">
        <p className="text-sm text-surface-200 font-medium break-all">{image.filename}</p>
        <p className="text-xs text-surface-500">
          {image.width} x {image.height} · {image.fileSize ? `${(image.fileSize / 1024).toFixed(1)} KB` : ''}
        </p>
        <div className="flex gap-1">
          <span className="text-[10px] text-surface-600">
            {currentImageAttrs.length} 个属性 · {primaryAttrIds.size} 个主属性
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <h4 className="text-xs font-semibold text-surface-400 uppercase mb-3">属性</h4>
        {dimensions.map((dim) => {
          const dimAttrs = attributes.filter((a) => a.dimensionId === dim.id)
          const activeCount = dimAttrs.filter((a) => currentAttrIds.has(a.id)).length
          return (
            <div key={dim.id} className="mb-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dim.color }} />
                <span className="text-[11px] text-surface-500">{dim.name}</span>
                {activeCount > 0 && (
                  <span className="text-[10px] text-surface-600">({activeCount})</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {dimAttrs.map((attr) => {
                  const isActive = currentAttrIds.has(attr.id)
                  const isPrimary = primaryAttrIds.has(attr.id)
                  return (
                    <div key={attr.id} className="relative group/attr">
                      <button onClick={() => toggleAttr(attr.id)}
                        className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                          isActive
                            ? 'bg-accent/15 text-accent border border-accent/30'
                            : 'bg-surface-800 text-surface-500 border border-surface-700 hover:border-surface-500'
                        }`}
                      >
                        {attr.name}
                      </button>
                      {isActive && (
                        <button
                          onClick={(e) => { e.stopPropagation(); togglePrimary(attr.id) }}
                          className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] transition-colors ${
                            isPrimary
                              ? 'bg-yellow-500/80 text-white'
                              : 'bg-surface-600/80 text-surface-400 opacity-0 group-hover/attr:opacity-100'
                          }`}
                          title={isPrimary ? '取消主属性' : '设为主属性'}
                        >
                          ★
                        </button>
                      )}
                    </div>
                  )
                })}

                {addingForDim === dim.id ? (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={newAttrName}
                      onChange={(e) => setNewAttrName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddAttribute(dim.id)}
                      onBlur={() => { if (!newAttrName) setAddingForDim(null) }}
                      placeholder="新属性..."
                      className="w-20 bg-surface-700 text-[10px] text-surface-200 px-1.5 py-0.5 rounded border border-surface-600 focus:border-accent focus:outline-none"
                      autoFocus
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => { setAddingForDim(dim.id); setNewAttrName('') }}
                    className="text-[10px] px-1.5 py-0.5 rounded text-surface-600 hover:text-accent hover:bg-surface-800 transition-colors"
                  >
                    +
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="p-3 border-t border-surface-700 space-y-2">
        {aiError && (
          <p className="text-[10px] text-red-400 mb-1">{aiError}</p>
        )}
        <button
          className="w-full text-xs px-3 py-1.5 rounded bg-surface-700 hover:bg-surface-600 text-surface-300 disabled:opacity-50"
          onClick={handleAnalyze}
          disabled={analyzing}
        >
          {analyzing ? 'AI 分析中...' : 'AI 自动分析属性'}
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
