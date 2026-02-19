import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto } from '../tasks/dto/create-task.dto';
import { FilterTasksDto } from '../tasks/dto/filter-tasks.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateTaskDto) {
    const { userIds, ...taskData } = data;

    return this.prisma.task.create({
      data: {
        ...taskData,
        dueDate: new Date(taskData.dueDate),

        assignments: {
          create: userIds.map((userId) => ({
            user: {
              connect: { id: userId },
            },
          })),
        },
      },

      include: {
        assignments: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async findAll(filters: FilterTasksDto) {
    const where: any = {};

    // Filtro por título
    if (filters.title) {
      where.title = { contains: filters.title, mode: 'insensitive' };
    }

    // Filtro por estado
    if (filters.status) {
      where.status = filters.status;
    }

    // Filtro por fecha de vencimiento
    if (filters.dueDate) {
      where.dueDate = new Date(filters.dueDate);
    }

    // Filtro por usuario asignado (ID)
    if (filters.userId) {
      where.assignments = {
        some: { userId: filters.userId },
      };
    }

    // Filtro por nombre de usuario
    if (filters.userName) {
      where.assignments = {
        some: {
          user: {
            name: { contains: filters.userName, mode: 'insensitive' },
          },
        },
      };
    }

    // Filtro por email de usuario
    if (filters.userEmail) {
      where.assignments = {
        some: {
          user: {
            email: { contains: filters.userEmail, mode: 'insensitive' },
          },
        },
      };
    }

    return this.prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        assignments: {
          include: {
            user: true,
          },
        },
      },
    });
  }
}
