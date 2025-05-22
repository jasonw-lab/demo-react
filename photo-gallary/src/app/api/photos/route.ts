import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/photos - Get all photos
export async function GET(request: NextRequest) {
  try {
    // Get all photos
    const photos = await prisma.photo.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(photos)
  } catch (error) {
    console.error('Error fetching photos:', error)
    return NextResponse.json(
      { error: '写真の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST /api/photos - Create a new photo (supports multiple files)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Get form fields
    const title = formData.get('title') as string
    const description = formData.get('description') as string || ''

    // Check if we have files
    const files: File[] = []

    // Handle multiple files with the same field name
    formData.getAll('file').forEach(item => {
      if (item instanceof File) {
        files.push(item)
      }
    })

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'ファイルが必要です' },
        { status: 400 }
      )
    }

    // Import here to avoid issues with server components
    const { uploadFile } = await import('@/lib/minio')

    // Process each file and create database entries
    const createdPhotos = []

    for (const file of files) {
      // Use filename as default title if not provided
      const photoTitle = title || file.name

      // Generate a unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Upload to Minio
      let fileUrl: string;
      try {
        fileUrl = await uploadFile(buffer, fileName, file.type)
      } catch (uploadError: any) {
        console.error('Error uploading file to Minio:', uploadError)

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

      // Save to database
      const photo = await prisma.photo.create({
        data: {
          title: photoTitle,
          description,
          url: fileUrl,
        },
      })

      createdPhotos.push(photo)
    }

    return NextResponse.json(createdPhotos, { status: 201 })
  } catch (error) {
    console.error('Error creating photo:', error)
    return NextResponse.json(
      { error: '写真の作成に失敗しました' },
      { status: 500 }
    )
  }
}
