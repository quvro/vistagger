import { useCallback } from 'react'
import { useImageStore } from '../stores/imageStore'
import { useTagStore } from '../stores/tagStore'
import type { ImageItem, AITagSuggestion } from '../types'
import * as api from '../api/tauri'

export function useImages() {
  const { images, setImages, addImage, removeImage } = useImageStore()
  const { setImageTags } = useTagStore()

  const loadImages = useCallback(async () => {
    try {
      const result = await api.getImages()
      setImages(result)
    } catch {
      // Tauri not available, use empty state
    }
  }, [setImages])

  const importImages = useCallback(async () => {
    try {
      const newImages = await api.importImages()
      newImages.forEach((img) => addImage(img))
      return newImages
    } catch {
      return []
    }
  }, [addImage])

  const handleDeleteImage = useCallback(async (imageId: string) => {
    try {
      await api.deleteImage(imageId)
      removeImage(imageId)
    } catch {
      removeImage(imageId)
    }
  }, [removeImage])

  const analyzeImage = useCallback(async (imageId: string): Promise<AITagSuggestion[]> => {
    try {
      return await api.analyzeImageLocal(imageId)
    } catch {
      // Try cloud if local fails
      try {
        return await api.analyzeImageCloud(imageId)
      } catch {
        return []
      }
    }
  }, [])

  return {
    images,
    loadImages,
    importImages,
    deleteImage: handleDeleteImage,
    analyzeImage,
  }
}
