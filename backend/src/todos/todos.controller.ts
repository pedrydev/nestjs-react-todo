import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { z } from 'zod';
import { createTodoSchema } from './dto/create-todo.dto.js';
import type { CreateTodoDto } from './dto/create-todo.dto.js';
import { listTodosQuerySchema } from './dto/list-todos-query.dto.js';
import type { ListTodosQueryDto } from './dto/list-todos-query.dto.js';
import { updateTodoStatusSchema } from './dto/update-todo-status.dto.js';
import type { UpdateTodoStatusDto } from './dto/update-todo-status.dto.js';
import { TodosService } from './todos.service.js';

const todoIdSchema = z.uuid();

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  create(@Body({ schema: createTodoSchema }) dto: CreateTodoDto) {
    return this.todosService.create(dto);
  }

  @Get()
  findAll(
    @Query({ schema: listTodosQuerySchema }) query: ListTodosQueryDto,
  ) {
    return this.todosService.findAll(query);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', { schema: todoIdSchema }) id: string,
    @Body({ schema: updateTodoStatusSchema }) dto: UpdateTodoStatusDto,
  ) {
    return this.todosService.updateStatus(id, dto.status);
  }
}
