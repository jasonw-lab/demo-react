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

// POST /api/photos - Create a new photo
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Get form fields
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const file = formData.get('file') as File

    if (!title || !description || !file) {
      return NextResponse.json(
        { error: '必須フィールドが不足しています' },
        { status: 400 }
      )
    }

    // Import here to avoid issues with server components
    const { uploadFile } = await import('@/lib/minio')

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
        title,
        description,
        url: fileUrl,
      },
    })

    return NextResponse.json(photo, { status: 201 })
  } catch (error) {
    console.error('Error creating photo:', error)
    return NextResponse.json(
      { error: '写真の作成に失敗しました' },
      { status: 500 }
    )
  }
}
