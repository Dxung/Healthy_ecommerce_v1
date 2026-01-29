import { Controller, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { IPenaltyService } from './penalty.service.interface';
import { PENALTY_SERVICE } from './tokens/penalty.token';

@ApiTags('Penalties')
@Controller('penalties')
export class PenaltyController {
  constructor(
    @Inject(PENALTY_SERVICE)
    private readonly penaltyService: IPenaltyService,
  ) {}

  // TODO: Implement penalty controller endpoints
}
