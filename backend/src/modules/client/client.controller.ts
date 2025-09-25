import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  ValidationPipe
} from '@nestjs/common';
import { ClientService } from './client.service';
import {
  CreateClientDto,
  UpdateClientDto,
  ClientSearchDto,
  ClientResponseDto,
  ClientListResponseDto,
  CreateVehicleDto
} from '../../common/dto';

@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createClient(
    @Body(ValidationPipe) createClientDto: CreateClientDto
  ): Promise<ClientResponseDto> {
    return this.clientService.createClient(createClientDto);
  }

  @Get()
  async getClients(
    @Query(new ValidationPipe({ transform: true })) searchDto: ClientSearchDto
  ): Promise<ClientListResponseDto> {
    return this.clientService.getClients(searchDto);
  }

  @Get('search')
  async searchClients(
    @Query('q') query: string
  ): Promise<ClientResponseDto[]> {
    return this.clientService.searchClients(query);
  }

  @Get(':id')
  async getClientById(
    @Param('id', ParseIntPipe) id: number
  ): Promise<ClientResponseDto> {
    return this.clientService.getClientById(id);
  }

  @Put(':id')
  async updateClient(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateClientDto: UpdateClientDto
  ): Promise<ClientResponseDto> {
    return this.clientService.updateClient(id, updateClientDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteClient(
    @Param('id', ParseIntPipe) id: number
  ): Promise<void> {
    return this.clientService.deleteClient(id);
  }

  // Vehicle management endpoints
  @Post(':id/vehicles')
  @HttpCode(HttpStatus.CREATED)
  async addVehicleToClient(
    @Param('id', ParseIntPipe) clientId: number,
    @Body(ValidationPipe) createVehicleDto: CreateVehicleDto
  ): Promise<ClientResponseDto> {
    return this.clientService.addVehicleToClient(clientId, createVehicleDto);
  }

  @Delete(':id/vehicles/:vehicleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeVehicleFromClient(
    @Param('id', ParseIntPipe) clientId: number,
    @Param('vehicleId') vehicleId: string
  ): Promise<ClientResponseDto> {
    return this.clientService.removeVehicleFromClient(clientId, vehicleId);
  }
}
