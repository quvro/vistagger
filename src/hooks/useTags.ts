import { useCallback } from 'react'
import { useTagStore } from '../stores/tagStore'
import type { Tag, Category, SimilarTagGroup } from '../types'
import * as api from '../api/tauri'

export function useTags() {
  const {
    tags, categories, similarGroups,
    setTags, addTag, removeTag,
    setCategories, addCategory, removeCategory,
    setImageTags, setSimilarGroups,
  } = useTagStore()

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      const result = await api.getCategories()
      setCategories(result)
    } catch { /* Tauri not available */ }
  }, [setCategories])

  // Load tags
  const loadTags = useCallback(async () => {
    try {
      const result = await api.getTags()
      setTags(result)
    } catch { /* Tauri not available */ }
  }, [setTags])

  // Load similar tag groups
  const loadSimilarGroups = useCallback(async () => {
    try {
      const result = await api.getTagSimilarities()
      setSimilarGroups(result)
    } catch { /* Tauri not available */ }
  }, [setSimilarGroups])

  // Create category
  const createCategory = useCallback(async (name: string, color?: string): Promise<Category | null> => {
    try {
      const cat = await api.createCategory(name, color)
      addCategory(cat)
      return cat
    } catch { return null }
  }, [addCategory])

  // Create tag
  const createTag = useCallback(async (
    name: string,
    categoryId: string,
    color?: string
  ): Promise<Tag | null> => {
    try {
      const tag = await api.createTag(name, categoryId, color)
      addTag(tag)
      return tag
    } catch { return null }
  }, [addTag])

  // Delete tag
  const deleteTag = useCallback(async (tagId: string) => {
    try { await api.deleteTag(tagId) } catch { /* ignore */ }
    removeTag(tagId)
  }, [removeTag])

  // Update image tags
  const updateImageTags = useCallback(async (imageId: string, tagIds: string[]) => {
    try {
      const result = await api.setImageTags(imageId, tagIds)
      setImageTags(imageId, result)
    } catch {
      setImageTags(imageId, tagIds.map((tagId) => ({
        imageId, tagId, isAuto: false,
      })))
    }
  }, [setImageTags])

  // Merge similar tags
  const mergeSimilarTags = useCallback(async (
    groupIndex: number,
    targetName: string
  ) => {
    const group = similarGroups[groupIndex]
    if (!group || group.tags.length < 2) return
    const tagA = group.tags[0]
    const tagB = group.tags[1]
    try {
      await api.mergeSimilarTags(tagA.id, tagB.id, targetName)
    } catch { /* ignore */ }
    useTagStore.getState().mergeSimilarTags(groupIndex, targetName)
  }, [similarGroups])

  return {
    tags, categories, similarGroups,
    loadTags, loadCategories, loadSimilarGroups,
    createTag, deleteTag, createCategory,
    updateImageTags, mergeSimilarTags,
  }
}
