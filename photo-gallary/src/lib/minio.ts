import { Client } from 'minio'

// Create a Minio client with connection retry logic
const createMinioClient = () => {
  return new Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'admin',
    secretKey: process.env.MINIO_SECRET_KEY || 'admin',
    connectTimeout: 5000, // 5 seconds timeout
    pathStyle: true, // Use path style for better compatibility
  })
}

const minioClient = createMinioClient()

// Bucket name for storing photos
export const PHOTOS_BUCKET = process.env.MINIO_BUCKET || 'photos'

// Helper function to retry operations with exponential backoff
const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 500
): Promise<T> => {
  let lastError: unknown;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.warn(`Operation failed (attempt ${attempt}/${maxRetries}):`, error);

      if (attempt < maxRetries) {
        // Wait with exponential backoff before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }

  // If we've exhausted all retries, throw the last error
  throw lastError;
};

// Ensure the bucket exists
export const ensureBucketExists = async () => {
  try {
    // Check if bucket exists with retry
    const bucketExists = await retryOperation(async () => {
      return await minioClient.bucketExists(PHOTOS_BUCKET);
    });

    if (!bucketExists) {
      // Create bucket with retry
      await retryOperation(async () => {
        await minioClient.makeBucket(PHOTOS_BUCKET, process.env.MINIO_REGION || '');
      });
    }

    // Always set the bucket policy to ensure public read access
    // This is done regardless of whether the bucket was just created or already existed
    await retryOperation(async () => {
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: '*',
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${PHOTOS_BUCKET}/*`],
          },
        ],
      };
      await minioClient.setBucketPolicy(PHOTOS_BUCKET, JSON.stringify(policy));
    });
  } catch (error: unknown) {
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode = typeof error === 'object' && error && 'code' in error && typeof (error as { code?: unknown }).code === 'string' ? (error as { code: string }).code : 'UNKNOWN';

    console.error(`Failed to ensure bucket exists: [${errorCode}] ${errorMessage}`);

    // Rethrow with more context
    throw new Error(`Failed to ensure storage bucket exists: [${errorCode}] ${errorMessage}`);
  }
}

// Upload a file to Minio
export const uploadFile = async (
  file: Buffer,
  fileName: string,
  contentType: string,
  folder: string = ""
): Promise<string> => {
  try {
    // Try to ensure bucket exists with retry logic
    await retryOperation(async () => {
      await ensureBucketExists();
    });

    // Create object key with folder path if provided
    const objectKey = folder ? `${folder}/${fileName}` : fileName;

    // Try to upload file with retry logic
    await retryOperation(async () => {
      await minioClient.putObject(PHOTOS_BUCKET, objectKey, file, file.length, { 'Content-Type': contentType });
    });

    // Return the URL to the uploaded file
    return `${process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL || process.env.MINIO_PUBLIC_URL || `http://localhost:9000`}/${PHOTOS_BUCKET}/${encodeURIComponent(objectKey)}`;
  } catch (error: unknown) {
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode = typeof error === 'object' && error && 'code' in error && typeof (error as { code?: unknown }).code === 'string' ? (error as { code: string }).code : 'UNKNOWN';

    console.error(`Minio upload failed after retries: [${errorCode}] ${errorMessage}`);

    // Rethrow with more context
    throw new Error(`Failed to upload file to storage: [${errorCode}] ${errorMessage}`);
  }
}

// Delete a file from Minio
export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    // Try to delete file with retry logic
    await retryOperation(async () => {
      await minioClient.removeObject(PHOTOS_BUCKET, filePath);
    });
  } catch (error: unknown) {
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode = typeof error === 'object' && error && 'code' in error && typeof (error as { code?: unknown }).code === 'string' ? (error as { code: string }).code : 'UNKNOWN';

    console.error(`Minio delete failed after retries: [${errorCode}] ${errorMessage}`);

    // Rethrow with more context
    throw new Error(`Failed to delete file from storage: [${errorCode}] ${errorMessage}`);
  }
}

// List all folders in the bucket
export const listFolders = async (): Promise<string[]> => {
  try {
    console.log('Starting listFolders...');

    // Use retryOperation to handle potential connection issues
    return await retryOperation(async () => {
      // Ensure bucket exists before listing objects
      await ensureBucketExists();

      const folderSet = new Set<string>();

      // List all objects in the bucket
      const stream = minioClient.listObjects(PHOTOS_BUCKET, '', true);
      console.log('Stream created for bucket:', PHOTOS_BUCKET);

      // Set up error handling for the stream
      stream.on('error', (err) => {
        console.error('Error in listObjects stream:', err);
        throw err; // This will be caught by retryOperation
      });

      // Process each object
      for await (const item of stream) {
        // Extract folder path from object name
        const pathParts = item.name.split('/');
        if (pathParts.length > 1) {
          folderSet.add(pathParts[0]);
        }
      }

      // Convert set to array and sort
      const result = Array.from(folderSet).sort();
      console.log('Final folders list:', result);

      // Even if no folders are found, return an empty array rather than throwing an error
      return result;
    });
  } catch (error: unknown) {
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode = typeof error === 'object' && error && 'code' in error && typeof (error as { code?: unknown }).code === 'string' ? (error as { code: string }).code : 'UNKNOWN';

    console.error(`Failed to list folders: [${errorCode}] ${errorMessage}`);
    throw new Error(`Failed to list folders: [${errorCode}] ${errorMessage}`);
  }
}

export default minioClient
