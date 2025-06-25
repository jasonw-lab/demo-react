const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testMultipleUpload() {
  try {
    console.log('Testing multiple photo upload...');

    // Create a FormData instance
    const form = new FormData();

    // Add some test files
    // For this test, we'll use the same file twice with different names
    const testImagePath = path.join(__dirname, 'public', 'placeholder.jpg');

    if (!fs.existsSync(testImagePath)) {
      console.error(`Test file not found: ${testImagePath}`);
      console.log('Please make sure you have a placeholder.jpg file in the public directory');
      return;
    }

    // Read the file
    const fileBuffer = fs.readFileSync(testImagePath);

    // Add the same file twice with different names
    form.append('file', fileBuffer, { filename: 'test-image-1.jpg', contentType: 'image/jpeg' });
    form.append('file', fileBuffer, { filename: 'test-image-2.jpg', contentType: 'image/jpeg' });

    // Test case 1: No title, no description
    console.log('Test case 1: No title, no description (should use filenames as titles)');

    // Make the API call
    const response1 = await fetch('http://localhost:3000/photo-gallary/api/photos', {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
    });

    if (!response1.ok) {
      const error = await response1.json();
      throw new Error(`API error: ${error.error || 'Unknown error'}`);
    }

    const result1 = await response1.json();
    console.log('Result:', result1);
    console.log(`Successfully uploaded ${result1.length} photos`);

    // Test case 2: With title, empty description
    console.log('\nTest case 2: With title, empty description');
    const form2 = new FormData();
    form2.append('title', 'Test Title');
    form2.append('description', '');
    form2.append('file', fileBuffer, { filename: 'test-image-3.jpg', contentType: 'image/jpeg' });

    const response2 = await fetch('http://localhost:3000/photo-gallary/api/photos', {
      method: 'POST',
      body: form2,
      headers: form2.getHeaders(),
    });

    if (!response2.ok) {
      const error = await response2.json();
      throw new Error(`API error: ${error.error || 'Unknown error'}`);
    }

    const result2 = await response2.json();
    console.log('Result:', result2);
    console.log(`Successfully uploaded ${result2.length} photos`);

    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testMultipleUpload();
