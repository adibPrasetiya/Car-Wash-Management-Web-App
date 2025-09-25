import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import {
  CreateVehicleStandaloneDto,
  UpdateVehicleStandaloneDto,
  VehicleSearchDto,
  VehicleDetailResponseDto,
  VehicleListResponseDto
} from '../../common/dto';

@Injectable()
export class VehicleService {
  constructor(private prisma: PrismaService) {}

  async createVehicle(createVehicleDto: CreateVehicleStandaloneDto): Promise<VehicleDetailResponseDto> {
    const { clientId, plateNumber, vehicleType, brand, model, year, color } = createVehicleDto;

    // If clientId is provided, check if client exists
    if (clientId) {
      const client = await this.prisma.client.findUnique({
        where: { id: clientId }
      });

      if (!client) {
        throw new NotFoundException('Client not found');
      }
    }

    const vehicle = await this.prisma.vehicle.create({
      data: {
        clientId,
        plateNumber,
        vehicleType,
        brand,
        model,
        year,
        color
      },
      include: {
        client: true
      }
    });

    return this.formatVehicleResponse(vehicle);
  }

  async getVehicles(searchDto: VehicleSearchDto): Promise<VehicleListResponseDto> {
    const { search, vehicleType, clientId, page = 1, size = 10 } = searchDto;
    const skip = (page - 1) * size;

    const where: any = {};

    if (search) {
      where.OR = [
        { plateNumber: { contains: search } },
        { brand: { contains: search } },
        { model: { contains: search } },
        {
          client: {
            name: { contains: search }
          }
        }
      ];
    }

    if (vehicleType) {
      where.vehicleType = vehicleType;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    const [vehicles, totalCount] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        include: {
          client: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: size
      }),
      this.prisma.vehicle.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / size);

    return {
      vehicles: vehicles.map(vehicle => this.formatVehicleResponse(vehicle)),
      totalCount,
      totalPages,
      page,
      size
    };
  }

  async getVehicleById(id: string): Promise<VehicleDetailResponseDto> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        client: true
      }
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return this.formatVehicleResponse(vehicle);
  }

  async updateVehicle(id: string, updateVehicleDto: UpdateVehicleStandaloneDto): Promise<VehicleDetailResponseDto> {
    const { clientId, plateNumber, vehicleType, brand, model, year, color } = updateVehicleDto;

    // Check if vehicle exists
    const existingVehicle = await this.prisma.vehicle.findUnique({
      where: { id }
    });

    if (!existingVehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    // If clientId is provided, check if client exists
    if (clientId) {
      const client = await this.prisma.client.findUnique({
        where: { id: clientId }
      });

      if (!client) {
        throw new NotFoundException('Client not found');
      }
    }

    const updatedVehicle = await this.prisma.vehicle.update({
      where: { id },
      data: {
        clientId,
        plateNumber,
        vehicleType,
        brand,
        model,
        year,
        color
      },
      include: {
        client: true
      }
    });

    return this.formatVehicleResponse(updatedVehicle);
  }

  async deleteVehicle(id: string): Promise<void> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        transactions: true
      }
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    // Check if vehicle has any transactions
    if (vehicle.transactions.length > 0) {
      throw new ConflictException('Cannot delete vehicle with existing transactions');
    }

    await this.prisma.vehicle.delete({
      where: { id }
    });
  }

  async getVehiclesByClientId(clientId: number): Promise<VehicleDetailResponseDto[]> {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { clientId },
      include: {
        client: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return vehicles.map(vehicle => this.formatVehicleResponse(vehicle));
  }

  async searchVehicles(query: string): Promise<VehicleDetailResponseDto[]> {
    const vehicles = await this.prisma.vehicle.findMany({
      where: {
        OR: [
          { plateNumber: { contains: query } },
          { brand: { contains: query } },
          { model: { contains: query } },
          {
            client: {
              name: { contains: query }
            }
          }
        ]
      },
      include: {
        client: true
      },
      orderBy: { createdAt: 'desc' },
      take: 20 // Limit results for search
    });

    return vehicles.map(vehicle => this.formatVehicleResponse(vehicle));
  }

  private formatVehicleResponse(vehicle: any): VehicleDetailResponseDto {
    return {
      id: vehicle.id,
      clientId: vehicle.clientId,
      clientName: vehicle.client?.name,
      plateNumber: vehicle.plateNumber,
      vehicleType: vehicle.vehicleType,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt
    };
  }
}
