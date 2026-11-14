import { z } from 'zod';

export const createTodoSchema = z.strictObject({
  name: z.string().trim().min(1),
  responsible: z.string().trim().min(1),
});

export type CreateTodoDto = z.infer<typeof createTodoSchema>;
