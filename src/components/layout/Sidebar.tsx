import { useAttributeStore } from '../../stores/attributeStore'

export default function Sidebar() {
  const dimensions = useAttributeStore((s) => s.dimensions)
  const attributes = useAttributeStore((s) => s.attributes)
  const selectedAttributeIds = useAttributeStore((s) => s.selectedAttributeIds)
  const toggleAttributeFilter = useAttributeStore((s) => s.toggleAttributeFilter)
  const clearFilters = useAttributeStore((s) => s.clearFilters)

  return (
    <aside className="w-56 h-full bg-surface-900 border-r border-surface-700 flex flex-col select-none">
      <div className="px-3 py-3 border-b border-surface-700 flex items-center justify-between">
        <h2 className="text-xs font-semibold text-surface-300 uppercase tracking-wider">维度筛选</h2>
        {selectedAttributeIds.length > 0 && (
          <button onClick={clearFilters} className="text-[10px] text-accent hover:text-accent-hover">
            清除
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {dimensions.map((dim) => {
          const dimAttrs = attributes.filter((a) => a.dimensionId === dim.id)
          return (
            <div key={dim.id} className="mb-0.5">
              <div className="flex items-center gap-2 px-3 py-1.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: dim.color }} />
                <span className="text-xs text-surface-400 flex-1">{dim.name}</span>
                <span className="text-[10px] text-surface-600">{dimAttrs.length}</span>
              </div>
              <div className="px-5 pb-1">
                {dimAttrs.map((attr) => {
                  const isActive = selectedAttributeIds.includes(attr.id)
                  return (
                    <button
                      key={attr.id}
                      onClick={() => toggleAttributeFilter(attr.id)}
                      className={`w-full text-left text-[11px] px-2 py-0.5 rounded mb-0.5 transition-colors ${
                        isActive
                          ? 'bg-accent/15 text-accent'
                          : 'text-surface-500 hover:text-surface-300 hover:bg-surface-800/50'
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

      <div className="px-3 py-2 border-t border-surface-700">
        <p className="text-[10px] text-surface-600">
          {dimensions.length} 维度 · {attributes.length} 属性
        </p>
      </div>
    </aside>
  )
}
