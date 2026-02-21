import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getTopUsers() {
    return await this.prisma.$queryRaw<
      { user_id: string; name: string; completed_tasks: number }[]
    >`
      SELECT 
        u.id as user_id,
        u.name,
        COUNT(ta.task_id)::int as completed_tasks
      FROM users u
      JOIN task_assignments ta ON ta.user_id = u.id
      JOIN tasks t ON t.id = ta.task_id
      WHERE t.status = 'COMPLETED'
      GROUP BY u.id, u.name
      ORDER BY completed_tasks DESC
      LIMIT 5;
    `;
  }

  private classify(stdDev: number): string {
    if (stdDev < 1) return 'LOW_VARIANCE';
    if (stdDev < 3) return 'MEDIUM_VARIANCE';
    return 'HIGH_VARIANCE';
  }

  private getInsight(task: { std_dev: number; users: number }): string {
    if (task.std_dev > 3 && task.users > 3) {
      return 'Distribución desigual de trabajo';
    }

    if (task.std_dev < 1) {
      return 'Trabajo bien balanceado';
    }

    return 'Variación normal';
  }

  async getTaskVariance() {
    const data = await this.prisma.$queryRaw<
      {
        task_id: string;
        users: number;
        total_hours: number;
        avg_hours: number;
        std_dev: number;
      }[]
    >`
      SELECT 
        t.id as task_id,
        COUNT(ta.user_id)::int as users,
        SUM(ta.hours_worked)::float as total_hours,
        AVG(ta.hours_worked)::float as avg_hours,
        COALESCE(STDDEV_POP(ta.hours_worked), 0)::float as std_dev
      FROM tasks t
      JOIN task_assignments ta ON ta.task_id = t.id
      GROUP BY t.id
      ORDER BY std_dev DESC;
    `;

    return data.map((t) => ({
      ...t,
      classification: this.classify(t.std_dev),
      insight: this.getInsight(t),
    }));
  }

  async findAnalytics() {
    const now = new Date();

    const [
      totalTasks,
      completedTasks,
      activeTasks,
      overdueTasks,
      completedCostAgg,
      avgHours,
    ] = await Promise.all([
      this.prisma.task.count(),
      this.prisma.task.count({
        where: { status: 'COMPLETED' },
      }),
      this.prisma.task.count({
        where: { status: 'ACTIVE' },
      }),
      this.prisma.task.count({
        where: { status: 'ACTIVE', dueDate: { lt: now } },
      }),
      this.prisma.task.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { cost: true },
      }),
      this.prisma.task.aggregate({
        _avg: { estimatedHours: true },
      }),
    ]);

    const [topUsers, taskVariance] = await Promise.all([
      this.getTopUsers(),
      this.getTaskVariance(),
    ]);

    return {
      taskGeneralReport: {
        totalTasks,
        activeTasks,
        completedTasks,
        overdueTasks,
        totalCompletedCost: completedCostAgg._sum.cost ?? 0,
        averageEstimatedHoursPerTask: parseFloat(
          (avgHours._avg.estimatedHours ?? 0).toFixed(1),
        ),
      },
      topUsers,
      taskVariance,
    };
  }
}
