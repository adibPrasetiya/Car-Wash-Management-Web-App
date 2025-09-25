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
import { ServiceService } from './service.service';
import {
  CreateServiceDto,
  UpdateServiceDto,
  ServiceSearchDto,
  ServiceResponseDto,
  ServiceListResponseDto,
} from '../../common/dto';

@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get()
  async findAll(
    @Query(new ValidationPipe({ transform: true })) searchParams: ServiceSearchDto
  ): Promise<ServiceListResponseDto> {
    return this.serviceService.findAll(searchParams);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ServiceResponseDto> {
    return this.serviceService.findOne(+id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(ValidationPipe) createServiceDto: CreateServiceDto
  ): Promise<ServiceResponseDto> {
    return this.serviceService.create(createServiceDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateServiceDto: UpdateServiceDto
  ): Promise<ServiceResponseDto> {
    return this.serviceService.update(+id, updateServiceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.serviceService.remove(+id);
  }
}
