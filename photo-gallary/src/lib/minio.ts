import { Client } from 'minio'

// Create a Minio client with connection retry logic
const createMinioClient = () => {
  return new Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
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
  let lastError: any;
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
  } catch (error: any) {
    // Provide more detailed error information
    const errorMessage = error.message || 'Unknown error';
    const errorCode = error.code || 'UNKNOWN';

    console.error(`Failed to ensure bucket exists: [${errorCode}] ${errorMessage}`);

    // Rethrow with more context
    throw new Error(`Failed to ensure storage bucket exists: [${errorCode}] ${errorMessage}`);
  }
}

// Upload a file to Minio
export const uploadFile = async (
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> => {
  try {
    // Try to ensure bucket exists with retry logic
    await retryOperation(async () => {
      await ensureBucketExists();
    });

    // Try to upload file with retry logic
    await retryOperation(async () => {
      await minioClient.putObject(PHOTOS_BUCKET, fileName, file, {
        'Content-Type': contentType,
      });
    });

    // Return the URL to the uploaded file
    return `${process.env.MINIO_PUBLIC_URL || `http://localhost:9000`}/${PHOTOS_BUCKET}/${encodeURIComponent(fileName)}`;
  } catch (error: any) {
    // Provide more detailed error information
    const errorMessage = error.message || 'Unknown error';
    const errorCode = error.code || 'UNKNOWN';

    console.error(`Minio upload failed after retries: [${errorCode}] ${errorMessage}`);

    // Rethrow with more context
    throw new Error(`Failed to upload file to storage: [${errorCode}] ${errorMessage}`);
  }
}

// Delete a file from Minio
export const deleteFile = async (fileName: string): Promise<void> => {
  try {
    // Try to delete file with retry logic
    await retryOperation(async () => {
      await minioClient.removeObject(PHOTOS_BUCKET, fileName);
    });
  } catch (error: any) {
    // Provide more detailed error information
    const errorMessage = error.message || 'Unknown error';
    const errorCode = error.code || 'UNKNOWN';

    console.error(`Minio delete failed after retries: [${errorCode}] ${errorMessage}`);

    // Rethrow with more context
    throw new Error(`Failed to delete file from storage: [${errorCode}] ${errorMessage}`);
  }
}

export default minioClient
