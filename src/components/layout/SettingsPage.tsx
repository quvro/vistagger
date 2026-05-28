import { useState, useEffect } from 'react'
import * as api from '../../api/tauri'
import type { Settings } from '../../types'

interface SettingsPageProps {
  onClose?: () => void
}

const defaults: Settings = {
  libraryPath: '',
  cloudApiType: 'claude',
  localModelEnabled: false,
}

export default function SettingsPage({ onClose }: SettingsPageProps) {
  const isModal = !!onClose
  const [settings, setSettings] = useState<Settings>(defaults)
  const [loaded, setLoaded] = useState(false)
  const [saved, setSaved] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState('')

  useEffect(() => {
    api.getSettings().then((s) => {
      setSettings({ ...defaults, ...s })
      setLoaded(true)
    }).catch(() => setLoaded(true))
  }, [])

  // Show API key as masked if loaded from DB
  useEffect(() => {
    if (loaded && settings.cloudApiKey && !apiKeyInput) {
      setApiKeyInput('••••••••')
    }
  }, [loaded])

  const handleSave = async () => {
    const toSave: Settings = {
      ...settings,
      cloudApiKey: apiKeyInput && apiKeyInput !== '••••••••' ? apiKeyInput : settings.cloudApiKey,
    }
    try {
      await api.saveSettings(toSave)
      setSettings(toSave)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // Not in Tauri env
    }
  }

  const content = (
    <div className="bg-surface-900">
      <div className="flex items-center justify-between px-6 py-4 border-b border-surface-700">
        <h1 className="text-lg font-semibold text-surface-200">设置</h1>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded hover:bg-surface-700">
            <svg className="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Cloud API */}
        <section>
          <h2 className="text-sm font-semibold text-surface-300 mb-3">AI 属性分析</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-sm text-surface-300 mb-1">API 类型</label>
              <select
                value={settings.cloudApiType || 'claude'}
                onChange={(e) => setSettings({ ...settings, cloudApiType: e.target.value as 'claude' | 'openai' })}
                className="w-full bg-surface-800 text-sm text-surface-200 px-3 py-2 rounded border border-surface-600 focus:border-accent focus:outline-none"
              >
                <option value="claude">Claude Vision (推荐)</option>
                <option value="openai">OpenAI Vision</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-surface-300 mb-1">API Key</label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                onFocus={() => { if (apiKeyInput === '••••••••') setApiKeyInput('') }}
                placeholder={settings.cloudApiKey ? '(已保存)' : '输入 API Key...'}
                className="w-full bg-surface-800 text-sm text-surface-200 px-3 py-2 rounded border border-surface-600 focus:border-accent focus:outline-none"
              />
              <p className="text-[10px] text-surface-500 mt-1">
                {settings.cloudApiType === 'claude'
                  ? 'Claude API key 从 console.anthropic.com 获取'
                  : 'OpenAI API key 从 platform.openai.com 获取'}
              </p>
            </div>
          </div>
        </section>

        {/* Save */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm rounded bg-accent hover:bg-accent-hover text-white transition-colors"
          >
            保存设置
          </button>
          {saved && (
            <span className="text-xs text-green-400">已保存</span>
          )}
        </div>

        {/* About */}
        <section className="border-t border-surface-700 pt-4">
          <h2 className="text-sm font-semibold text-surface-300 mb-2">关于</h2>
          <p className="text-xs text-surface-500">VisTagger v0.1.0 - 轻量级绘画参考工具</p>
        </section>
      </div>
    </div>
  )

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-[480px] max-h-[80vh] overflow-y-auto rounded-lg shadow-2xl">
          {content}
        </div>
      </div>
    )
  }

  return content
}
