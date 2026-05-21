interface AttributeBadgeProps {
  name: string
  color?: string
  onRemove?: () => void
  onClick?: () => void
}

export default function AttributeBadge({ name, color, onRemove, onClick }: AttributeBadgeProps) {
  return (
    <span
      onClick={onClick}
      className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full transition-colors"
      style={{
        backgroundColor: color ? `${color}18` : undefined,
        color: color || '#a0a0a0',
        border: `1px solid ${color ? `${color}40` : '#555'}`,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {name}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          className="hover:opacity-70 ml-0.5"
        >
          ×
        </button>
      )}
    </span>
  )
}
