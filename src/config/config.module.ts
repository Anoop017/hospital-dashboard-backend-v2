import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import appConfig from './app.config';
import databaseConfig from './database.config';
import mongodbConfig from './mongodb.config';
import jwtConfig from './jwt.config';
import mailConfig from './mail.config';
import { validate } from './env.validation';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, mongodbConfig, jwtConfig, mailConfig],
      validate,
    }),
  ],
})
export class ConfigModule {}
