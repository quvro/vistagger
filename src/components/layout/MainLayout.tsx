import Sidebar from './Sidebar'
import Toolbar from './Toolbar'
import ImageGrid from '../library/ImageGrid'
import ImageDetail from '../library/ImageDetail'
import SettingsPage from './SettingsPage'
import AttributePanel from '../attributes/AttributePanel'
import { useUIStore } from '../../stores/uiStore'

export default function MainLayout() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const detailImageId = useUIStore((s) => s.detailImageId)
  const settingsOpen = useUIStore((s) => s.settingsOpen)
  const attributePanelOpen = useUIStore((s) => s.attributePanelOpen)
  const toggleSettings = useUIStore((s) => s.toggleSettings)
  const toggleAttributePanel = useUIStore((s) => s.toggleAttributePanel)

  return (
    <div className="h-full flex flex-col">
      <Toolbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && <Sidebar />}

        {/* Main content */}
        <main className="flex-1 overflow-hidden bg-surface-950">
          <ImageGrid />
        </main>

        {/* Detail panel */}
        {detailImageId && <ImageDetail />}

        {/* Settings modal */}
        {settingsOpen && (
          <SettingsPage onClose={toggleSettings} />
        )}

        {/* Attribute management panel */}
        {attributePanelOpen && (
          <AttributePanel onClose={toggleAttributePanel} />
        )}
      </div>
    </div>
  )
}
