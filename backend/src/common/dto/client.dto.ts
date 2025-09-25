import { IsString, IsEmail, IsOptional, IsArray, ValidateNested, IsNotEmpty, IsNumber } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateVehicleDto {
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

  @IsOptional()
  year?: number;

  @IsString()
  @IsOptional()
  color?: string;
}

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVehicleDto)
  @IsOptional()
  vehicles?: CreateVehicleDto[];
}

export class UpdateClientDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}

export class UpdateVehicleDto {
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

  @IsOptional()
  year?: number;

  @IsString()
  @IsOptional()
  color?: string;
}

export class ClientSearchDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 1)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 10)
  @IsNumber()
  size?: number;
}

export class ClientResponseDto {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  vehicles: VehicleResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class VehicleResponseDto {
  id: string;
  plateNumber: string;
  vehicleType: string;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ClientListResponseDto {
  clients: ClientResponseDto[];
  totalCount: number;
  totalPages: number;
  page: number;
  size: number;
}