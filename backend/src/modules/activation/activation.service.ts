import { Injectable } from '@nestjs/common';
import { KeyManager } from '../../utils/key-manager';
const forge = require('node-forge');

@Injectable()
export class ActivationService {
  private keyManager: KeyManager;

  constructor() {
    this.keyManager = KeyManager.getInstance();
  }

  /**
   * Verify device activation signature
   */
  verifyActivation(activationData: any) {
    try {
      const { deviceInfo, signature } = activationData;

      // Parse signature data
      const signatureData = JSON.parse(signature);

      // Verify device ID matches
      if (signatureData.deviceId !== deviceInfo.deviceId) {
        return {
          success: false,
          message: 'Device ID tidak sesuai dengan signature'
        };
      }

      // Verify app ID
      if (signatureData.appId !== deviceInfo.appId) {
        return {
          success: false,
          message: 'App ID tidak sesuai'
        };
      }

      // Create message to verify (same format as when signing)
      const messageToVerify = JSON.stringify({
        deviceId: signatureData.deviceId,
        appId: signatureData.appId,
        timestamp: signatureData.timestamp,
        licenseType: signatureData.licenseType
      });

      // Verify signature
      const md = forge.md.sha256.create();
      md.update(messageToVerify, 'utf8');

      const signatureBytes = forge.util.decode64(signatureData.signature);
      const publicKey = this.keyManager.getPublicKey();
      const verified = publicKey.verify(md.digest().bytes(), signatureBytes);

      if (!verified) {
        return {
          success: false,
          message: 'Signature tidak valid'
        };
      }

      // Generate activation token
      const activationToken = this.generateActivationToken(deviceInfo);

      return {
        success: true,
        message: 'Aktivasi berhasil',
        activationToken,
        licenseType: signatureData.licenseType
      };

    } catch (error) {
      return {
        success: false,
        message: 'Error verifying activation: ' + error.message
      };
    }
  }

  /**
   * Generate activation token for authenticated device
   */
  generateActivationToken(deviceInfo: any): string {
    const tokenData = {
      deviceId: deviceInfo.deviceId,
      appId: deviceInfo.appId,
      activatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
      platform: deviceInfo.platform,
      userAgent: deviceInfo.userAgent
    };

    // Simple base64 encoding (in production, use proper JWT)
    return Buffer.from(JSON.stringify(tokenData)).toString('base64');
  }

  /**
   * Verify activation token
   */
  verifyActivationToken(token: string) {
    try {
      const tokenData = JSON.parse(Buffer.from(token, 'base64').toString());

      // Check if token is expired
      if (new Date() > new Date(tokenData.expiresAt)) {
        return {
          valid: false,
          message: 'Token sudah expired'
        };
      }

      return {
        valid: true,
        data: tokenData
      };
    } catch (error) {
      return {
        valid: false,
        message: 'Token tidak valid'
      };
    }
  }

  /**
   * Check activation status
   */
  getActivationStatus(deviceId: string) {
    // In production, this would check database
    // For now, we'll return based on token presence
    return {
      isActivated: false, // Always require activation for demo
      deviceId,
      message: 'Device belum diaktivasi'
    };
  }
}
