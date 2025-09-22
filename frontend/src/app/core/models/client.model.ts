import { Vehicle, CreateVehicleRequest } from './vehicle.model';

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  vehicles: Vehicle[];
  // Keep for backward compatibility
  plateNumber?: string;
  vehicleType?: 'car' | 'motorcycle' | 'truck';
  type: 'U' | 'P'; // U = registered user, P = guest
  isActive: boolean;
  totalTransactions?: number;
  lastVisit?: Date;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClientRequest {
  name: string;
  phone: string;
  email?: string;
  type: 'U' | 'P';
  vehicles: CreateVehicleRequest[];
}

export interface ClientSearchParams {
  search?: string;
  vehicleType?: 'car' | 'motorcycle' | 'truck';
  isActive?: boolean;
  page?: number;
  size?: number;
}

export interface ClientListResponse {
  clients: Client[];
  totalCount: number;
  totalPages: number;
  page: number;
  size: number;
}
