import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ActivationService } from '../../../core/services/activation.service';
import { ToastrService } from '../../../core/services/toastr.service';
import { MachineInfoGenerator } from '../../../shared/utils/machine-info.util';
import { DeviceInfo } from '../../../core/models';

@Component({
  selector: 'app-activation',
  imports: [CommonModule],
  templateUrl: './activation.component.html',
  styleUrl: './activation.component.css'
})
export class ActivationComponent {
  selectedFile: File | null = null;
  isDragOver = false;
  isVerifying = false;
  errorMessage = '';

  // Floating elements data
  floatingElements = [
    { icon: 'fas fa-certificate', top: '10%', left: '10%', delay: '0s' },
    { icon: 'fas fa-lock', top: '70%', left: '80%', delay: '2s' },
    { icon: 'fas fa-key', top: '30%', left: '85%', delay: '4s' },
    { icon: 'fas fa-shield-check', top: '80%', left: '15%', delay: '1s' },
    { icon: 'fas fa-user-shield', top: '20%', left: '5%', delay: '3s' },
    { icon: 'fas fa-fingerprint', top: '60%', left: '90%', delay: '5s' },
    { icon: 'fas fa-id-badge', top: '40%', left: '95%', delay: '1.5s' },
    { icon: 'fas fa-security', top: '90%', left: '8%', delay: '2.5s' },
    { icon: 'fas fa-shield-virus', top: '15%', left: '92%', delay: '3.5s' },
    { icon: 'fas fa-user-lock', top: '85%', left: '85%', delay: '4.5s' },
    { icon: 'fas fa-file-signature', top: '50%', left: '3%', delay: '0.5s' },
    { icon: 'fas fa-digital-tachograph', top: '25%', left: '2%', delay: '6s' }
  ];

  constructor(
    private activationService: ActivationService,
    private toastrService: ToastrService,
    private router: Router
  ) {}

  downloadMachineFile(): void {
    MachineInfoGenerator.downloadMachineFile();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0];
      this.errorMessage = '';
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.errorMessage = '';
    }
  }

  verifyAndActivate(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Harap pilih file signature terlebih dahulu';
      this.toastrService.warning('Harap pilih file signature terlebih dahulu');
      return;
    }

    this.isVerifying = true;
    this.errorMessage = '';
    this.toastrService.info('Memulai proses verifikasi signature...');

    this.validateSignatureFile(this.selectedFile)
      .then(isValid => {
        if (isValid) {
          this.toastrService.success('File signature valid, memproses aktivasi...');
          this.submitActivation();
        } else {
          this.errorMessage = 'File signature tidak valid atau format tidak sesuai';
          this.toastrService.error('File signature tidak valid atau format tidak sesuai');
          this.isVerifying = false;
        }
      })
      .catch(error => {
        this.errorMessage = 'Terjadi error saat memvalidasi file: ' + error.message;
        this.toastrService.error('Terjadi error saat memvalidasi file: ' + error.message);
        this.isVerifying = false;
      });
  }

  private validateSignatureFile(file: File): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const signatureData = JSON.parse(content);

          // Basic validation - check if required fields exist
          const hasRequiredFields = signatureData.signature &&
                                   signatureData.deviceId &&
                                   signatureData.appId &&
                                   signatureData.timestamp &&
                                   signatureData.licenseType;

          resolve(hasRequiredFields);
        } catch (error) {
          reject(new Error('Format file tidak valid'));
        }
      };
      reader.onerror = () => reject(new Error('Gagal membaca file'));
      reader.readAsText(file);
    });
  }

  private submitActivation(): void {
    if (!this.selectedFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const signatureContent = event.target?.result as string;
        const signatureData = JSON.parse(signatureContent);

        const deviceInfo: DeviceInfo = MachineInfoGenerator.generateMachineInfo();

        const activationRequest = {
          deviceInfo,
          signature: JSON.stringify(signatureData)
        };

        this.activationService.submitActivation(activationRequest).subscribe({
          next: (response) => {
            if (response.success && response.activationToken) {
              this.activationService.saveActivationData(response.activationToken);
              this.toastrService.success('Aktivasi berhasil! Mengarahkan ke halaman login...');
              setTimeout(() => {
                this.router.navigate(['/login']);
              }, 1500); // Give time for user to see the success message
            } else {
              this.errorMessage = response.message || 'Aktivasi gagal';
              this.toastrService.error(response.message || 'Aktivasi gagal');
              this.isVerifying = false;
            }
          },
          error: (error) => {
            this.errorMessage = 'Terjadi error saat aktivasi: ' + error.message;
            this.toastrService.error('Terjadi error saat aktivasi: ' + error.message);
            this.isVerifying = false;
          }
        });

      } catch (error) {
        this.errorMessage = 'Format file signature tidak valid';
        this.toastrService.error('Format file signature tidak valid');
        this.isVerifying = false;
      }
    };
    reader.readAsText(this.selectedFile);
  }
}
