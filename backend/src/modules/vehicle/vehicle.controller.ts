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
  ValidationPipe
} from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import {
  CreateVehicleStandaloneDto,
  UpdateVehicleStandaloneDto,
  VehicleSearchDto,
  VehicleDetailResponseDto,
  VehicleListResponseDto
} from '../../common/dto';

@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createVehicle(
    @Body(ValidationPipe) createVehicleDto: CreateVehicleStandaloneDto
  ): Promise<VehicleDetailResponseDto> {
    return this.vehicleService.createVehicle(createVehicleDto);
  }

  @Get()
  async getVehicles(
    @Query() searchDto: VehicleSearchDto
  ): Promise<VehicleListResponseDto> {
    return this.vehicleService.getVehicles(searchDto);
  }

  @Get('search')
  async searchVehicles(
    @Query('q') query: string
  ): Promise<VehicleDetailResponseDto[]> {
    return this.vehicleService.searchVehicles(query);
  }

  @Get('client/:clientId')
  async getVehiclesByClientId(
    @Param('clientId') clientId: string
  ): Promise<VehicleDetailResponseDto[]> {
    return this.vehicleService.getVehiclesByClientId(parseInt(clientId));
  }

  @Get(':id')
  async getVehicleById(
    @Param('id') id: string
  ): Promise<VehicleDetailResponseDto> {
    return this.vehicleService.getVehicleById(id);
  }

  @Put(':id')
  async updateVehicle(
    @Param('id') id: string,
    @Body(ValidationPipe) updateVehicleDto: UpdateVehicleStandaloneDto
  ): Promise<VehicleDetailResponseDto> {
    return this.vehicleService.updateVehicle(id, updateVehicleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteVehicle(
    @Param('id') id: string
  ): Promise<void> {
    return this.vehicleService.deleteVehicle(id);
  }
}
