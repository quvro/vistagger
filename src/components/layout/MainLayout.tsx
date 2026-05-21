import { useState } from 'react'
import Sidebar from './Sidebar'
import Toolbar from './Toolbar'
import ImageGrid from '../library/ImageGrid'
import ImageDetail from '../library/ImageDetail'
import SettingsPage from './SettingsPage'
import { useUIStore } from '../../stores/uiStore'

export default function MainLayout() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const detailImageId = useUIStore((s) => s.detailImageId)
  const settingsOpen = useUIStore((s) => s.settingsOpen)
  const toggleSettings = useUIStore((s) => s.toggleSettings)

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
      </div>
    </div>
  )
}
