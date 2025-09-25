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
import { DiscountService } from './discount.service';
import {
  CreateDiscountDto,
  UpdateDiscountDto,
  DiscountSearchDto,
  DiscountResponseDto,
  DiscountListResponseDto,
} from '../../common/dto';

@Controller('discounts')
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Get()
  async findAll(
    @Query(new ValidationPipe({ transform: true })) searchParams: DiscountSearchDto
  ): Promise<DiscountListResponseDto> {
    return this.discountService.findAll(searchParams);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<DiscountResponseDto> {
    return this.discountService.findOne(+id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(ValidationPipe) createDiscountDto: CreateDiscountDto
  ): Promise<DiscountResponseDto> {
    return this.discountService.create(createDiscountDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateDiscountDto: UpdateDiscountDto
  ): Promise<DiscountResponseDto> {
    return this.discountService.update(+id, updateDiscountDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.discountService.remove(+id);
  }
}
