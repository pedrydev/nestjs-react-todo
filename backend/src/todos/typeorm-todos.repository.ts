import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './todo.entity.js';
import { TodoStatus } from './todo-status.js';
import {
  CreateTodoData,
  TodosFilter,
  TodosRepository,
} from './todos.repository.js';

function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}

@Injectable()
export class TypeOrmTodosRepository implements TodosRepository {
  constructor(
    @InjectRepository(Todo)
    private readonly repository: Repository<Todo>,
  ) {}

  create(data: CreateTodoData): Promise<Todo> {
    const todo = this.repository.create({
      ...data,
      status: TodoStatus.Created,
    });
    return this.repository.save(todo);
  }

  findAll(filter: TodosFilter): Promise<Todo[]> {
    const query = this.repository.createQueryBuilder('todo');

    if (filter.name) {
      query.andWhere('todo.name ILIKE :name', {
        name: `%${escapeLikePattern(filter.name)}%`,
      });
    }

    if (filter.responsible) {
      query.andWhere('todo.responsible ILIKE :responsible', {
        responsible: `%${escapeLikePattern(filter.responsible)}%`,
      });
    }

    if (filter.status) {
      query.andWhere('todo.status = :status', { status: filter.status });
    }

    return query.orderBy('todo.name', 'ASC').getMany();
  }

  findById(id: string): Promise<Todo | null> {
    return this.repository.findOneBy({ id });
  }

  async updateStatus(id: string, status: TodoStatus): Promise<Todo | null> {
    const todo = await this.findById(id);

    if (!todo) {
      return null;
    }

    todo.status = status;
    return this.repository.save(todo);
  }
}
