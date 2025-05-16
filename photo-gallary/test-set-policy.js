// Script to manually trigger the ensureBucketExists function to apply the bucket policy

// Import the minio module
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Dynamic import for ESM modules
async function main() {
  try {
    // Use dynamic import for ESM modules
    const { ensureBucketExists } = await import('./src/lib/minio.ts');
    
    console.log('Setting bucket policy...');
    await ensureBucketExists();
    console.log('Bucket policy set successfully!');
    console.log('Try accessing the photo again with test-minio-access.js');
  } catch (error) {
    console.error('Error setting bucket policy:', error);
  }
}

main();