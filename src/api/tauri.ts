// Tauri API wrapper - falls back to mock when running in browser
import type { ImageItem, Tag, Category, ImageTag, AITagSuggestion, SimilarTagGroup, Settings } from '../types'

let isTauri = false
try {
  isTauri = !!(window as any).__TAURI_INTERNALS__
} catch {
  isTauri = false
}

const CMD = {
  IMPORT_IMAGES: 'import_images',
  GET_IMAGES: 'get_images',
  DELETE_IMAGE: 'delete_image',
  GET_CATEGORIES: 'get_categories',
  CREATE_CATEGORY: 'create_category',
  UPDATE_CATEGORY: 'update_category',
  DELETE_CATEGORY: 'delete_category',
  GET_TAGS: 'get_tags',
  CREATE_TAG: 'create_tag',
  DELETE_TAG: 'delete_tag',
  SET_IMAGE_TAGS: 'set_image_tags',
  GET_TAG_SIMILARITIES: 'get_tag_similarities',
  MERGE_SIMILAR_TAGS: 'merge_similar_tags',
  ANALYZE_IMAGE: 'analyze_image',
  ANALYZE_IMAGE_CLOUD: 'analyze_image_cloud',
  CAPTURE_SCREENSHOT: 'capture_screenshot',
  CREATE_FLOATING_WINDOW: 'create_floating_window',
  CLOSE_FLOATING_WINDOW: 'close_floating_window',
  GET_SETTINGS: 'get_settings',
  SAVE_SETTINGS: 'save_settings',
  OPEN_FOLDER_DIALOG: 'open_folder_dialog',
}

async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  if (isTauri) {
    const { invoke: tauriInvoke } = await import('@tauri-apps/api/core')
    return tauriInvoke<T>(cmd, args)
  }
  console.warn(`[Mock] Tauri command not available: ${cmd}`, args)
  throw new Error(`Tauri not available. Command "${cmd}" requires desktop runtime.`)
}

// ==================== Images ====================

export async function importImages(filePaths?: string[]): Promise<ImageItem[]> {
  return invoke<ImageItem[]>(CMD.IMPORT_IMAGES, { filePaths })
}

export async function getImages(): Promise<ImageItem[]> {
  return invoke<ImageItem[]>(CMD.GET_IMAGES)
}

export async function deleteImage(imageId: string): Promise<void> {
  return invoke(CMD.DELETE_IMAGE, { imageId })
}

// ==================== Categories ====================

export async function getCategories(): Promise<Category[]> {
  return invoke<Category[]>(CMD.GET_CATEGORIES)
}

export async function createCategory(name: string, color?: string): Promise<Category> {
  return invoke<Category>(CMD.CREATE_CATEGORY, { name, color })
}

export async function updateCategory(categoryId: string, data: { name?: string; color?: string }): Promise<void> {
  return invoke(CMD.UPDATE_CATEGORY, { categoryId, ...data })
}

export async function deleteCategory(categoryId: string): Promise<void> {
  return invoke(CMD.DELETE_CATEGORY, { categoryId })
}

// ==================== Tags ====================

export async function getTags(): Promise<Tag[]> {
  return invoke<Tag[]>(CMD.GET_TAGS)
}

export async function createTag(name: string, categoryId: string, color?: string): Promise<Tag> {
  return invoke<Tag>(CMD.CREATE_TAG, { name, categoryId, color })
}

export async function deleteTag(tagId: string): Promise<void> {
  return invoke(CMD.DELETE_TAG, { tagId })
}

export async function setImageTags(imageId: string, tagIds: string[]): Promise<ImageTag[]> {
  return invoke<ImageTag[]>(CMD.SET_IMAGE_TAGS, { imageId, tagIds })
}

// ==================== Tag Similarities ====================

export async function getTagSimilarities(): Promise<SimilarTagGroup[]> {
  return invoke<SimilarTagGroup[]>(CMD.GET_TAG_SIMILARITIES)
}

export async function mergeSimilarTags(tagAId: string, tagBId: string, targetName: string): Promise<void> {
  return invoke(CMD.MERGE_SIMILAR_TAGS, { tagAId, tagBId, targetName })
}

// ==================== AI ====================

export async function analyzeImageLocal(imageId: string): Promise<AITagSuggestion[]> {
  return invoke<AITagSuggestion[]>(CMD.ANALYZE_IMAGE, { imageId })
}

export async function analyzeImageCloud(imageId: string): Promise<AITagSuggestion[]> {
  return invoke<AITagSuggestion[]>(CMD.ANALYZE_IMAGE_CLOUD, { imageId })
}

// ==================== Screenshot ====================

export async function captureScreenshot(): Promise<ImageItem> {
  return invoke<ImageItem>(CMD.CAPTURE_SCREENSHOT)
}

// ==================== Floating Window ====================

export async function createFloatingWindow(imageId: string, opts?: {
  opacity?: number; scale?: number; x?: number; y?: number
}): Promise<string> {
  return invoke<string>(CMD.CREATE_FLOATING_WINDOW, { imageId, ...opts })
}

export async function closeFloatingWindow(windowId: string): Promise<void> {
  return invoke(CMD.CLOSE_FLOATING_WINDOW, { windowId })
}

// ==================== Settings ====================

export async function getSettings(): Promise<Settings> {
  return invoke<Settings>(CMD.GET_SETTINGS)
}

export async function saveSettings(settings: Settings): Promise<void> {
  return invoke(CMD.SAVE_SETTINGS, { settings })
}

export async function openFolderDialog(): Promise<string | null> {
  return invoke<string | null>(CMD.OPEN_FOLDER_DIALOG)
}

export { isTauri }
