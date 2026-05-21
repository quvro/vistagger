// ==================== Image ====================

export interface ImageItem {
  id: string
  filename: string
  originalPath?: string
  storedPath: string
  thumbnailPath?: string
  width?: number
  height?: number
  fileSize?: number
  format?: string
  sourceUrl?: string
  createdAt: string
  updatedAt: string
}

// ==================== Category ====================

export interface Category {
  id: string
  name: string
  color: string
  sortOrder: number
}

// ==================== Tag ====================

export interface Tag {
  id: string
  name: string
  categoryId: string
  color?: string
  createdAt?: string
}

export interface TagWithCategory extends Tag {
  categoryName: string
  categoryColor: string
}

// ==================== Image-Tag ====================

export interface ImageTag {
  imageId: string
  tagId: string
  confidence?: number
  isAuto: boolean
}

// ==================== AI ====================

export interface AITagSuggestion {
  tagName: string
  category: string
  confidence: number
}

export interface SimilarTagGroup {
  tags: Tag[]
  suggestedName: string
  reason: string
}

// ==================== Settings ====================

export interface Settings {
  libraryPath: string
  cloudApiKey?: string
  cloudApiType: 'openai' | 'claude' | null
  localModelEnabled: boolean
}
