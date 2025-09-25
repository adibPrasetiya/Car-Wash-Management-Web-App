import { IsString, IsOptional, IsDecimal, IsNumber, Min, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

// Service DTOs
export class CreateServiceDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isAvailable?: boolean = true;
}

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isAvailable?: boolean;
}

export class ServiceResponseDto {
  id: number;
  name: string;
  description: string | null;
  price: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Search/Filter DTOs
export class ServiceSearchDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  size?: number = 10;
}

// List Response DTO
export class ServiceListResponseDto {
  services: ServiceResponseDto[];
  totalCount: number;
  page: number;
  size: number;
  totalPages: number;
}

// Discount DTOs
export class CreateDiscountDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  type: 'percentage' | 'fixed';

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  value: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean = true;

  @IsOptional()
  @Type(() => Date)
  validFrom?: Date;

  @IsOptional()
  @Type(() => Date)
  validUntil?: Date;
}

export class UpdateDiscountDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  type?: 'percentage' | 'fixed';

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  value?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @IsOptional()
  @Type(() => Date)
  validFrom?: Date;

  @IsOptional()
  @Type(() => Date)
  validUntil?: Date;
}

export class DiscountResponseDto {
  id: number;
  name: string;
  description: string | null;
  type: string;
  value: number;
  isActive: boolean;
  validFrom: Date;
  validUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class DiscountSearchDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  size?: number = 10;
}

export class DiscountListResponseDto {
  discounts: DiscountResponseDto[];
  totalCount: number;
  page: number;
  size: number;
  totalPages: number;
}