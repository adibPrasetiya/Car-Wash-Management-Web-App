import { IsString, IsOptional, IsNotEmpty, IsInt, Min, Max } from 'class-validator';

export class CreateVehicleStandaloneDto {
  @IsInt()
  @IsOptional()
  clientId?: number;

  @IsString()
  @IsNotEmpty()
  plateNumber: string;

  @IsString()
  @IsNotEmpty()
  vehicleType: 'car' | 'motorcycle' | 'truck';

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  @IsOptional()
  year?: number;

  @IsString()
  @IsOptional()
  color?: string;
}

export class UpdateVehicleStandaloneDto {
  @IsInt()
  @IsOptional()
  clientId?: number;

  @IsString()
  @IsOptional()
  plateNumber?: string;

  @IsString()
  @IsOptional()
  vehicleType?: 'car' | 'motorcycle' | 'truck';

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  @IsOptional()
  year?: number;

  @IsString()
  @IsOptional()
  color?: string;
}

export class VehicleSearchDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  vehicleType?: 'car' | 'motorcycle' | 'truck';

  @IsInt()
  @IsOptional()
  clientId?: number;

  @IsOptional()
  page?: number;

  @IsOptional()
  size?: number;
}

export class VehicleListResponseDto {
  vehicles: VehicleDetailResponseDto[];
  totalCount: number;
  totalPages: number;
  page: number;
  size: number;
}

export class VehicleDetailResponseDto {
  id: string;
  clientId?: number;
  clientName?: string;
  plateNumber: string;
  vehicleType: string;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}