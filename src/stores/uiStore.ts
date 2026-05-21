import { create } from 'zustand'

interface UIStore {
  sidebarOpen: boolean
  detailImageId: string | null
  floatingWindows: FloatingWindowState[]
  settingsOpen: boolean

  toggleSidebar: () => void
  openDetail: (imageId: string) => void
  closeDetail: () => void
  addFloatingWindow: (imageId: string) => void
  removeFloatingWindow: (windowId: string) => void
  toggleSettings: () => void
}

export interface FloatingWindowState {
  id: string
  imageId: string
  opacity: number
  scale: number
  locked: boolean
  x: number
  y: number
}

let floatingIdCounter = 0

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  detailImageId: null,
  floatingWindows: [],
  settingsOpen: false,

  toggleSidebar: () =>
    set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  openDetail: (imageId) => set({ detailImageId: imageId }),

  closeDetail: () => set({ detailImageId: null }),

  addFloatingWindow: (imageId) =>
    set((state) => ({
      floatingWindows: [
        ...state.floatingWindows,
        {
          id: `float-${++floatingIdCounter}`,
          imageId,
          opacity: 0.8,
          scale: 1,
          locked: false,
          x: 100,
          y: 100,
        },
      ],
    })),

  removeFloatingWindow: (windowId) =>
    set((state) => ({
      floatingWindows: state.floatingWindows.filter((w) => w.id !== windowId),
    })),

  toggleSettings: () =>
    set((s) => ({ settingsOpen: !s.settingsOpen })),
}))
