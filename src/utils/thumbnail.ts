// Thumbnail utility functions

export function getThumbnailPath(imagePath: string): string {
  // Tauri will generate thumbnails in a .thumbnails subfolder
  const lastSlash = imagePath.lastIndexOf('/')
  const dir = imagePath.substring(0, lastSlash)
  const filename = imagePath.substring(lastSlash + 1)
  return `${dir}/.thumbnails/${filename}`
}

export async function generateLocalThumbnail(
  file: File,
  maxSize: number = 300
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img

      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }
      }

      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}
