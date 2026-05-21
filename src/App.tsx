import { Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import SettingsPage from './components/layout/SettingsPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  )
}

export default App
