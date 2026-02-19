import { PrismaClient, TaskStatus, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Limpiar datos existentes
  await prisma.taskAssignment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  // Crear usuarios
  const user1 = await prisma.user.create({
    data: {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      role: UserRole.ADMIN,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'María García',
      email: 'maria@example.com',
      role: UserRole.MEMBER,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Carlos López',
      email: 'carlos@example.com',
      role: UserRole.MEMBER,
    },
  });

  // Crear tareas
  const task1 = await prisma.task.create({
    data: {
      title: 'Implementar autenticación',
      description: 'Desarrollar login con JWT',
      estimatedHours: 8,
      dueDate: new Date('2026-03-01'),
      status: TaskStatus.COMPLETED,
      cost: 500,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Diseñar base de datos',
      description: 'Crear schema de Prisma',
      estimatedHours: 4,
      dueDate: new Date('2026-02-25'),
      status: TaskStatus.COMPLETED,
      cost: 300,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: 'Desarrollar API REST',
      description: 'Crear endpoints para usuarios y tareas',
      estimatedHours: 16,
      dueDate: new Date('2026-03-10'),
      status: TaskStatus.ACTIVE,
      cost: 1000,
    },
  });

  const task4 = await prisma.task.create({
    data: {
      title: 'Documentar API',
      description: 'Crear documentación con Swagger',
      estimatedHours: 6,
      dueDate: new Date('2026-03-15'),
      status: TaskStatus.ACTIVE,
      cost: 400,
    },
  });

  // Asignar usuarios a tareas
  await prisma.taskAssignment.createMany({
    data: [
      { userId: user1.id, taskId: task1.id, hoursWorked: 8 },
      { userId: user1.id, taskId: task2.id, hoursWorked: 4 },
      { userId: user2.id, taskId: task1.id, hoursWorked: 3 },
      { userId: user2.id, taskId: task3.id, hoursWorked: 5 },
      { userId: user3.id, taskId: task3.id, hoursWorked: 4 },
      { userId: user3.id, taskId: task4.id, hoursWorked: 2 },
    ],
  });

  console.log('✅ Datos de prueba insertados correctamente');
  console.log(`👤 Usuarios: ${await prisma.user.count()}`);
  console.log(`📋 Tareas: ${await prisma.task.count()}`);
  console.log(`🔗 Asignaciones: ${await prisma.taskAssignment.count()}`);
}

main()
  .catch((e) => {
    console.error('❌ Error al insertar datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
