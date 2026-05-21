import { useCallback, useRef } from 'react'
import ImageCard from './ImageCard'
import { useImageStore } from '../../stores/imageStore'
import { useAttributeStore } from '../../stores/attributeStore'

export default function ImageGrid() {
  const images = useImageStore((s) => s.images)
  const searchQuery = useImageStore((s) => s.searchQuery)
  const clearSelection = useImageStore((s) => s.clearSelection)
  const selectedAttributeIds = useAttributeStore((s) => s.selectedAttributeIds)
  const imageAttributes = useAttributeStore((s) => s.imageAttributes)
  const dropRef = useRef<HTMLDivElement>(null)

  // Filter by search + selected attribute filters
  const filteredImages = images.filter((img) => {
    const matchesSearch = img.filename.toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesSearch) return false

    // Attribute filter: image must have ALL selected attributes
    if (selectedAttributeIds.length > 0) {
      const imgAttrIds = new Set((imageAttributes[img.id] || []).map((ia) => ia.attributeId))
      return selectedAttributeIds.every((id) => imgAttrIds.has(id))
    }
    return true
  })

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      alert(`接收到 ${files.length} 个文件，拖拽导入将在后续实现`)
    }
  }, [])

  return (
    <div
      ref={dropRef}
      className="h-full overflow-y-auto p-4"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={clearSelection}
    >
      {filteredImages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-surface-500">
          <svg className="w-20 h-20 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-lg mb-2">{images.length === 0 ? '图库为空' : '无匹配图片'}</p>
          <p className="text-sm">
            {images.length === 0 ? '点击「导入」按钮添加图片' : '尝试调整筛选条件'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
          {filteredImages.map((image) => (
            <ImageCard key={image.id} image={image} />
          ))}
        </div>
      )}
    </div>
  )
}
