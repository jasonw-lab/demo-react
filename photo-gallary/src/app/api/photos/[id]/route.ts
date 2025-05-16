import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/photos/[id] - Get a specific photo
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: '不正な写真IDです' },
        { status: 400 }
      )
    }

    const photo = await prisma.photo.findUnique({
      where: { id },
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
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: '不正な写真IDです' },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const file = formData.get('file') as File | null

    if (!title && !description && !file) {
      return NextResponse.json(
        { error: '更新するフィールドがありません' },
        { status: 400 }
      )
    }

    // Check if photo exists
    const existingPhoto = await prisma.photo.findUnique({
      where: { id },
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

      // Extract the filename from the existing URL
      const oldFileName = existingPhoto.url.split('/').pop()

      // Generate a new unique filename
      const fileExt = file.name.split('.').pop()
      const newFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Upload new file
      try {
        url = await uploadFile(buffer, newFileName, file.type)
      } catch (uploadError: any) {
        console.error('Error uploading new file to Minio:', uploadError)

        // Provide more detailed error information to the client
        const errorMessage = uploadError.message || 'Unknown error';
        const errorCode = uploadError.code || 'UNKNOWN';

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
      if (oldFileName) {
        try {
          await deleteFile(oldFileName)
        } catch (error: any) {
          // Log detailed error information but continue with the update
          const errorMessage = error.message || 'Unknown error';
          const errorCode = error.code || 'UNKNOWN';
          console.error(`Error deleting old file: [${errorCode}] ${errorMessage}`, error)
          // Continue even if delete fails
        }
      }
    }

    // Update photo in database
    const updatedPhoto = await prisma.photo.update({
      where: { id },
      data: {
        title: title || existingPhoto.title,
        description: description || existingPhoto.description,
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
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: '不正な写真IDです' },
        { status: 400 }
      )
    }

    // Get the photo to delete
    const photo = await prisma.photo.findUnique({
      where: { id },
    })

    if (!photo) {
      return NextResponse.json(
        { error: '写真が見つかりません' },
        { status: 404 }
      )
    }

    // Delete the file from Minio
    const { deleteFile } = await import('@/lib/minio')
    const fileName = photo.url.split('/').pop()

    if (fileName) {
      try {
        await deleteFile(fileName)
      } catch (error: any) {
        // Log detailed error information but continue with the database deletion
        const errorMessage = error.message || 'Unknown error';
        const errorCode = error.code || 'UNKNOWN';
        console.error(`Error deleting file from Minio: [${errorCode}] ${errorMessage}`, error)
        // Continue even if Minio delete fails
      }
    }

    // Delete from database
    await prisma.photo.delete({
      where: { id },
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
