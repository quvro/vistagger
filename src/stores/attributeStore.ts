import { create } from 'zustand'
import type { Dimension, Attribute, ImageAttribute } from '../types'

interface AttributeStore {
  dimensions: Dimension[]
  attributes: Attribute[]
  imageAttributes: Record<string, ImageAttribute[]>
  selectedAttributeIds: string[]

  // Dimensions
  setDimensions: (dims: Dimension[]) => void
  addDimension: (dim: Dimension) => void
  removeDimension: (id: string) => void

  // Attributes
  setAttributes: (attrs: Attribute[]) => void
  addAttribute: (attr: Attribute) => void
  removeAttribute: (id: string) => void
  // Image attributes
  setImageAttributes: (imageId: string, attrs: ImageAttribute[]) => void

  // Filter
  toggleAttributeFilter: (attrId: string) => void
  clearFilters: () => void
}

export const useAttributeStore = create<AttributeStore>((set, get) => ({
  dimensions: [],
  attributes: [],
  imageAttributes: {},
  selectedAttributeIds: [],

  // Dimensions
  setDimensions: (dimensions) => set({ dimensions }),
  addDimension: (dim) =>
    set((s) => ({ dimensions: [...s.dimensions, dim] })),
  removeDimension: (id) =>
    set((s) => {
      const removedAttrIds = new Set(
        s.attributes.filter((a) => a.dimensionId === id).map((a) => a.id)
      )
      return {
        dimensions: s.dimensions.filter((d) => d.id !== id),
        attributes: s.attributes.filter((a) => a.dimensionId !== id),
        imageAttributes: Object.fromEntries(
          Object.entries(s.imageAttributes).map(([imgId, imgAttrs]) => [
            imgId,
            imgAttrs.filter((ia) => !removedAttrIds.has(ia.attributeId)),
          ])
        ),
      }
    }),

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
  // Image attributes
  setImageAttributes: (imageId, attrs) =>
    set((s) => ({
      imageAttributes: { ...s.imageAttributes, [imageId]: attrs },
    })),

  // Filter
  toggleAttributeFilter: (attrId) =>
    set((s) => ({
      selectedAttributeIds: s.selectedAttributeIds.includes(attrId)
        ? s.selectedAttributeIds.filter((id) => id !== attrId)
        : [...s.selectedAttributeIds, attrId],
    })),
  clearFilters: () => set({ selectedAttributeIds: [] }),
}))
