import { DeviceInfo } from '../../core/models';
import { environment } from '../../../environments/environment';

export class MachineInfoGenerator {
  private static readonly APP_ID = 'carwash-mgmt';

  static generateDeviceId(): string {
    // Check environment configuration
    if (environment.activation.useHardcodedDeviceId) {
      return environment.activation.hardcodedDeviceId;
    }

    // Generate unique device ID based on browser fingerprint for production
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }
    const canvasFingerprint = canvas.toDataURL();

    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency || 0,
      canvasFingerprint.slice(-50) // Last 50 chars of canvas fingerprint
    ].join('|');

    // Simple hash function to create device ID
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    // Convert to positive hex string and pad with random chars
    const deviceId = Math.abs(hash).toString(16).toUpperCase();
    const padding = Math.random().toString(36).substring(2, 8).toUpperCase();

    return `${deviceId}${padding}`.substring(0, 12);
  }

  static generateMachineInfo(): DeviceInfo {
    return {
      deviceId: this.generateDeviceId(),
      appId: this.APP_ID,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      hardwareConcurrency: navigator.hardwareConcurrency || 0
    };
  }

  static generateMachineFile(): Blob {
    const machineInfo = this.generateMachineInfo();
    const jsonString = JSON.stringify(machineInfo, null, 2);
    return new Blob([jsonString], { type: 'application/json' });
  }

  static downloadMachineFile(): void {
    const blob = this.generateMachineFile();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `machine-info-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  static getCurrentDeviceId(): string {
    // Return consistent device ID for current session
    let deviceId = sessionStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = this.generateDeviceId();
      sessionStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  }
}