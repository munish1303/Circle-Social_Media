import imageCompression from 'browser-image-compression'

export async function compressImage(file, options = {}) {
  const defaults = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1080,
    useWebWorker: true,
    fileType: 'image/webp',
  }
  return imageCompression(file, { ...defaults, ...options })
}

export function getVideoDuration(file) {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src)
      resolve(video.duration)
    }
    video.src = URL.createObjectURL(file)
  })
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export function isImage(file) {
  return file?.type?.startsWith('image/')
}

export function isVideo(file) {
  return file?.type?.startsWith('video/')
}
