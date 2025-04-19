import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';

import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { ILike, Repository } from 'typeorm';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private tasksRepository: Repository<Task>,
  ) {}

  async getTasks(filterDto: GetTasksFilterDto): Promise<Task[]> {
    const { status, search } = filterDto;

    const where = search
      ? [
          { status, title: ILike(`%${search}%`) },
          { status, description: ILike(`%${search}%`) },
        ]
      : { status };

    return this.tasksRepository.find({ where });
  }

  async getTaskById(id: string): Promise<Task> {
    const found = await this.tasksRepository.findOneBy({ id });

    if (!found) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }

    return found;
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const { title, description } = createTaskDto;
    const task = this.tasksRepository.create({
      title,
      description,
      status: TaskStatus.OPEN,
    });

    await this.tasksRepository.save(task);
    return task;
  }

  async deleteTask(id: string): Promise<void> {
    const res = await this.tasksRepository.delete(id);
    if (res.affected === 0) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
  }

  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
    const task = await this.getTaskById(id);

    task.status = status;
    await this.tasksRepository.save(task);

    return task;
  }
}
