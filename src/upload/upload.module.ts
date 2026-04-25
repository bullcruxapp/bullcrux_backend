import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { UploadController } from './upload.controller'

@Module({
  imports: [PrismaModule],
  controllers: [UploadController],
  providers: [],
  exports: [],
})
export class UploadModule {}