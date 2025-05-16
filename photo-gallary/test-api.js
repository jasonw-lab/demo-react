// Simple script to test the API endpoint
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/photo-gallary/api/photos',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response body:');
    try {
      const parsedData = JSON.parse(data);
      console.log(JSON.stringify(parsedData, null, 2));
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();

console.log('Making request to http://localhost:3001/photo-gallary/api/photos');
console.log('Run this script after starting the server with "npm run dev"');
