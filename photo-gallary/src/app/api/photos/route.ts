import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-static'

// GET /api/photos - Get all photos or photos by folder
export async function GET(request: NextRequest) {
  try {
    console.log('=== API GET Request Start ===');
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder');
    const listFoldersOnly = searchParams.get('listFolders') === 'true';
    
    console.log('Request URL:', request.url);
    console.log('Search params:', Object.fromEntries(searchParams.entries()));
    console.log('API GET request - folder:', folder, 'listFoldersOnly:', listFoldersOnly);

    // If listFolders is true, return only the list of folders
    if (listFoldersOnly) {
      console.log('=== Processing listFolders request ===');
      // Import here to avoid issues with server components
      const { listFolders } = await import('@/lib/minio');

      try {
        console.log('Calling listFolders function...');
        const folders = await listFolders();
        console.log('Folders returned from listFolders:', folders);
        console.log('=== listFolders request completed ===');
        return NextResponse.json({ folders });
      } catch (error) {
        console.error('Error listing folders:', error);
        return NextResponse.json(
          { error: 'フォルダの取得に失敗しました' },
          { status: 500 }
        );
      }
    }

    console.log('=== Processing regular photos request ===');
    // Get photos, filtered by folder if specified
    try {
      // Try to use the folder field in the query
      const photos = await prisma.photo.findMany({
        where: folder ? {
          folder: folder
        } : undefined,
        orderBy: {
          createdAt: 'desc',
        },
      });
      console.log('Photos found:', photos.length);
      return NextResponse.json(photos);
    } catch (queryError) {
      // If the folder field is not recognized, fetch all photos and filter in memory
      console.log('Falling back to in-memory filtering due to Prisma error:', queryError instanceof Error ? queryError.message : String(queryError));

      const allPhotos = await prisma.photo.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Filter photos by folder if specified
      const filteredPhotos = folder 
        ? allPhotos.filter((photo: { folder: string | null }) => photo.folder === folder)
        : allPhotos;

      return NextResponse.json(filteredPhotos);
    }
  } catch (error) {
    console.error('=== API Error ===', error);
    // Include more detailed error information in the response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    return NextResponse.json(
      { 
        error: '写真の取得に失敗しました',
        details: errorMessage,
        stack: errorStack
      },
      { status: 500 }
    );
  }
}

// POST /api/photos - Create a new photo (supports multiple files)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Get form fields
    const title = formData.get('title') as string
    const description = formData.get('description') as string || ''
    const folder = formData.get('folder') as string || ''

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

      // Upload to Minio with folder information
      let fileUrl: string;
      try {
        fileUrl = await uploadFile(buffer, fileName, file.type, folder)
      } catch (uploadError: unknown) {
        console.error('Error uploading file to Minio:', uploadError)

        // Provide more detailed error information to the client
        const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown error';
        const errorCode = typeof uploadError === 'object' && uploadError && 'code' in uploadError && typeof (uploadError as { code?: unknown }).code === 'string' ? (uploadError as { code: string }).code : 'UNKNOWN';

        return NextResponse.json(
          { 
            error: 'ファイルのアップロードに失敗しました', 
            details: errorMessage,
            code: errorCode 
          },
          { status: 500 }
        )
      }

      // Save to database with folder information
      const photo = await prisma.photo.create({
        data: {
          title: photoTitle,
          description,
          url: fileUrl,
          folder,
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
