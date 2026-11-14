import { z } from 'zod';
import { TodoStatus } from '../todo-status.js';

export const listTodosQuerySchema = z.object({
  name: z.string().trim().optional(),
  responsible: z.string().trim().optional(),
  status: z.enum(TodoStatus).optional(),
});

export type ListTodosQueryDto = z.infer<typeof listTodosQuerySchema>;
