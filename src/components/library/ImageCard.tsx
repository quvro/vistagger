import { useImageStore } from '../../stores/imageStore'
import { useAttributeStore } from '../../stores/attributeStore'
import { useUIStore } from '../../stores/uiStore'
import AttributeBadge from '../attributes/AttributeBadge'
import { isTauri } from '../../api/tauri'
import type { ImageItem } from '../../types'

function assetUrl(path: string): string {
  if (isTauri && path.startsWith('/')) return `https://asset.localhost${path}`
  return path
}

interface ImageCardProps {
  image: ImageItem
}

export default function ImageCard({ image }: ImageCardProps) {
  const selectedIds = useImageStore((s) => s.selectedIds)
  const selectImage = useImageStore((s) => s.selectImage)
  const openDetail = useUIStore((s) => s.openDetail)
  const addFloatingWindow = useUIStore((s) => s.addFloatingWindow)
  const attributes = useAttributeStore((s) => s.attributes)
  const dimensions = useAttributeStore((s) => s.dimensions)
  const currentAttrs = useAttributeStore((s) => s.imageAttributes[image.id]) || []

  const isSelected = selectedIds.has(image.id)
  const primaryAttrs = currentAttrs.filter((ia) => ia.isPrimary)

  const handleClick = (e: React.MouseEvent) => {
    selectImage(image.id, e.ctrlKey || e.metaKey)
  }

  return (
    <div
      className={`group relative rounded-lg overflow-hidden cursor-pointer border-2 transition-colors ${
        isSelected ? 'border-accent' : 'border-transparent hover:border-surface-600'
      }`}
      onClick={handleClick}
      onDoubleClick={() => openDetail(image.id)}
    >
      {/* Thumbnail */}
      <div className="aspect-[4/3] bg-surface-800 flex items-center justify-center">
        {image.thumbnailPath ? (
          <img src={assetUrl(image.thumbnailPath)} alt={image.filename} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <svg className="w-10 h-10 text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </div>

      {/* Info */}
      <div className="px-2 py-1.5 bg-surface-800 space-y-1">
        <p className="text-[11px] text-surface-300 truncate" title={image.filename}>{image.filename}</p>
        {/* Primary attribute badges (max 4) */}
        {primaryAttrs.length > 0 && (
          <div className="flex flex-wrap gap-0.5">
            {primaryAttrs.slice(0, 4).map((ia) => {
              const attr = attributes.find((a) => a.id === ia.attributeId)
              const dim = attr ? dimensions.find((d) => d.id === attr.dimensionId) : null
              if (!attr) return null
              return <AttributeBadge key={attr.id} name={attr.name} color={dim?.color} />
            })}
          </div>
        )}
        {/* Show count if no attributes yet */}
        {primaryAttrs.length === 0 && (
          <p className="text-[10px] text-surface-600">
            {image.width && image.height ? `${image.width}×${image.height}` : ''}
          </p>
        )}
      </div>

      {/* Hover: float button */}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); addFloatingWindow(image.id) }}
          className="p-1 rounded bg-surface-700/80 hover:bg-surface-600 text-surface-300"
          title="浮窗打开"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>

      {/* Selection check */}
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
