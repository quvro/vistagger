import { useImageStore } from '../../stores/imageStore'
import { useUIStore } from '../../stores/uiStore'
import type { ImageItem } from '../../types'

interface ImageCardProps {
  image: ImageItem
}

export default function ImageCard({ image }: ImageCardProps) {
  const selectedIds = useImageStore((s) => s.selectedIds)
  const selectImage = useImageStore((s) => s.selectImage)
  const openDetail = useUIStore((s) => s.openDetail)
  const addFloatingWindow = useUIStore((s) => s.addFloatingWindow)

  const isSelected = selectedIds.has(image.id)

  const handleClick = (e: React.MouseEvent) => {
    selectImage(image.id, e.ctrlKey || e.metaKey)
  }

  const handleDoubleClick = () => {
    openDetail(image.id)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    // Future: show context menu
  }

  return (
    <div
      className={`group relative rounded-lg overflow-hidden cursor-pointer border-2 transition-colors ${
        isSelected ? 'border-accent' : 'border-transparent hover:border-surface-600'
      }`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    >
      {/* Thumbnail */}
      <div className="aspect-[4/3] bg-surface-800 flex items-center justify-center">
        {image.thumbnailPath ? (
          <img
            src={image.thumbnailPath}
            alt={image.filename}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-surface-500">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">无预览</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-2 py-1.5 bg-surface-800">
        <p className="text-xs text-surface-300 truncate" title={image.filename}>
          {image.filename}
        </p>
        <p className="text-[10px] text-surface-500 mt-0.5">
          {image.width}x{image.height}
          {image.sourceUrl && ' · 来自网页'}
        </p>
      </div>

      {/* Hover actions */}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
        <button
          onClick={(e) => {
            e.stopPropagation()
            addFloatingWindow(image.id)
          }}
          className="p-1 rounded bg-surface-700/80 hover:bg-surface-600 text-surface-300"
          title="浮窗打开"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>

      {/* Selection badge */}
      {isSelected && (
        <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  )
}
