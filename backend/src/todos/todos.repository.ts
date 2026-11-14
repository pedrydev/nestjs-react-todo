import { Todo } from './todo.entity.js';
import { TodoStatus } from './todo-status.js';

export interface CreateTodoData {
  name: string;
  responsible: string;
}

export interface TodosFilter {
  name?: string;
  status?: TodoStatus;
  responsible?: string;
}

export interface TodosRepository {
  create(data: CreateTodoData): Promise<Todo>;
  findAll(filter: TodosFilter): Promise<Todo[]>;
  findById(id: string): Promise<Todo | null>;
  updateStatus(id: string, status: TodoStatus): Promise<Todo | null>;
}

export const TODOS_REPOSITORY = Symbol('TODOS_REPOSITORY');
