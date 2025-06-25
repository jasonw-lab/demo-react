// This script demonstrates that API routes don't work with static export
const http = require('http');

console.log('Testing API endpoint with static export configuration...');
console.log('Note: This test is expected to fail because API routes are disabled with output: "export"');

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
  console.log('\nThis error is expected with static export configuration.');
  console.log('Please refer to API_SOLUTION.md for recommended solutions.');
});

req.end();

console.log('Making request to http://localhost:3001/photo-gallary/api/photos');
console.log('Run this script after building and starting the server with:');
console.log('  npm run build');
console.log('  npm run start');
