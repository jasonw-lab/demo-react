// Service for interacting with the photo API

export type Photo = {
  id: number
  title: string
  description: string
  url: string
  createdAt: string
  updatedAt: string
  folder?: string
}

export type PhotoInput = {
  title: string
  description: string
  file?: File
  folder?: string
}

// Fetch all photos or photos in a specific folder
export async function getPhotos(folder?: string): Promise<Photo[]> {
  const url = folder 
    ? `/photo-gallary/api/photos?folder=${encodeURIComponent(folder)}`
    : '/photo-gallary/api/photos'

  const response = await fetch(url)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch photos')
  }

  return response.json()
}

// Fetch all available folders
export async function getFolders(): Promise<string[]> {
  const response = await fetch('/photo-gallary/api/photos?listFolders=true')

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch folders')
  }

  const data = await response.json()
  return data.folders || []
}

// Fetch a single photo by ID
export async function getPhoto(id: number): Promise<Photo> {
  const response = await fetch(`/photo-gallary/api/photos/${id}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch photo')
  }

  return response.json()
}

// Create a new photo
export async function createPhoto(photoData: PhotoInput): Promise<Photo> {
  const formData = new FormData()
  formData.append('title', photoData.title)
  formData.append('description', photoData.description)

  if (photoData.folder) {
    formData.append('folder', photoData.folder)
  }

  if (photoData.file) {
    formData.append('file', photoData.file)
  }

  const response = await fetch('/photo-gallary/api/photos', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create photo')
  }

  return response.json()
}

// Create multiple photos
export async function createMultiplePhotos(
  files: File[], 
  baseTitle: string, 
  baseDescription: string,
  folder: string = ""
): Promise<Photo[]> {
  // Create a single FormData object for all files
  const formData = new FormData()

  // Add the base title and description
  if (baseTitle) {
    formData.append('title', baseTitle)
  }

  formData.append('description', baseDescription)

  // Add folder information if provided
  if (folder) {
    formData.append('folder', folder)
  }

  // Add all files with the same field name
  files.forEach(file => {
    formData.append('file', file)
  })

  // Send a single request with all files
  const response = await fetch('/photo-gallary/api/photos', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create photos')
  }

  return response.json()
}

// Update an existing photo
export async function updatePhoto(id: number, photoData: PhotoInput): Promise<Photo> {
  const formData = new FormData()

  if (photoData.title) {
    formData.append('title', photoData.title)
  }

  if (photoData.description) {
    formData.append('description', photoData.description)
  }

  if (photoData.file) {
    formData.append('file', photoData.file)
  }

  const response = await fetch(`/photo-gallary/api/photos/${id}`, {
    method: 'PUT',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update photo')
  }

  return response.json()
}

// Delete a photo
export async function deletePhoto(id: number): Promise<void> {
  const response = await fetch(`/photo-gallary/api/photos/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete photo')
  }
}
