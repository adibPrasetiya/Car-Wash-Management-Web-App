import { IsString, IsNotEmpty, IsNumber, IsOptional, IsIn, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  clientName: string;

  @IsString()
  @IsIn(['U', 'P'])
  clientType: string;

  @IsString()
  @IsIn(['car', 'motorcycle', 'truck'])
  vehicleType: string;

  @IsString()
  @IsOptional()
  plateNumber?: string;

  @IsString()
  @IsNotEmpty()
  serviceType: string;

  @IsNumber()
  totalAmount: number;

  @IsString()
  @IsNotEmpty()
  cashierId: string;

  @IsString()
  @IsNotEmpty()
  cashierName: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsOptional()
  clientId?: number;

  @IsOptional()
  vehicleId?: string;

  @IsString()
  @IsOptional()
  vehicleBrand?: string;

  @IsString()
  @IsOptional()
  vehicleModel?: string;
}

export class UpdateTransactionDto {
  @IsString()
  @IsOptional()
  clientName?: string;

  @IsString()
  @IsIn(['car', 'motorcycle', 'truck'])
  @IsOptional()
  vehicleType?: string;

  @IsString()
  @IsOptional()
  plateNumber?: string;

  @IsString()
  @IsOptional()
  serviceType?: string;

  @IsNumber()
  @IsOptional()
  totalAmount?: number;

  @IsString()
  @IsIn(['pending', 'in_progress', 'completed', 'cancelled'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class TransactionSearchDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsIn(['U', 'P'])
  @IsOptional()
  clientType?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 1)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 10)
  @IsNumber()
  size?: number;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}

export class TransactionResponseDto {
  transactionId: string;
  transactionNumber: string;
  clientName: string;
  clientType: string;
  clientId?: number;
  vehicleId?: string;
  vehicleType: string;
  plateNumber?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  serviceType: string;
  totalAmount: number;
  status: string;
  cashierId: string;
  cashierName: string;
  notes?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class TransactionListResponseDto {
  transactions: TransactionResponseDto[];
  totalCount: number;
  page: number;
  size: number;
  totalPages: number;
}