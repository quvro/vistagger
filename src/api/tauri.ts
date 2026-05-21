// Tauri API wrapper
import type { ImageItem, Dimension, Attribute, ImageAttribute, AIStructuredResult, Settings } from '../types'

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
  GET_DIMENSIONS: 'get_dimensions',
  CREATE_DIMENSION: 'create_dimension',
  UPDATE_DIMENSION: 'update_dimension',
  DELETE_DIMENSION: 'delete_dimension',
  GET_ATTRIBUTES: 'get_attributes',
  CREATE_ATTRIBUTE: 'create_attribute',
  DELETE_ATTRIBUTE: 'delete_attribute',
  SET_IMAGE_ATTRIBUTES: 'set_image_attributes',
  GET_IMAGE_ATTRIBUTES: 'get_image_attributes',
  SET_PRIMARY_ATTRIBUTES: 'set_primary_attributes',
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
  console.warn(`[Mock] Tauri not available: ${cmd}`)
  throw new Error(`Tauri not available. Command "${cmd}" requires desktop runtime.`)
}

// ==================== Images ====================

export async function importImages(): Promise<ImageItem[]> {
  return invoke<ImageItem[]>(CMD.IMPORT_IMAGES)
}

export async function getImages(): Promise<ImageItem[]> {
  return invoke<ImageItem[]>(CMD.GET_IMAGES)
}

export async function deleteImage(imageId: string): Promise<void> {
  return invoke(CMD.DELETE_IMAGE, { imageId })
}

// ==================== Dimensions ====================

export async function getDimensions(): Promise<Dimension[]> {
  return invoke<Dimension[]>(CMD.GET_DIMENSIONS)
}

export async function createDimension(name: string, color?: string): Promise<Dimension> {
  return invoke<Dimension>(CMD.CREATE_DIMENSION, { name, color })
}

export async function updateDimension(dimId: string, data: { name?: string; color?: string }): Promise<void> {
  return invoke(CMD.UPDATE_DIMENSION, { dimensionId: dimId, ...data })
}

export async function deleteDimension(dimId: string): Promise<void> {
  return invoke(CMD.DELETE_DIMENSION, { dimensionId: dimId })
}

// ==================== Attributes ====================

export async function getAttributes(): Promise<Attribute[]> {
  return invoke<Attribute[]>(CMD.GET_ATTRIBUTES)
}

export async function createAttribute(dimensionId: string, name: string): Promise<Attribute> {
  return invoke<Attribute>(CMD.CREATE_ATTRIBUTE, { dimensionId, name })
}

export async function deleteAttribute(attrId: string): Promise<void> {
  return invoke(CMD.DELETE_ATTRIBUTE, { attributeId: attrId })
}

// ==================== Image-Attributes ====================

export async function setImageAttributes(imageId: string, attrIds: string[]): Promise<ImageAttribute[]> {
  return invoke<ImageAttribute[]>(CMD.SET_IMAGE_ATTRIBUTES, { imageId, attributeIds: attrIds })
}

export async function getImageAttributes(imageId: string): Promise<ImageAttribute[]> {
  return invoke<ImageAttribute[]>(CMD.GET_IMAGE_ATTRIBUTES, { imageId })
}

export async function setPrimaryAttributes(imageId: string, attrIds: string[]): Promise<void> {
  return invoke(CMD.SET_PRIMARY_ATTRIBUTES, { imageId, attributeIds: attrIds })
}

// ==================== AI ====================

export async function analyzeImageLocal(imageId: string): Promise<AIStructuredResult> {
  return invoke<AIStructuredResult>(CMD.ANALYZE_IMAGE, { imageId })
}

export async function analyzeImageCloud(imageId: string): Promise<AIStructuredResult> {
  return invoke<AIStructuredResult>(CMD.ANALYZE_IMAGE_CLOUD, { imageId })
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
