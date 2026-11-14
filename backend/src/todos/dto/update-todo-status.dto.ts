import { z } from 'zod';
import { TodoStatus } from '../todo-status.js';

export const updateTodoStatusSchema = z.strictObject({
  status: z.enum(TodoStatus),
});

export type UpdateTodoStatusDto = z.infer<typeof updateTodoStatusSchema>;
