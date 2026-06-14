import { Module } from '@nestjs/common';
import { DrawService } from './draw.service';
import { DrawController } from './draw.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AdminGuard } from './admin.guard';

@Module({
  imports: [PrismaModule],
  controllers: [DrawController],
  providers: [DrawService, AdminGuard],
})
export class DrawModule {}
