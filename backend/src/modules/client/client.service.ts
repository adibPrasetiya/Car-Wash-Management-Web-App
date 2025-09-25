import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import {
  CreateClientDto,
  UpdateClientDto,
  ClientSearchDto,
  ClientResponseDto,
  ClientListResponseDto
} from '../../common/dto';

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  async createClient(createClientDto: CreateClientDto): Promise<ClientResponseDto> {
    const { name, phone, email, vehicles } = createClientDto;

    // Check for existing client with same phone or email
    if (phone || email) {
      const existingClient = await this.prisma.client.findFirst({
        where: {
          OR: [
            phone ? { phone } : {},
            email ? { email } : {}
          ].filter(condition => Object.keys(condition).length > 0)
        }
      });

      if (existingClient) {
        throw new ConflictException('Client with this phone or email already exists');
      }
    }

    // Create client with vehicles
    const client = await this.prisma.client.create({
      data: {
        name,
        phone,
        email,
        vehicles: vehicles ? {
          create: vehicles.map(vehicle => ({
            plateNumber: vehicle.plateNumber,
            vehicleType: vehicle.vehicleType,
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year,
            color: vehicle.color
          }))
        } : undefined
      },
      include: {
        vehicles: true
      }
    });

    return this.formatClientResponse(client);
  }

  async getClients(searchDto: ClientSearchDto): Promise<ClientListResponseDto> {
    const { search, page = 1, size = 10 } = searchDto;
    const skip = (page - 1) * size;

    const where = search ? {
      OR: [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
        {
          vehicles: {
            some: {
              plateNumber: { contains: search }
            }
          }
        }
      ]
    } : {};

    const [clients, totalCount] = await Promise.all([
      this.prisma.client.findMany({
        where,
        include: {
          vehicles: {
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: size
      }),
      this.prisma.client.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / size);

    return {
      clients: clients.map(client => this.formatClientResponse(client)),
      totalCount,
      totalPages,
      page,
      size
    };
  }

  async getClientById(id: number): Promise<ClientResponseDto> {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        vehicles: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return this.formatClientResponse(client);
  }

  async updateClient(id: number, updateClientDto: UpdateClientDto): Promise<ClientResponseDto> {
    const { name, phone, email } = updateClientDto;

    // Check if client exists
    const existingClient = await this.prisma.client.findUnique({
      where: { id }
    });

    if (!existingClient) {
      throw new NotFoundException('Client not found');
    }

    // Check for conflicts with other clients
    if (phone || email) {
      const conflictingClient = await this.prisma.client.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                phone ? { phone } : {},
                email ? { email } : {}
              ].filter(condition => Object.keys(condition).length > 0)
            }
          ]
        }
      });

      if (conflictingClient) {
        throw new ConflictException('Another client with this phone or email already exists');
      }
    }

    const updatedClient = await this.prisma.client.update({
      where: { id },
      data: {
        name,
        phone,
        email
      },
      include: {
        vehicles: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    return this.formatClientResponse(updatedClient);
  }

  async deleteClient(id: number): Promise<void> {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        transactions: true,
        vehicles: true
      }
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Check if client has any transactions
    if (client.transactions.length > 0) {
      throw new ConflictException('Cannot delete client with existing transactions');
    }

    // Delete client (vehicles will be deleted due to cascade)
    await this.prisma.client.delete({
      where: { id }
    });
  }

  async addVehicleToClient(clientId: number, vehicleData: any): Promise<ClientResponseDto> {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId }
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    await this.prisma.vehicle.create({
      data: {
        clientId,
        plateNumber: vehicleData.plateNumber,
        vehicleType: vehicleData.vehicleType,
        brand: vehicleData.brand,
        model: vehicleData.model,
        year: vehicleData.year,
        color: vehicleData.color
      }
    });

    return this.getClientById(clientId);
  }

  async removeVehicleFromClient(clientId: number, vehicleId: string): Promise<ClientResponseDto> {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        clientId
      }
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found for this client');
    }

    // Check if vehicle has any transactions
    const transactionCount = await this.prisma.transaction.count({
      where: { vehicleId }
    });

    if (transactionCount > 0) {
      throw new ConflictException('Cannot delete vehicle with existing transactions');
    }

    await this.prisma.vehicle.delete({
      where: { id: vehicleId }
    });

    return this.getClientById(clientId);
  }

  async searchClients(query: string): Promise<ClientResponseDto[]> {
    const clients = await this.prisma.client.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { phone: { contains: query } },
          { email: { contains: query } },
          {
            vehicles: {
              some: {
                plateNumber: { contains: query }
              }
            }
          }
        ]
      },
      include: {
        vehicles: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20 // Limit results for search
    });

    return clients.map(client => this.formatClientResponse(client));
  }

  private formatClientResponse(client: any): ClientResponseDto {
    return {
      id: client.id,
      name: client.name,
      phone: client.phone,
      email: client.email,
      vehicles: client.vehicles?.map(vehicle => ({
        id: vehicle.id,
        plateNumber: vehicle.plateNumber,
        vehicleType: vehicle.vehicleType,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        createdAt: vehicle.createdAt,
        updatedAt: vehicle.updatedAt
      })) || [],
      createdAt: client.createdAt,
      updatedAt: client.updatedAt
    };
  }
}
