import { NotFoundException } from '@nestjs/common';
import { TodoStatus } from './todo-status.js';
import { Todo } from './todo.entity.js';
import { TodosRepository } from './todos.repository.js';
import { TodosService } from './todos.service.js';

function createRepositoryMock() {
  const create = vi.fn<TodosRepository['create']>();
  const findAll = vi.fn<TodosRepository['findAll']>();
  const findById = vi.fn<TodosRepository['findById']>();
  const updateStatus = vi.fn<TodosRepository['updateStatus']>();

  const repository: TodosRepository = {
    create,
    findAll,
    findById,
    updateStatus,
  };

  return { repository, create, findAll, findById, updateStatus };
}

function todo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: 'id-1',
    name: 'Task',
    status: TodoStatus.Created,
    responsible: 'Ana',
    ...overrides,
  };
}

describe('TodosService', () => {
  let mocks: ReturnType<typeof createRepositoryMock>;
  let service: TodosService;

  beforeEach(() => {
    mocks = createRepositoryMock();
    service = new TodosService(mocks.repository);
  });

  describe('create', () => {
    it('trims name and responsible before persisting', async () => {
      const created = todo({ name: 'Task', responsible: 'Ana' });
      mocks.create.mockResolvedValue(created);

      await expect(
        service.create({ name: '  Task  ', responsible: '  Ana  ' }),
      ).resolves.toBe(created);

      expect(mocks.create).toHaveBeenCalledWith({
        name: 'Task',
        responsible: 'Ana',
      });
    });
  });

  describe('findAll', () => {
    it('trims filters and drops empty values', async () => {
      mocks.findAll.mockResolvedValue([]);

      await service.findAll({
        name: '  task  ',
        responsible: '   ',
        status: TodoStatus.Completed,
      });

      expect(mocks.findAll).toHaveBeenCalledWith({
        name: 'task',
        responsible: undefined,
        status: TodoStatus.Completed,
      });
    });

    it('passes undefined filters when nothing is provided', async () => {
      mocks.findAll.mockResolvedValue([]);

      await service.findAll({});

      expect(mocks.findAll).toHaveBeenCalledWith({
        name: undefined,
        responsible: undefined,
        status: undefined,
      });
    });
  });

  describe('updateStatus', () => {
    it('returns the updated todo', async () => {
      const updated = todo({ status: TodoStatus.Completed });
      mocks.updateStatus.mockResolvedValue(updated);

      await expect(
        service.updateStatus('id-1', TodoStatus.Completed),
      ).resolves.toBe(updated);
      expect(mocks.updateStatus).toHaveBeenCalledWith(
        'id-1',
        TodoStatus.Completed,
      );
    });

    it('throws NotFoundException when the todo does not exist', async () => {
      mocks.updateStatus.mockResolvedValue(null);

      await expect(
        service.updateStatus('missing', TodoStatus.Deleted),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
