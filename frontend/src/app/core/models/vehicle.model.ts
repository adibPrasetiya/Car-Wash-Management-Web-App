export interface Vehicle {
  id: string;
  clientId: string;
  licensePlate: string;
  brand: string;
  model: string;
  year?: number;
  color?: string;
  vehicleType: 'car' | 'motorcycle' | 'truck' | 'suv';
  createdAt: Date;
  updatedAt: Date;
}
