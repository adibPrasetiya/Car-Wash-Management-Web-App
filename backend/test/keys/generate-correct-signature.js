const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

// Read the private key that matches the embedded public key
const privateKeyPem = fs.readFileSync(path.join(__dirname, 'private.pem'), 'utf8');
const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

// Generate sample signature for testing with correct format
function generateCorrectSignature() {
  const deviceId = 'ABC123XYZ';
  const appId = 'carwash-mgmt';
  const timestamp = Date.now();
  const licenseType = 'STANDARD';

  // Create message to sign (EXACT same format as in activation.service.ts)
  const messageToSign = JSON.stringify({
    deviceId,
    appId,
    timestamp,
    licenseType
  });

  console.log('Message to sign:', messageToSign);

  // Sign the message
  const md = forge.md.sha256.create();
  md.update(messageToSign, 'utf8');
  const signature = privateKey.sign(md);

  // Create signature data
  const signatureData = {
    signature: forge.util.encode64(signature),
    deviceId,
    appId,
    timestamp,
    licenseType
  };

  // Save signature file
  fs.writeFileSync(
    path.join(__dirname, 'correct-license.sig'),
    JSON.stringify(signatureData, null, 2)
  );

  console.log('Correct signature file created: test/keys/correct-license.sig');
  console.log('Device ID for testing:', deviceId);
  console.log('App ID for testing:', appId);

  // Also create curl command for easy testing
  const curlCommand = `curl -X POST http://localhost:3000/api/activation/activate -H "Content-Type: application/json" -d '${JSON.stringify({
    deviceInfo: {
      deviceId,
      appId,
      platform: 'web',
      userAgent: 'Test'
    },
    signature: JSON.stringify(signatureData)
  })}'`;

  fs.writeFileSync(
    path.join(__dirname, 'test-curl.sh'),
    curlCommand
  );

  console.log('Test curl command saved to: test/keys/test-curl.sh');
}

generateCorrectSignature();