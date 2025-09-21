const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

// Generate RSA key pair
console.log('Generating RSA key pair...');
const rsa = forge.pki.rsa;
const keypair = rsa.generateKeyPair({ bits: 2048, e: 0x10001 });

// Convert to PEM format
const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);

// Save to files in same directory
const currentDir = __dirname;

fs.writeFileSync(path.join(currentDir, 'public.pem'), publicKeyPem);
fs.writeFileSync(path.join(currentDir, 'private.pem'), privateKeyPem);

console.log('Keys generated successfully!');
console.log('Public key saved to: test/keys/public.pem');
console.log('Private key saved to: test/keys/private.pem');

// Generate sample signature for testing
function generateSampleSignature() {
  const deviceId = 'ABC123XYZ'; // Sample device ID
  const appId = 'carwash-mgmt';

  // Create message to sign
  const message = JSON.stringify({
    deviceId,
    appId,
    timestamp: Date.now(),
    licenseType: 'STANDARD'
  });

  // Sign the message
  const md = forge.md.sha256.create();
  md.update(message, 'utf8');
  const signature = keypair.privateKey.sign(md);

  // Create signature file
  const signatureData = {
    signature: forge.util.encode64(signature),
    deviceId,
    appId,
    timestamp: Date.now(),
    licenseType: 'STANDARD'
  };

  fs.writeFileSync(
    path.join(currentDir, 'sample-license.sig'),
    JSON.stringify(signatureData, null, 2)
  );

  console.log('Sample signature file created: test/keys/sample-license.sig');
  console.log('Device ID for testing:', deviceId);
}

generateSampleSignature();