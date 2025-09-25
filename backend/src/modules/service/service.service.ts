import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import {
  CreateServiceDto,
  UpdateServiceDto,
  ServiceSearchDto,
  ServiceResponseDto,
  ServiceListResponseDto,
} from '../../common/dto';

@Injectable()
export class ServiceService {
  constructor(private prisma: PrismaService) {}

  // Service Methods
  async findAll(searchParams?: ServiceSearchDto): Promise<ServiceListResponseDto> {
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

    const [services, totalCount] = await Promise.all([
      this.prisma.serviceType.findMany({
        where: whereClause,
        skip,
        take: size,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.serviceType.count({ where: whereClause }),
    ]);

    return {
      services: services.map(this.mapToResponseDto),
      totalCount,
      page,
      size,
      totalPages: Math.ceil(totalCount / size),
    };
  }

  async findOne(id: number): Promise<ServiceResponseDto> {
    const service = await this.prisma.serviceType.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return this.mapToResponseDto(service);
  }

  async create(createDto: CreateServiceDto): Promise<ServiceResponseDto> {
    const service = await this.prisma.serviceType.create({
      data: createDto,
    });

    return this.mapToResponseDto(service);
  }

  async update(
    id: number,
    updateDto: UpdateServiceDto,
  ): Promise<ServiceResponseDto> {
    const existingService = await this.prisma.serviceType.findUnique({
      where: { id },
    });

    if (!existingService) {
      throw new NotFoundException('Service not found');
    }

    const service = await this.prisma.serviceType.update({
      where: { id },
      data: updateDto,
    });

    return this.mapToResponseDto(service);
  }

  async remove(id: number): Promise<void> {
    const existingService = await this.prisma.serviceType.findUnique({
      where: { id },
    });

    if (!existingService) {
      throw new NotFoundException('Service not found');
    }

    await this.prisma.serviceType.delete({
      where: { id },
    });
  }

  // Mapper Method
  private mapToResponseDto(service: any): ServiceResponseDto {
    return {
      id: service.id,
      name: service.name,
      description: service.description,
      price: Number(service.price),
      isAvailable: service.isAvailable,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  }
}
