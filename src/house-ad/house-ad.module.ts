import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HouseAdController } from './house-ad.controller';
import { HouseAdService } from './house-ad.service';

@Module({
  imports: [PrismaModule],
  controllers: [HouseAdController],
  providers: [HouseAdService],
})
export class HouseAdModule {}
