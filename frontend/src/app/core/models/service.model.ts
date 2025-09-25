export interface Service {
  id: number;
  name: string;
  description: string | null;
  price: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceSearchParams {
  search?: string;
  page?: number;
  size?: number;
}

export interface ServiceListResponse {
  services: Service[];
  totalCount: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface CreateServiceRequest {
  name: string;
  description?: string;
  price: number;
  isAvailable?: boolean;
}

export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  price?: number;
  isAvailable?: boolean;
}

// Discount Models
export interface Discount {
  id: number;
  name: string;
  description: string | null;
  type: 'percentage' | 'fixed';
  value: number;
  isActive: boolean;
  validFrom: Date;
  validUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DiscountSearchParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  size?: number;
}

export interface DiscountListResponse {
  discounts: Discount[];
  totalCount: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface CreateDiscountRequest {
  name: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number;
  isActive?: boolean;
  validFrom?: Date;
  validUntil?: Date;
}

export interface UpdateDiscountRequest {
  name?: string;
  description?: string;
  type?: 'percentage' | 'fixed';
  value?: number;
  isActive?: boolean;
  validFrom?: Date;
  validUntil?: Date;
}
