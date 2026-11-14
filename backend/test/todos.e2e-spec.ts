import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module.js';
import { Todo } from './../src/todos/todo.entity.js';
import { TodoStatus } from './../src/todos/todo-status.js';

describe('Todos (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    dataSource = app.get(DataSource);
  });

  beforeEach(async () => {
    await dataSource.getRepository(Todo).clear();
  });

  afterAll(async () => {
    await app.close();
  });

  function server() {
    return request(app.getHttpServer());
  }

  describe('POST /todos', () => {
    it('creates a todo with status created and trimmed values', async () => {
      const response = await server()
        .post('/todos')
        .send({ name: '  Buy milk  ', responsible: '  Ana  ' })
        .expect(201);

      expect(response.body).toMatchObject({
        name: 'Buy milk',
        responsible: 'Ana',
        status: TodoStatus.Created,
      });
      expect(response.body.id).toEqual(expect.any(String));
    });

    it('rejects a blank name', async () => {
      await server()
        .post('/todos')
        .send({ name: '   ', responsible: 'Ana' })
        .expect(400);
    });

    it('rejects a blank responsible', async () => {
      await server()
        .post('/todos')
        .send({ name: 'Buy milk', responsible: '' })
        .expect(400);
    });

    it('rejects a status in the create payload', async () => {
      await server()
        .post('/todos')
        .send({ name: 'Buy milk', responsible: 'Ana', status: 'completed' })
        .expect(400);
    });
  });

  describe('GET /todos', () => {
    beforeEach(async () => {
      await server()
        .post('/todos')
        .send({ name: 'Buy milk', responsible: 'Ana' })
        .expect(201);
      const walkDog = await server()
        .post('/todos')
        .send({ name: 'Walk dog', responsible: 'Bob' })
        .expect(201);
      await server()
        .patch(`/todos/${walkDog.body.id}/status`)
        .send({ status: 'completed' })
        .expect(200);
    });

    it('lists every todo', async () => {
      const response = await server().get('/todos').expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('filters by name case-insensitively and partially', async () => {
      const response = await server().get('/todos?name=MILK').expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Buy milk');
    });

    it('filters by responsible case-insensitively and partially', async () => {
      const response = await server().get('/todos?responsible=bo').expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].responsible).toBe('Bob');
    });

    it('filters by exact status', async () => {
      const response = await server()
        .get('/todos?status=completed')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Walk dog');
    });

    it('combines filters', async () => {
      const response = await server()
        .get('/todos?name=dog&responsible=bob&status=completed')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Walk dog');
    });

    it('rejects an unknown status', async () => {
      await server().get('/todos?status=archived').expect(400);
    });
  });

  describe('PATCH /todos/:id/status', () => {
    it('updates the status', async () => {
      const created = await server()
        .post('/todos')
        .send({ name: 'Buy milk', responsible: 'Ana' })
        .expect(201);

      const response = await server()
        .patch(`/todos/${created.body.id}/status`)
        .send({ status: 'deleted' })
        .expect(200);

      expect(response.body).toMatchObject({
        id: created.body.id,
        status: TodoStatus.Deleted,
      });
    });

    it('rejects an unknown status', async () => {
      const created = await server()
        .post('/todos')
        .send({ name: 'Buy milk', responsible: 'Ana' })
        .expect(201);

      await server()
        .patch(`/todos/${created.body.id}/status`)
        .send({ status: 'archived' })
        .expect(400);
    });

    it('rejects a malformed id', async () => {
      await server()
        .patch('/todos/not-a-uuid/status')
        .send({ status: 'completed' })
        .expect(400);
    });

    it('returns 404 for an id that does not exist', async () => {
      await server()
        .patch('/todos/00000000-0000-4000-8000-000000000000/status')
        .send({ status: 'completed' })
        .expect(404);
    });
  });
});
