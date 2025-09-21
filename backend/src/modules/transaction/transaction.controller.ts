import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionSearchDto,
  TransactionResponseDto,
  TransactionListResponseDto,
} from '../../common/dto';

@Controller('cashiers')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get(':cashierId/transactions')
  async findAll(
    @Param('cashierId') cashierId: string,
    @Query(new ValidationPipe({ transform: true })) searchParams: TransactionSearchDto
  ): Promise<TransactionListResponseDto> {
    return this.transactionService.findAllByCashier(cashierId, searchParams);
  }

  @Get(':cashierId/transactions/:transactionId')
  async findOne(
    @Param('cashierId') cashierId: string,
    @Param('transactionId') transactionId: string
  ): Promise<TransactionResponseDto> {
    return this.transactionService.findOneById(transactionId, cashierId);
  }

  @Post(':cashierId/transactions')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('cashierId') cashierId: string,
    @Body(ValidationPipe) createTransactionDto: CreateTransactionDto
  ): Promise<TransactionResponseDto> {
    // Ensure cashierId from URL matches the one in DTO
    const transactionData = {
      ...createTransactionDto,
      cashierId,
    };
    return this.transactionService.create(transactionData);
  }

  @Patch(':cashierId/transactions/:transactionId')
  async update(
    @Param('cashierId') cashierId: string,
    @Param('transactionId') transactionId: string,
    @Body(ValidationPipe) updateTransactionDto: UpdateTransactionDto
  ): Promise<TransactionResponseDto> {
    return this.transactionService.update(transactionId, cashierId, updateTransactionDto);
  }

  @Delete(':cashierId/transactions/:transactionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('cashierId') cashierId: string,
    @Param('transactionId') transactionId: string
  ): Promise<void> {
    return this.transactionService.remove(transactionId, cashierId);
  }
}
