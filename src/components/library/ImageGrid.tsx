import { useCallback, useRef } from 'react'
import ImageCard from './ImageCard'
import { useImageStore } from '../../stores/imageStore'
import { useUIStore } from '../../stores/uiStore'

export default function ImageGrid() {
  const images = useImageStore((s) => s.images)
  const searchQuery = useImageStore((s) => s.searchQuery)
  const clearSelection = useUIStore((s) => s.clearSelection)
  const dropRef = useRef<HTMLDivElement>(null)

  // Filter images by search
  const filteredImages = images.filter((img) =>
    img.filename.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Will be implemented in Step 2 (file import) and Step 5 (web drag)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      alert(`接收到 ${files.length} 个文件，导入功能将在 Step 2 实现`)
    } else {
      // Try to get image URL from HTML drag
      const html = e.dataTransfer.getData('text/html')
      if (html) {
        const match = html.match(/<img[^>]+src="([^"]+)"/i)
        if (match) {
          alert(`检测到图片 URL: ${match[1]}，拖拽导入将在 Step 5 实现`)
        }
      }
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
          {images.length === 0 ? (
            <>
              <svg
                className="w-20 h-20 mb-4 opacity-30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-lg mb-2">图库为空</p>
              <p className="text-sm">拖拽图片到此处，或点击"导入"按钮</p>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    alert('导入功能将在 Step 2 实现')
                  }}
                  className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded text-sm transition-colors"
                >
                  导入图片
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-lg mb-2">未找到匹配的图片</p>
              <p className="text-sm">尝试修改搜索条件</p>
            </>
          )}
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
