import { useState } from 'react'
import { useAttributeStore } from '../../stores/attributeStore'
import { useAttributes } from '../../hooks/useAttributes'
import AttributeBadge from './AttributeBadge'

interface AttributePanelProps {
  onClose: () => void
}

export default function AttributePanel({ onClose }: AttributePanelProps) {
  const dimensions = useAttributeStore((s) => s.dimensions)
  const attributes = useAttributeStore((s) => s.attributes)

  const {
    createDimension, removeDimension,
    createAttribute, deleteAttribute,
  } = useAttributes()

  const [newDimName, setNewDimName] = useState('')
  const [showAddDim, setShowAddDim] = useState(false)
  const [addingAttrFor, setAddingAttrFor] = useState<string | null>(null)
  const [newAttrName, setNewAttrName] = useState('')

  const handleAddDimension = async () => {
    const name = newDimName.trim()
    if (!name) return
    await createDimension(name)
    setNewDimName('')
    setShowAddDim(false)
  }

  const handleAddAttribute = async (dimId: string) => {
    const name = newAttrName.trim()
    if (!name) return
    await createAttribute(dimId, name)
    setNewAttrName('')
    setAddingAttrFor(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[520px] max-h-[80vh] bg-surface-900 rounded-lg shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-700">
          <h2 className="text-sm font-semibold text-surface-300">属性管理</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface-700">
            <svg className="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {dimensions.map((dim) => {
            const dimAttrs = attributes.filter((a) => a.dimensionId === dim.id)
            const isLast = dimensions.length <= 1
            return (
              <div key={dim.id} className="bg-surface-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dim.color }} />
                  <span className="text-sm font-medium text-surface-300">{dim.name}</span>
                  <span className="text-xs text-surface-500">({dimAttrs.length})</span>
                  {!isLast && (
                    <button
                      onClick={() => { if (confirm(`删除维度"${dim.name}"？其中的属性也会被删除。`)) removeDimension(dim.id) }}
                      className="text-[10px] text-surface-600 hover:text-red-400 ml-auto"
                    >
                      删除维度
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mb-2">
                  {dimAttrs.map((attr) => (
                    <AttributeBadge
                      key={attr.id}
                      name={attr.name}
                      color={dim.color}
                      onRemove={() => deleteAttribute(attr.id)}
                    />
                  ))}
                </div>

                {addingAttrFor === dim.id ? (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={newAttrName}
                      onChange={(e) => setNewAttrName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddAttribute(dim.id)}
                      onBlur={() => !newAttrName && setAddingAttrFor(null)}
                      placeholder="属性名..."
                      className="flex-1 bg-surface-700 text-xs text-surface-200 px-2 py-1 rounded border border-surface-600 focus:border-accent focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => handleAddAttribute(dim.id)}
                      className="text-[10px] px-2 py-1 rounded bg-accent/20 text-accent hover:bg-accent/30"
                    >
                      添加
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setAddingAttrFor(dim.id); setNewAttrName('') }}
                    className="text-[10px] text-accent hover:text-accent-hover"
                  >
                    + 添加属性
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-surface-700">
          {showAddDim ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={newDimName}
                onChange={(e) => setNewDimName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddDimension()}
                onBlur={() => !newDimName && setShowAddDim(false)}
                placeholder="维度名称..."
                className="flex-1 bg-surface-800 text-xs text-surface-200 px-2 py-1.5 rounded border border-surface-600 focus:border-accent focus:outline-none"
                autoFocus
              />
              <button
                onClick={handleAddDimension}
                className="text-xs px-3 py-1.5 rounded bg-accent hover:bg-accent-hover text-white"
              >
                确定
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setShowAddDim(true); setNewDimName('') }}
              className="text-xs text-accent hover:text-accent-hover"
            >
              + 新建维度
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
