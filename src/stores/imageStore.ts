import { create } from 'zustand'
import type { ImageItem } from '../types'

interface ImageStore {
  images: ImageItem[]
  selectedIds: Set<string>
  searchQuery: string

  setImages: (images: ImageItem[]) => void
  addImage: (image: ImageItem) => void
  removeImage: (id: string) => void
  selectImage: (id: string, multi?: boolean) => void
  clearSelection: () => void
  setSearchQuery: (query: string) => void
}

export const useImageStore = create<ImageStore>((set) => ({
  images: [],
  selectedIds: new Set(),
  searchQuery: '',

  setImages: (images) => set({ images }),

  addImage: (image) =>
    set((state) => ({ images: [image, ...state.images] })),

  removeImage: (id) =>
    set((state) => ({
      images: state.images.filter((img) => img.id !== id),
      selectedIds: new Set([...state.selectedIds].filter((sid) => sid !== id)),
    })),

  selectImage: (id, multi = false) =>
    set((state) => {
      const next = new Set(multi ? state.selectedIds : [])
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return { selectedIds: next }
    }),

  clearSelection: () => set({ selectedIds: new Set() }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),
}))
