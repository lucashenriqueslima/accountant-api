import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { BoardsModule } from './modules/boards/boards.module';
import { CardTemplatesModule } from './modules/card-templates/card-templates.module';
import { CardTypesModule } from './modules/card-types/card-types.module';
import { CardsModule } from './modules/cards/cards.module';
import { ClientsModule } from './modules/clients/clients.module';
import { ColumnsModule } from './modules/columns/columns.module';
import { MailModule } from './modules/mail/mail.module';
import { StorageModule } from './modules/storage/storage.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    PrismaModule,
    StorageModule,
    MailModule,
    AuthModule,
    UsersModule,
    ClientsModule,
    BoardsModule,
    ColumnsModule,
    CardsModule,
    CardTypesModule,
    CardTemplatesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
