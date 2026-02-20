import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
    const where: Prisma.TaskWhereInput = {};

    if (filters.title) {
      where.title = { contains: filters.title, mode: 'insensitive' };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.dueDate) {
      where.dueDate = new Date(filters.dueDate);
    }

    if (filters.userId || filters.userName || filters.userEmail) {
      const assignmentWhere: Prisma.TaskAssignmentWhereInput = {};

      if (filters.userId) {
        assignmentWhere.userId = filters.userId;
      }

      if (filters.userName || filters.userEmail) {
        assignmentWhere.user = {
          ...(filters.userName && {
            name: { contains: filters.userName, mode: 'insensitive' },
          }),
          ...(filters.userEmail && {
            email: { contains: filters.userEmail, mode: 'insensitive' },
          }),
        };
      }

      where.assignments = { some: assignmentWhere };
    }

    return this.prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      // include: {
      //   assignments: {
      //     include: {
      //       user: true,
      //     },
      //   },
      // },
    });
  }
}
