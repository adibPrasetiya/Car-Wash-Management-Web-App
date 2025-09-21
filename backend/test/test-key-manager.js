// Test key manager secara terpisah
const fs = require('fs');

// Read the original key untuk comparison
const originalKey = fs.readFileSync('./keys/public.pem', 'utf8');
console.log('Original key length:', originalKey.length);
console.log('Original key:');
console.log(originalKey);
console.log('\n' + '='.repeat(50) + '\n');

// Test simple base64 encoding approach
const base64Key = Buffer.from(originalKey, 'utf8').toString('base64');
console.log('Base64 encoded key:');
console.log(base64Key);

// Test decoding
const decodedKey = Buffer.from(base64Key, 'base64').toString('utf8');
console.log('\nDecoded matches original:', decodedKey === originalKey);

if (decodedKey === originalKey) {
  console.log('✅ Base64 encoding works correctly!');
  console.log('\nFor TypeScript:');
  console.log(`private readonly encodedKey = '${base64Key}';`);
} else {
  console.log('❌ Base64 encoding failed');
}