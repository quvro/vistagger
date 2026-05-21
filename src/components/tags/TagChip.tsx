// Tag chip component - will be fully implemented in Step 3

interface TagChipProps {
  name: string
  color?: string
  onRemove?: () => void
  onClick?: () => void
}

export default function TagChip({ name, color, onRemove, onClick }: TagChipProps) {
  return (
    <span
      onClick={onClick}
      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full cursor-pointer"
      style={{
        backgroundColor: color ? `${color}20` : undefined,
        color: color || undefined,
        border: `1px solid ${color || '#666'}`,
      }}
    >
      {name}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="hover:opacity-70"
        >
          x
        </button>
      )}
    </span>
  )
}
