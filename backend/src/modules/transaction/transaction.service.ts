import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionSearchDto,
  TransactionResponseDto,
  TransactionListResponseDto
} from '../../common/dto';
import { randomUUID } from 'crypto';

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  async findAllByCashier(
    cashierId: string,
    searchParams?: TransactionSearchDto
  ): Promise<TransactionListResponseDto> {
    const page = searchParams?.page || 1;
    const size = searchParams?.size || 10;
    const skip = (page - 1) * size;

    // Build where clause
    const whereClause: any = {
      cashierId: cashierId,
    };

    // Apply search filter
    if (searchParams?.search) {
      const searchTerm = searchParams.search;
      whereClause.OR = [
        { transactionNumber: { contains: searchTerm } },
        { transactionId: { contains: searchTerm } },
        { plateNumber: { contains: searchTerm } },
        { clientName: { contains: searchTerm } },
      ];
    }

    // Apply status filter
    if (searchParams?.status) {
      whereClause.status = searchParams.status;
    }

    // Apply client type filter
    if (searchParams?.clientType) {
      whereClause.clientType = searchParams.clientType;
    }

    // Apply date range filter
    if (searchParams?.startDate && searchParams?.endDate) {
      whereClause.date = {
        gte: new Date(searchParams.startDate),
        lte: new Date(searchParams.endDate),
      };
    }

    const [transactions, totalCount] = await Promise.all([
      this.prisma.transaction.findMany({
        where: whereClause,
        skip,
        take: size,
        orderBy: { date: 'desc' },
      }),
      this.prisma.transaction.count({ where: whereClause }),
    ]);

    return {
      transactions: transactions.map(this.mapToResponseDto),
      totalCount,
      page,
      size,
      totalPages: Math.ceil(totalCount / size),
    };
  }

  async findOneById(transactionId: string, cashierId: string): Promise<TransactionResponseDto> {
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        transactionId,
        cashierId
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return this.mapToResponseDto(transaction);
  }

  async create(createTransactionDto: CreateTransactionDto): Promise<TransactionResponseDto> {
    const transactionId = this.generateTransactionId();
    const transactionNumber = await this.generateTransactionNumber(createTransactionDto.clientType as 'U' | 'P');

    const transaction = await this.prisma.transaction.create({
      data: {
        transactionId,
        transactionNumber,
        ...createTransactionDto,
        status: 'pending',
        totalAmount: createTransactionDto.totalAmount,
      },
    });

    return this.mapToResponseDto(transaction);
  }

  async update(
    transactionId: string,
    cashierId: string,
    updateTransactionDto: UpdateTransactionDto
  ): Promise<TransactionResponseDto> {
    // Check if transaction exists and belongs to cashier
    const existingTransaction = await this.prisma.transaction.findFirst({
      where: { transactionId, cashierId },
    });

    if (!existingTransaction) {
      throw new NotFoundException('Transaction not found');
    }

    const transaction = await this.prisma.transaction.update({
      where: { transactionId },
      data: {
        ...updateTransactionDto,
        totalAmount: updateTransactionDto.totalAmount
          ? updateTransactionDto.totalAmount
          : undefined,
      },
    });

    return this.mapToResponseDto(transaction);
  }

  async remove(transactionId: string, cashierId: string): Promise<void> {
    // Check if transaction exists and belongs to cashier
    const existingTransaction = await this.prisma.transaction.findFirst({
      where: { transactionId, cashierId },
    });

    if (!existingTransaction) {
      throw new NotFoundException('Transaction not found');
    }

    await this.prisma.transaction.delete({
      where: { transactionId },
    });
  }

  private generateTransactionId(): string {
    const uuid = randomUUID().replace(/-/g, '').substring(0, 16);
    return `TRX${uuid}`;
  }

  private async generateTransactionNumber(clientType: 'U' | 'P'): Promise<string> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const todayTransactions = await this.prisma.transaction.count({
      where: {
        date: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    const nextNumber = (todayTransactions + 1).toString().padStart(4, '0');
    return `${clientType}${nextNumber}`;
  }

  private mapToResponseDto(transaction: any): TransactionResponseDto {
    return {
      transactionId: transaction.transactionId,
      transactionNumber: transaction.transactionNumber,
      clientName: transaction.clientName,
      clientType: transaction.clientType,
      clientId: transaction.clientId,
      vehicleId: transaction.vehicleId,
      vehicleType: transaction.vehicleType,
      plateNumber: transaction.plateNumber,
      vehicleBrand: transaction.vehicleBrand,
      vehicleModel: transaction.vehicleModel,
      serviceType: transaction.serviceType,
      totalAmount: Number(transaction.totalAmount),
      status: transaction.status,
      cashierId: transaction.cashierId,
      cashierName: transaction.cashierName,
      notes: transaction.notes,
      date: transaction.date,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }
}
