import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { ListTodosQueryDto } from './dto/list-todos-query.dto.js';
import { Todo } from './todo.entity.js';
import { TodoStatus } from './todo-status.js';
import { TODOS_REPOSITORY } from './todos.repository.js';
import type { TodosRepository } from './todos.repository.js';

@Injectable()
export class TodosService {
  constructor(
    @Inject(TODOS_REPOSITORY)
    private readonly repository: TodosRepository,
  ) {}

  create(dto: CreateTodoDto): Promise<Todo> {
    return this.repository.create({
      name: dto.name.trim(),
      responsible: dto.responsible.trim(),
    });
  }

  findAll(query: ListTodosQueryDto): Promise<Todo[]> {
    return this.repository.findAll({
      name: query.name?.trim() || undefined,
      responsible: query.responsible?.trim() || undefined,
      status: query.status,
    });
  }

  async updateStatus(id: string, status: TodoStatus): Promise<Todo> {
    const todo = await this.repository.updateStatus(id, status);

    if (!todo) {
      throw new NotFoundException(`Todo ${id} not found`);
    }

    return todo;
  }
}
