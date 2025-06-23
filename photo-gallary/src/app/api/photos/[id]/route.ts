import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/photos/[id] - Get a specific photo
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const idNum = parseInt(id)

    if (isNaN(idNum)) {
      return NextResponse.json(
        { error: '不正な写真IDです' },
        { status: 400 }
      )
    }

    const photo = await prisma.photo.findUnique({
      where: { id: idNum },
    })

    if (!photo) {
      return NextResponse.json(
        { error: '写真が見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json(photo)
  } catch (error) {
    console.error('Error fetching photo:', error)
    return NextResponse.json(
      { error: '写真の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// PUT /api/photos/[id] - Update a photo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const idNum = parseInt(id)

    if (isNaN(idNum)) {
      return NextResponse.json(
        { error: '不正な写真IDです' },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const folder = formData.get('folder') as string
    const file = formData.get('file') as File | null

    if (!title && !description && !folder && !file) {
      return NextResponse.json(
        { error: '更新するフィールドがありません' },
        { status: 400 }
      )
    }

    // Check if photo exists
    const existingPhoto = await prisma.photo.findUnique({
      where: { id: idNum },
    })

    if (!existingPhoto) {
      return NextResponse.json(
        { error: '写真が見つかりません' },
        { status: 404 }
      )
    }

    let url = existingPhoto.url

    // If a new file is uploaded, update it in Minio
    if (file) {
      // Import here to avoid issues with server components
      const { uploadFile, deleteFile } = await import('@/lib/minio')

      // Extract the file path from the existing URL
      const urlParts = existingPhoto.url.split('/');
      const bucketIndex = urlParts.findIndex(part => part === process.env.MINIO_BUCKET || part === 'photos');
      const oldFilePath = bucketIndex >= 0 ? urlParts.slice(bucketIndex + 1).join('/') : urlParts[urlParts.length - 1];

      // Generate a new unique filename
      const fileExt = file.name.split('.').pop()
      const newFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Upload new file with folder information
      try {
        url = await uploadFile(buffer, newFileName, file.type, folder || existingPhoto.folder)
      } catch (uploadError: unknown) {
        console.error('Error uploading new file to Minio:', uploadError)

        // Provide more detailed error information to the client
        const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown error';
        const errorCode = getErrorCode(uploadError);

        return NextResponse.json(
          { 
            error: 'ファイルのアップロードに失敗しました', 
            details: errorMessage,
            code: errorCode 
          },
          { status: 500 }
        )
      }

      // Delete old file if it exists
      if (oldFilePath) {
        try {
          await deleteFile(oldFilePath)
        } catch (error: unknown) {
          // Log detailed error information but continue with the update
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          const errorCode = getErrorCode(error);
          console.error(`Error deleting old file: [${errorCode}] ${errorMessage}`, error)
          // Continue even if delete fails
        }
      }
    }

    // Update photo in database
    const updatedPhoto = await prisma.photo.update({
      where: { id: idNum },
      data: {
        title: title || existingPhoto.title,
        description: description || existingPhoto.description,
        folder: folder !== undefined ? folder : existingPhoto.folder,
        url,
      },
    })

    return NextResponse.json(updatedPhoto)
  } catch (error) {
    console.error('Error updating photo:', error)
    return NextResponse.json(
      { error: '写真の更新に失敗しました' },
      { status: 500 }
    )
  }
}

// DELETE /api/photos/[id] - Delete a photo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const idNum = parseInt(id)

    if (isNaN(idNum)) {
      return NextResponse.json(
        { error: '不正な写真IDです' },
        { status: 400 }
      )
    }

    // Get the photo to delete
    const photo = await prisma.photo.findUnique({
      where: { id: idNum },
    })

    if (!photo) {
      return NextResponse.json(
        { error: '写真が見つかりません' },
        { status: 404 }
      )
    }

    // Delete the file from Minio
    const { deleteFile } = await import('@/lib/minio')

    // Extract the file path from the URL
    // The URL format is: ${MINIO_PUBLIC_URL}/${PHOTOS_BUCKET}/${filePath}
    // We need to extract the filePath part which may include folder/filename
    const urlParts = photo.url.split('/');
    const bucketIndex = urlParts.findIndex(part => part === process.env.MINIO_BUCKET || part === 'photos');
    const filePath = bucketIndex >= 0 ? urlParts.slice(bucketIndex + 1).join('/') : urlParts[urlParts.length - 1];

    if (filePath) {
      try {
        await deleteFile(filePath)
      } catch (error: unknown) {
        // Log detailed error information but continue with the database deletion
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorCode = getErrorCode(error);
        console.error(`Error deleting file from Minio: [${errorCode}] ${errorMessage}`, error)
        // Continue even if Minio delete fails
      }
    }

    // Delete from database
    await prisma.photo.delete({
      where: { id: idNum },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting photo:', error)
    return NextResponse.json(
      { error: '写真の削除に失敗しました' },
      { status: 500 }
    )
  }
}

// Utility type guard for error objects
function getErrorCode(err: unknown): string {
  if (typeof err === 'object' && err && 'code' in err && typeof (err as { code?: unknown }).code === 'string') {
    return (err as { code: string }).code
  }
  return 'UNKNOWN'
}
