import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { FilterUsersDto } from './dto/filter-users.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateUserDto) {
    return this.prisma.user.create({ data });
  }

  async findAll(filters: FilterUsersDto) {
    const where: Prisma.UserWhereInput = {};

    if (filters.name) {
      where.name = { contains: filters.name, mode: 'insensitive' };
    }

    if (filters.email) {
      where.email = filters.email;
    }

    if (filters.role) {
      where.role = filters.role;
    }

    const users = await this.prisma.user.findMany({
      where,
      include: {
        assignments: {
          where: {
            task: {
              status: 'COMPLETED',
            },
          },
          include: {
            task: true,
          },
        },
      },
    });

    return users.map((user) => {
      const completedTasks = user.assignments.length;
      const totalCost = user.assignments.reduce(
        (sum, assignment) => sum + assignment.task.cost,
        0,
      );

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        completedTasks,
        totalCost,
      };
    });
  }
}
