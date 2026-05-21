import { create } from 'zustand'
import type { Dimension, Attribute, ImageAttribute } from '../types'

interface AttributeStore {
  dimensions: Dimension[]
  attributes: Attribute[]
  imageAttributes: Record<string, ImageAttribute[]>
  selectedDimensionIds: string[]
  selectedAttributeIds: string[]

  // Dimensions
  setDimensions: (dims: Dimension[]) => void
  addDimension: (dim: Dimension) => void
  removeDimension: (id: string) => void

  // Attributes
  setAttributes: (attrs: Attribute[]) => void
  addAttribute: (attr: Attribute) => void
  removeAttribute: (id: string) => void
  getAttributesByDimension: (dimId: string) => Attribute[]

  // Image attributes
  setImageAttributes: (imageId: string, attrs: ImageAttribute[]) => void
  getImageAttributeIds: (imageId: string) => string[]

  // Filter
  toggleDimensionFilter: (dimId: string) => void
  toggleAttributeFilter: (attrId: string) => void
  clearFilters: () => void
}

export const useAttributeStore = create<AttributeStore>((set, get) => ({
  dimensions: [],
  attributes: [],
  imageAttributes: {},
  selectedDimensionIds: [],
  selectedAttributeIds: [],

  // Dimensions
  setDimensions: (dimensions) => set({ dimensions }),
  addDimension: (dim) =>
    set((s) => ({ dimensions: [...s.dimensions, dim] })),
  removeDimension: (id) =>
    set((s) => ({
      dimensions: s.dimensions.filter((d) => d.id !== id),
      attributes: s.attributes.filter((a) => a.dimensionId !== id),
    })),

  // Attributes
  setAttributes: (attributes) => set({ attributes }),
  addAttribute: (attr) =>
    set((s) => ({ attributes: [...s.attributes, attr] })),
  removeAttribute: (id) =>
    set((s) => ({
      attributes: s.attributes.filter((a) => a.id !== id),
      imageAttributes: Object.fromEntries(
        Object.entries(s.imageAttributes).map(([imgId, imgAttrs]) => [
          imgId,
          imgAttrs.filter((ia) => ia.attributeId !== id),
        ])
      ),
    })),
  getAttributesByDimension: (dimId) =>
    get().attributes.filter((a) => a.dimensionId === dimId),

  // Image attributes
  setImageAttributes: (imageId, attrs) =>
    set((s) => ({
      imageAttributes: { ...s.imageAttributes, [imageId]: attrs },
    })),
  getImageAttributeIds: (imageId) =>
    (get().imageAttributes[imageId] || []).map((ia) => ia.attributeId),

  // Filter
  toggleDimensionFilter: (dimId) =>
    set((s) => ({
      selectedDimensionIds: s.selectedDimensionIds.includes(dimId)
        ? s.selectedDimensionIds.filter((id) => id !== dimId)
        : [...s.selectedDimensionIds, dimId],
    })),
  toggleAttributeFilter: (attrId) =>
    set((s) => ({
      selectedAttributeIds: s.selectedAttributeIds.includes(attrId)
        ? s.selectedAttributeIds.filter((id) => id !== attrId)
        : [...s.selectedAttributeIds, attrId],
    })),
  clearFilters: () => set({ selectedDimensionIds: [], selectedAttributeIds: [] }),
}))
