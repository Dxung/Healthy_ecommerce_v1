import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import type { ILocationService } from './location.service.interface';
import { LOCATION_SERVICE } from './tokens/location.token';
import {
  ProvinceResponseDto,
  DistrictResponseDto,
  WardResponseDto,
} from './dto';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import { LocationErrorHttpMapper } from './errors/location-errors-http.mapper';

/**
 * Controller responsible for handling location-related requests.
 * Route: /locations
 * No authentication required - public endpoints for cascading dropdowns
 */
@ApiTags('Locations')
@Controller('locations')
export class LocationController {
  constructor(
    @Inject(LOCATION_SERVICE)
    private readonly locationService: ILocationService,
  ) {}

  /**
   * Gets all provinces/cities in Vietnam.
   * @returns Array of provinces
   */
  @Get('provinces')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all provinces/cities' })
  async getProvinces(): Promise<ProvinceResponseDto[]> {
    return this.locationService.getAllProvinces().match(
      (provinces) =>
        provinces.map((province) => new ProvinceResponseDto(province)),
      (error) => {
        throw LocationErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Gets districts by province ID.
   * @param provinceId - The province ID
   * @returns Array of districts
   */
  @Get('districts')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get districts by province' })
  @ApiQuery({
    name: 'provinceId',
    required: true,
    description: 'Province ID',
    example: '01',
  })
  async getDistricts(
    @Query('provinceId') provinceId: string,
  ): Promise<DistrictResponseDto[]> {
    return this.locationService.getDistrictsByProvince(provinceId).match(
      (districts) =>
        districts.map((district) => new DistrictResponseDto(district)),
      (error) => {
        throw LocationErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Gets wards by district ID.
   * @param districtId - The district ID
   * @returns Array of wards
   */
  @Get('wards')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get wards by district' })
  @ApiQuery({
    name: 'districtId',
    required: true,
    description: 'District ID',
    example: '001',
  })
  async getWards(
    @Query('districtId') districtId: string,
  ): Promise<WardResponseDto[]> {
    return this.locationService.getWardsByDistrict(districtId).match(
      (wards) => wards.map((ward) => new WardResponseDto(ward)),
      (error) => {
        throw LocationErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }
}
