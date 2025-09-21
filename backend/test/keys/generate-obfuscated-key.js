const fs = require('fs');
const crypto = require('crypto');

// Read the public key
const publicKeyPath = './public.pem';
const publicKeyContent = fs.readFileSync(publicKeyPath, 'utf8');

console.log('Original public key:');
console.log(publicKeyContent);
console.log('\n' + '='.repeat(50) + '\n');

// Split key into lines (preserve empty lines)
const keyLines = publicKeyContent.split('\n');

// XOR key for obfuscation
const xorKey = 42;

// Function to XOR obfuscate
function xorObfuscate(text, key) {
  return text
    .split('')
    .map(char => String.fromCharCode(char.charCodeAt(0) ^ key))
    .join('');
}

// Obfuscate each line
const obfuscatedParts = keyLines.map(line => xorObfuscate(line, xorKey));

console.log('Obfuscated key parts for TypeScript:');
console.log('private readonly obfuscatedKeyParts = [');
obfuscatedParts.forEach((part, index) => {
  // Escape backslashes and quotes for TypeScript
  const escapedPart = part.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  console.log(`  '${escapedPart}'${index < obfuscatedParts.length - 1 ? ',' : ''}`);
});
console.log('];');

console.log('\n' + '='.repeat(50) + '\n');

// Generate checksum
const checksum = crypto.createHash('sha256').update(publicKeyContent, 'utf8').digest('hex');
console.log('Expected checksum:');
console.log(`private readonly expectedChecksum = '${checksum}';`);

console.log('\n' + '='.repeat(50) + '\n');

// Test deobfuscation
console.log('Testing deobfuscation:');
const deobfuscatedParts = obfuscatedParts.map(part => xorObfuscate(part, xorKey));
const reconstructedKey = deobfuscatedParts.join('\n');

console.log('Reconstructed key matches original:', reconstructedKey === publicKeyContent);

if (reconstructedKey !== publicKeyContent) {
  console.log('❌ Mismatch detected!');
  console.log('Expected length:', publicKeyContent.length);
  console.log('Actual length:', reconstructedKey.length);
} else {
  console.log('✅ Obfuscation/deobfuscation working correctly!');
}