export interface Vehicle {
  id: string;
  clientId?: string;
  plateNumber: string;
  licensePlate?: string; // Keep for backward compatibility
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  vehicleType: 'car' | 'motorcycle' | 'truck';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVehicleRequest {
  plateNumber: string;
  vehicleType: 'car' | 'motorcycle' | 'truck';
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
}
