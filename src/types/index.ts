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

// ==================== Dimension ====================

export interface Dimension {
  id: string
  name: string
  color: string
  sortOrder: number
}

// ==================== Attribute ====================

export interface Attribute {
  id: string
  dimensionId: string
  name: string
  createdAt?: string
}

// Attribute joined with its dimension info (for display)
export interface AttributeWithDimension extends Attribute {
  dimensionName: string
  dimensionColor: string
}

// ==================== Image-Attribute ====================

export interface ImageAttribute {
  imageId: string
  attributeId: string
  confidence?: number
  isAuto: boolean
  isPrimary: boolean
}

// ==================== AI ====================

export interface AIStructuredResult {
  attributes: Array<{
    dimension: string
    value: string
    confidence: number
  }>
}

// ==================== Settings ====================

export interface Settings {
  libraryPath: string
  cloudApiKey?: string
  cloudApiType: 'openai' | 'claude' | null
  localModelEnabled: boolean
}
