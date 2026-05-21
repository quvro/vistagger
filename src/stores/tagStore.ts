import { create } from 'zustand'
import type { Tag, Category, ImageTag, SimilarTagGroup } from '../types'

interface TagStore {
  tags: Tag[]
  categories: Category[]
  imageTags: Record<string, ImageTag[]>
  similarGroups: SimilarTagGroup[]
  loading: boolean

  // Categories
  setCategories: (categories: Category[]) => void
  addCategory: (category: Category) => void
  updateCategory: (id: string, data: Partial<Category>) => void
  removeCategory: (id: string) => void

  // Tags
  setTags: (tags: Tag[]) => void
  addTag: (tag: Tag) => void
  removeTag: (id: string) => void
  getTagsByCategory: (categoryId: string) => Tag[]

  // Image-Tag relations
  setImageTags: (imageId: string, tags: ImageTag[]) => void
  addImageTag: (imageId: string, tag: ImageTag) => void
  removeImageTag: (imageId: string, tagId: string) => void
  getImageTagIds: (imageId: string) => string[]

  // Similar tag groups
  setSimilarGroups: (groups: SimilarTagGroup[]) => void
  mergeSimilarTags: (groupIndex: number, targetName: string) => void
}

export const useTagStore = create<TagStore>((set, get) => ({
  tags: [],
  categories: [],
  imageTags: {},
  similarGroups: [],
  loading: false,

  // ==================== Categories ====================

  setCategories: (categories) => set({ categories }),

  addCategory: (category) =>
    set((state) => ({ categories: [...state.categories, category] })),

  updateCategory: (id, data) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, ...data } : c
      ),
    })),

  removeCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
      // Move tags in this category to default category
      tags: state.tags.map((t) =>
        t.categoryId === id
          ? { ...t, categoryId: state.categories[0]?.id || 'default' }
          : t
      ),
    })),

  // ==================== Tags ====================

  setTags: (tags) => set({ tags }),

  addTag: (tag) => set((state) => ({ tags: [...state.tags, tag] })),

  removeTag: (id) =>
    set((state) => ({
      tags: state.tags.filter((t) => t.id !== id),
      imageTags: Object.fromEntries(
        Object.entries(state.imageTags).map(([imgId, imgTags]) => [
          imgId,
          imgTags.filter((it) => it.tagId !== id),
        ])
      ),
    })),

  getTagsByCategory: (categoryId) =>
    get().tags.filter((t) => t.categoryId === categoryId),

  // ==================== Image-Tag relations ====================

  setImageTags: (imageId, tags) =>
    set((state) => ({
      imageTags: { ...state.imageTags, [imageId]: tags },
    })),

  addImageTag: (imageId, tag) =>
    set((state) => {
      const current = state.imageTags[imageId] || []
      if (current.some((t) => t.tagId === tag.tagId)) return state
      return {
        imageTags: { ...state.imageTags, [imageId]: [...current, tag] },
      }
    }),

  removeImageTag: (imageId, tagId) =>
    set((state) => {
      const current = state.imageTags[imageId] || []
      return {
        imageTags: {
          ...state.imageTags,
          [imageId]: current.filter((t) => t.tagId !== tagId),
        },
      }
    }),

  getImageTagIds: (imageId) =>
    (get().imageTags[imageId] || []).map((it) => it.tagId),

  // ==================== Similar tag groups ====================

  setSimilarGroups: (groups) => set({ similarGroups: groups }),

  mergeSimilarTags: (groupIndex, targetName) =>
    set((state) => {
      const group = state.similarGroups[groupIndex]
      if (!group) return state

      const targetId = group.tags[0]?.id
      if (!targetId) return state

      const mergedIds = new Set(group.tags.map((t) => t.id))
      const newTags = state.tags.map((t) =>
        mergedIds.has(t.id) ? { ...t, name: targetName } : t
      )

      return {
        tags: newTags,
        similarGroups: state.similarGroups.filter((_, i) => i !== groupIndex),
      }
    }),
}))
