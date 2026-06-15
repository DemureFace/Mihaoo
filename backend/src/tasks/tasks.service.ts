import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        userId,
      },
    });
  }

  findAll(userId: string, query: any, role: string) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;

    return this.prisma.task.findMany({
      where: {
        userId,

        ...(query.isDone !== undefined && {
          isDone: query.isDone === 'true',
        }),
        ...(role !== 'ADMIN' && { userId }),
        ...(query.search && {
          title: {
            contains: query.search,
            mode: 'insensitive',
          },
        }),
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(taskId: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.userId !== userId) {
      throw new ForbiddenException('You do not have access to this task');
    }

    return task;
  }

  async update(taskId: string, userId: string, dto: UpdateTaskDto) {
    await this.findOne(taskId, userId);

    return this.prisma.task.update({
      where: { id: taskId },
      data: dto,
    });
  }

  async remove(taskId: string, userId: string) {
    await this.findOne(taskId, userId);

    await this.prisma.task.delete({
      where: { id: taskId },
    });

    return { message: 'Task deleted successfully' };
  }
}
