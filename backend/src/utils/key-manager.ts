import * as crypto from 'crypto';

export class KeyManager {
  private static instance: KeyManager;
  private publicKey: any;
  private keyChecksum: string;
  private isKeyLoaded = false;

  // Base64 encoded public key (embedded and obfuscated)
  private readonly encodedKey = 'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0NCk1JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBMVVJUWpJNysyMW5lV1lnWjhsNW4NCldpeGVJTmtBblVWQ05TWng4L0pCRkdxaG44a041RVdGTC9DbGxTRmJwOEhMbHhDdUQyb1ZPSk4yZE45dEdiV0kNCmpQVmlhT1J6TGYzbXhqVithY3ZHNThTZFBONThwdTlROGpZUllXZGpmaVRtL1VGMjBxUjVPUVB2UzhnSktmeTgNCmRQL3VsN3Z0S2VmMVB0bmZIaDNreXE1Sy9CVWg0dWF0ZWcvU1llLzNIYUlWc3M0MU04V1pTT0xLN1pTSEl3YmsNCk93cGNkYjYzditJTXpTWElqNUM2VDQ4REVQZXUzKzdRcFFDUDdEZVVnVmhQdkFZTGtjUlRienljN3RnUFhGZ0QNCnN6c3hJdjZjazJrako3bmNSQkZMQ0hZQjc3UVE2SlpEYkN6NWM0OFhRZ292YXByMHJIZFdDMVlMWmFFNW9STXENCkNRSURBUUFCDQotLS0tLUVORCBQVUJMSUMgS0VZLS0tLS0NCg==';

  // Expected checksum for integrity validation
  private readonly expectedChecksum = '8110894e36bba4f343b106d3fab011b743af39dbad4a8b11dcd1ee66ec534356';

  private constructor() {
    this.loadAndValidateKey();
  }

  static getInstance(): KeyManager {
    if (!KeyManager.instance) {
      KeyManager.instance = new KeyManager();
    }
    return KeyManager.instance;
  }

  private loadAndValidateKey(): void {
    try {
      // Decode base64 key
      const keyContent = this.decodeKey();

      // Validate key format
      if (!this.validateKeyFormat(keyContent)) {
        throw new Error('Invalid public key format');
      }

      // Generate checksum for integrity check
      this.keyChecksum = this.generateChecksum(keyContent);

      // Validate against expected checksum
      if (this.keyChecksum !== this.expectedChecksum) {
        throw new Error('Key integrity verification failed');
      }

      // Load key with node-forge
      const forge = require('node-forge');
      this.publicKey = forge.pki.publicKeyFromPem(keyContent);

      this.isKeyLoaded = true;
      console.log('✅ Public key loaded and validated successfully');

    } catch (error) {
      console.error('❌ Failed to load public key:', error.message);
      throw new Error('Key security validation failed');
    }
  }

  private decodeKey(): string {
    try {
      // Decode from base64
      return Buffer.from(this.encodedKey, 'base64').toString('utf8');
    } catch (error) {
      throw new Error('Key decoding failed');
    }
  }

  private validateKeyFormat(keyContent: string): boolean {
    const pemHeader = '-----BEGIN PUBLIC KEY-----';
    const pemFooter = '-----END PUBLIC KEY-----';

    // Basic format validation
    if (!keyContent.includes(pemHeader) || !keyContent.includes(pemFooter)) {
      return false;
    }

    // Length validation (RSA 2048 key should be around 450+ chars)
    if (keyContent.length < 400) {
      return false;
    }

    // Check for suspicious modifications
    const lines = keyContent.split('\n');
    const contentLines = lines.filter(line =>
      !line.includes('-----BEGIN') &&
      !line.includes('-----END') &&
      line.trim() !== ''
    );

    // Basic base64 validation
    for (const line of contentLines) {
      if (!/^[A-Za-z0-9+/=]+$/.test(line.trim())) {
        return false;
      }
    }

    return true;
  }

  private generateChecksum(content: string): string {
    return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
  }

  public getPublicKey(): any {
    if (!this.isKeyLoaded || !this.publicKey) {
      throw new Error('Public key not available - security check failed');
    }

    // Re-validate key integrity on each access
    this.validateKeyIntegrity();

    return this.publicKey;
  }

  private validateKeyIntegrity(): void {
    try {
      // Re-decode and check against expected checksum
      const currentContent = this.decodeKey();
      const currentChecksum = this.generateChecksum(currentContent);

      if (currentChecksum !== this.expectedChecksum) {
        throw new Error('Key integrity check failed - possible tampering detected');
      }
    } catch (error) {
      console.error('🔒 Key integrity validation failed:', error.message);
      throw new Error('Security violation detected');
    }
  }

  public isSecure(): boolean {
    try {
      this.validateKeyIntegrity();
      return this.isKeyLoaded && !!this.publicKey;
    } catch {
      return false;
    }
  }

  // Method to securely wipe key from memory (for enhanced security)
  public wipeKey(): void {
    this.publicKey = null;
    this.keyChecksum = '';
    this.isKeyLoaded = false;
    console.log('🔐 Public key wiped from memory');
  }
}