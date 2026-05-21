import { useCallback } from 'react'
import { useAttributeStore } from '../stores/attributeStore'
import type { Dimension, Attribute } from '../types'
import * as api from '../api/tauri'

export function useAttributes() {
  const {
    dimensions, attributes, imageAttributes,
    setDimensions, addDimension, removeDimension,
    setAttributes, addAttribute, removeAttribute,
    setImageAttributes,
  } = useAttributeStore()

  const loadDimensions = useCallback(async () => {
    try { setDimensions(await api.getDimensions()) } catch {}
  }, [setDimensions])

  const loadAttributes = useCallback(async () => {
    try { setAttributes(await api.getAttributes()) } catch {}
  }, [setAttributes])

  const createDimension = useCallback(async (name: string, color?: string): Promise<Dimension | null> => {
    try {
      const dim = await api.createDimension(name, color)
      addDimension(dim)
      return dim
    } catch { return null }
  }, [addDimension])

  const removeDimensionCmd = useCallback(async (id: string) => {
    try { await api.deleteDimension(id) } catch {}
    removeDimension(id)
  }, [removeDimension])

  const createAttribute = useCallback(async (
    dimensionId: string, name: string
  ): Promise<Attribute | null> => {
    try {
      const attr = await api.createAttribute(dimensionId, name)
      addAttribute(attr)
      return attr
    } catch { return null }
  }, [addAttribute])

  const deleteAttribute = useCallback(async (id: string) => {
    try { await api.deleteAttribute(id) } catch {}
    removeAttribute(id)
  }, [removeAttribute])

  const updateImageAttributes = useCallback(async (imageId: string, attrIds: string[]) => {
    try {
      const result = await api.setImageAttributes(imageId, attrIds)
      setImageAttributes(imageId, result)
    } catch {
      setImageAttributes(imageId, attrIds.map((attributeId) => ({
        imageId, attributeId, isAuto: false, isPrimary: false,
      })))
    }
  }, [setImageAttributes])

  const loadImageAttributes = useCallback(async (imageId: string) => {
    try {
      const result = await api.getImageAttributes(imageId)
      setImageAttributes(imageId, result)
    } catch {}
  }, [setImageAttributes])

  return {
    dimensions, attributes, imageAttributes,
    loadDimensions, loadAttributes,
    createDimension, removeDimension: removeDimensionCmd,
    createAttribute, deleteAttribute,
    updateImageAttributes, loadImageAttributes,
  }
}
