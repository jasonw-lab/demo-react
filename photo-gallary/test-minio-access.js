const http = require('http');

const options = {
  hostname: 'localhost',
  port: 9000,
  path: '/photos/1747400206780-y1bmjvpr0e.jpg', // The path to the photo that was returning 403
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

  // For binary data like images, we'll just log the response status
  // and headers, not the actual image data
  res.on('data', () => {
    // Just consume the data without printing it
  });

  res.on('end', () => {
    console.log('Response completed');
    if (res.statusCode === 200) {
      console.log('SUCCESS: Photo accessed successfully');
    } else {
      console.log(`ERROR: Failed to access photo, status code: ${res.statusCode}`);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();

console.log('Making request to http://localhost:9000/photos/1747400206780-y1bmjvpr0e.jpg');
console.log('Make sure MinIO server is running');