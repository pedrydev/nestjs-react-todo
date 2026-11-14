import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { StandardSchemaValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { typeOrmOptions } from './database/typeorm.config.js';
import { TodosModule } from './todos/todos.module.js';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmOptions()), TodosModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: StandardSchemaValidationPipe,
    },
  ],
})
export class AppModule {}
