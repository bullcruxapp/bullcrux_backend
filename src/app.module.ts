import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { RaffleModule } from './raffle/raffle.module';
import { TicketModule } from './ticket/ticket.module';
import { PaymentsModule } from './payment/payment.module';
import { UploadModule } from './upload/upload.module';
import { DrawModule } from './draw/draw.module';
import { FavoriteModule } from './favorite/favorite.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    RaffleModule,
    TicketModule,
    PaymentsModule,
    UploadModule,
    DrawModule,
    FavoriteModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [],
  providers: [],
})

export class AppModule { }
