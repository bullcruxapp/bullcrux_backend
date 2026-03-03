import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { RaffleModule } from './raffle/raffle.module';
import { TicketModule } from './ticket/ticket.module';
import { PaymentsModule } from './payment/payment.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    RaffleModule,
    TicketModule,
    PaymentsModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [],
  providers: [],
})

export class AppModule { }
