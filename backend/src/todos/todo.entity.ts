import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TodoStatus } from './todo-status.js';

@Entity('todos')
export class Todo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: TodoStatus, default: TodoStatus.Pending })
  status: TodoStatus;

  @Column()
  responsible: string;
}
