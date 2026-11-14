import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo } from './todo.entity.js';
import { TODOS_REPOSITORY } from './todos.repository.js';
import { TodosController } from './todos.controller.js';
import { TodosService } from './todos.service.js';
import { TypeOrmTodosRepository } from './typeorm-todos.repository.js';

@Module({
  imports: [TypeOrmModule.forFeature([Todo])],
  controllers: [TodosController],
  providers: [
    TodosService,
    {
      provide: TODOS_REPOSITORY,
      useClass: TypeOrmTodosRepository,
    },
  ],
})
export class TodosModule {}
