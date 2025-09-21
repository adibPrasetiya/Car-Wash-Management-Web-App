import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ActivationService } from './activation.service';

@Controller('api/activation')
export class ActivationController {
  constructor(private readonly activationService: ActivationService) {}

  /**
   * Get activation status
   */
  @Get('status')
  getActivationStatus(@Query('deviceId') deviceId: string) {
    if (!deviceId) {
      return {
        success: false,
        message: 'Device ID required'
      };
    }

    const status = this.activationService.getActivationStatus(deviceId);

    return {
      isActivated: status.isActivated,
      message: status.message
    };
  }

  /**
   * Submit activation request
   */
  @Post('activate')
  submitActivation(@Body() body: any) {
    const { deviceInfo, signature } = body;

    // Validate required fields
    if (!deviceInfo || !signature) {
      return {
        success: false,
        message: 'Device info dan signature diperlukan'
      };
    }

    if (!deviceInfo.deviceId || !deviceInfo.appId) {
      return {
        success: false,
        message: 'Device ID dan App ID diperlukan'
      };
    }

    // Verify activation
    const result = this.activationService.verifyActivation({
      deviceInfo,
      signature
    });

    if (!result.success) {
      return result;
    }

    // Log successful activation
    console.log(`Device activated successfully: ${deviceInfo.deviceId}`);

    return {
      success: true,
      message: result.message,
      activationToken: result.activationToken,
      licenseType: result.licenseType
    };
  }

  /**
   * Verify activation token
   */
  @Post('verify-token')
  verifyToken(@Body() body: any) {
    const { token } = body;

    if (!token) {
      return {
        success: false,
        message: 'Token diperlukan'
      };
    }

    const result = this.activationService.verifyActivationToken(token);

    if (!result.valid) {
      return {
        success: false,
        message: result.message
      };
    }

    return {
      success: true,
      valid: true,
      data: result.data
    };
  }

}
