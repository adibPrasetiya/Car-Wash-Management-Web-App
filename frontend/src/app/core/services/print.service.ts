import { Injectable } from '@angular/core';

export interface TicketData {
  transactionId: string;
  queueNumber: string;
  clientName: string;
  clientType: 'P' | 'U'; // P = guest, U = registered
  vehicleType: string;
  plateNumber: string;
  serviceType: string;
  amount: number;
  date: Date;
  cashierName: string;
}

@Injectable({
  providedIn: 'root'
})
export class PrintService {
  private businessInfo = {
    name: 'CarWash Management',
    address: 'Jl. Raya Mencuci No. 123, Jakarta',
    phone: '(021) 555-0123',
    logo: '🚗💧' // Simple emoji logo, bisa diganti dengan path image
  };

  constructor() { }

  generateQueueNumber(clientType: 'P' | 'U'): string {
    // Generate nomor antrian berdasarkan timestamp untuk uniqueness
    const timestamp = Date.now();
    const sequence = (timestamp % 10000).toString().padStart(4, '0');
    return `${clientType}${sequence}`;
  }

  private generateTicketHTML(data: TicketData, copy: 'client' | 'key'): string {
    const copyText = copy === 'client' ? 'COPY CLIENT' : 'COPY KUNCI';
    const dateFormatted = data.date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const timeFormatted = data.date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <div style="
        font-family: 'Courier New', monospace;
        width: 80mm;
        font-size: 12px;
        line-height: 1.4;
        color: #000;
        background: white;
        padding: 10px;
        margin: 0;
        text-align: center;
        border: 1px solid #000;
        page-break-after: always;
      ">
        <!-- Header -->
        <div style="border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px;">
          <div style="font-size: 24px; margin-bottom: 4px;">${this.businessInfo.logo}</div>
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 2px;">
            ${this.businessInfo.name}
          </div>
          <div style="font-size: 10px; margin-bottom: 1px;">
            ${this.businessInfo.address}
          </div>
          <div style="font-size: 10px;">
            Telp: ${this.businessInfo.phone}
          </div>
        </div>

        <!-- Ticket Info -->
        <div style="margin-bottom: 8px;">
          <div style="font-weight: bold; font-size: 16px; margin-bottom: 4px;">
            TIKET ANTRIAN
          </div>
          <div style="font-size: 10px; color: #666;">
            ${copyText}
          </div>
        </div>

        <!-- Queue Number -->
        <div style="
          border: 2px solid #000;
          padding: 8px;
          margin: 8px 0;
          background: #f0f0f0;
        ">
          <div style="font-size: 10px; margin-bottom: 2px;">NOMOR ANTRIAN</div>
          <div style="font-weight: bold; font-size: 24px;">
            ${data.queueNumber}
          </div>
        </div>

        <!-- Transaction Details -->
        <div style="text-align: left; margin-bottom: 8px; border-bottom: 1px dashed #000; padding-bottom: 8px;">
          <div style="margin-bottom: 3px;">
            <strong>ID Transaksi:</strong> ${data.transactionId}
          </div>
          <div style="margin-bottom: 3px;">
            <strong>Nama:</strong> ${data.clientName}
          </div>
          <div style="margin-bottom: 3px;">
            <strong>Kendaraan:</strong> ${data.vehicleType} - ${data.plateNumber}
          </div>
          <div style="margin-bottom: 3px;">
            <strong>Layanan:</strong> ${data.serviceType}
          </div>
          <div style="margin-bottom: 3px;">
            <strong>Total:</strong> Rp ${data.amount.toLocaleString('id-ID')}
          </div>
        </div>

        <!-- Date & Time -->
        <div style="margin-bottom: 8px; font-size: 10px;">
          <div>${dateFormatted}</div>
          <div>${timeFormatted}</div>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px dashed #000; padding-top: 8px; font-size: 9px;">
          <div style="margin-bottom: 2px;">Kasir: ${data.cashierName}</div>
          <div style="margin-bottom: 4px;">Terima kasih atas kepercayaan Anda</div>
          <div style="font-style: italic;">
            ${copy === 'client' ? 'Simpan tiket ini sebagai bukti' : 'Tempel di kunci kendaraan'}
          </div>
        </div>
      </div>
    `;
  }

  printTicket(ticketData: TicketData): void {
    // Generate HTML untuk kedua copy
    const clientCopy = this.generateTicketHTML(ticketData, 'client');
    const keyCopy = this.generateTicketHTML(ticketData, 'key');

    // Gabungkan kedua copy
    const fullHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tiket Antrian - ${ticketData.queueNumber}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: 'Courier New', monospace;
          }
          @media print {
            body { -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        ${clientCopy}
        ${keyCopy}
      </body>
      </html>
    `;

    // Buka window baru untuk print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(fullHTML);
      printWindow.document.close();

      // Tunggu loading selesai kemudian print otomatis
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      };
    }
  }

  // Method untuk preview tiket (debugging)
  previewTicket(ticketData: TicketData): void {
    const clientCopy = this.generateTicketHTML(ticketData, 'client');
    const keyCopy = this.generateTicketHTML(ticketData, 'key');

    const fullHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Preview Tiket - ${ticketData.queueNumber}</title>
        <style>
          body {
            margin: 20px;
            background: #f0f0f0;
            font-family: Arial, sans-serif;
          }
          .preview-container {
            display: flex;
            gap: 20px;
            justify-content: center;
          }
          .ticket-preview {
            background: white;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
          }
        </style>
      </head>
      <body>
        <h2 style="text-align: center;">Preview Tiket Antrian</h2>
        <div class="preview-container">
          <div class="ticket-preview">${clientCopy}</div>
          <div class="ticket-preview">${keyCopy}</div>
        </div>
      </body>
      </html>
    `;

    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(fullHTML);
      previewWindow.document.close();
    }
  }
}
