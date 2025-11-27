import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import AppDataSource from 'dataSource.config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { RaffleModule } from './raffle/raffle.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(AppDataSource),
    PrismaModule,
    AuthModule,
    UsersModule,
    RaffleModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [],
  providers: [],
})

export class AppModule { }
