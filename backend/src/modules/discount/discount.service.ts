import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import {
  CreateDiscountDto,
  UpdateDiscountDto,
  DiscountSearchDto,
  DiscountResponseDto,
  DiscountListResponseDto,
} from '../../common/dto';

@Injectable()
export class DiscountService {
  constructor(private prisma: PrismaService) {}

  async findAll(searchParams?: DiscountSearchDto): Promise<DiscountListResponseDto> {
    const page = searchParams?.page || 1;
    const size = searchParams?.size || 10;
    const skip = (page - 1) * size;

    const whereClause: any = {};

    if (searchParams?.search) {
      const searchTerm = searchParams.search;
      whereClause.OR = [
        { name: { contains: searchTerm } },
        { description: { contains: searchTerm } },
      ];
    }

    if (searchParams?.isActive !== undefined) {
      whereClause.isActive = searchParams.isActive;
    }

    const [discounts, totalCount] = await Promise.all([
      this.prisma.discount.findMany({
        where: whereClause,
        skip,
        take: size,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.discount.count({ where: whereClause }),
    ]);

    return {
      discounts: discounts.map(this.mapToResponseDto),
      totalCount,
      page,
      size,
      totalPages: Math.ceil(totalCount / size),
    };
  }

  async findOne(id: number): Promise<DiscountResponseDto> {
    const discount = await this.prisma.discount.findUnique({
      where: { id },
    });

    if (!discount) {
      throw new NotFoundException('Discount not found');
    }

    return this.mapToResponseDto(discount);
  }

  async create(createDto: CreateDiscountDto): Promise<DiscountResponseDto> {
    const discount = await this.prisma.discount.create({
      data: {
        ...createDto,
        validFrom: createDto.validFrom || new Date(),
      },
    });

    return this.mapToResponseDto(discount);
  }

  async update(
    id: number,
    updateDto: UpdateDiscountDto,
  ): Promise<DiscountResponseDto> {
    const existingDiscount = await this.prisma.discount.findUnique({
      where: { id },
    });

    if (!existingDiscount) {
      throw new NotFoundException('Discount not found');
    }

    const discount = await this.prisma.discount.update({
      where: { id },
      data: updateDto,
    });

    return this.mapToResponseDto(discount);
  }

  async remove(id: number): Promise<void> {
    const existingDiscount = await this.prisma.discount.findUnique({
      where: { id },
    });

    if (!existingDiscount) {
      throw new NotFoundException('Discount not found');
    }

    await this.prisma.discount.delete({
      where: { id },
    });
  }

  private mapToResponseDto(discount: any): DiscountResponseDto {
    return {
      id: discount.id,
      name: discount.name,
      description: discount.description,
      type: discount.type,
      value: Number(discount.value),
      isActive: discount.isActive,
      validFrom: discount.validFrom,
      validUntil: discount.validUntil,
      createdAt: discount.createdAt,
      updatedAt: discount.updatedAt,
    };
  }
}
