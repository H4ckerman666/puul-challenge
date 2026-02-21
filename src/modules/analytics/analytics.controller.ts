import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener métricas y analíticas del sistema' })
  @ApiResponse({ status: 200, description: 'Analíticas del sistema' })
  findAnalytics() {
    return this.analyticsService.findAnalytics();
  }
}
