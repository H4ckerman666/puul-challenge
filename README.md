## 🧠 Task Management API

## 📌 Descripción

API REST para la **gestión de tareas en equipos**, desarrollada como challenge técnico backend. Permite crear usuarios, asignar tareas a múltiples personas, gestionar estados, registrar horas trabajadas y consultar analíticas del sistema.

**Principales capacidades:**
- CRUD de usuarios con roles (`MEMBER`, `ADMIN`)
- CRUD de tareas con asignación a varios usuarios
- Filtros y ordenación en listados
- Métricas generales, top usuarios y análisis de distribución de trabajo por tarea

## ⚙️ Tecnologías

| Tecnología | Uso |
|-----------|-----|
| **Node.js** | Runtime JavaScript |
| **NestJS** | Framework backend modular (módulos, controladores, servicios) |
| **TypeScript** | Tipado estático |
| **Prisma** | ORM para PostgreSQL (migraciones, tipos generados) |
| **PostgreSQL** | Base de datos relacional |
| **class-validator / class-transformer** | Validación y transformación de DTOs en los endpoints |

## 🏗️ Arquitectura

El proyecto sigue la estructura modular de NestJS:

```text
src/
├── main.ts                 
├── app.module.ts           
├── app.controller.ts       
├── prisma/
│   ├── prisma.module.ts    
│   └── prisma.service.ts   
└── modules/
    ├── users/              # Usuarios
    │   ├── users.module.ts
    │   ├── users.controller.ts   # POST /users, GET /users
    │   ├── users.service.ts
    │   └── dto/
    ├── tasks/              # Tareas
    │   ├── tasks.module.ts
    │   ├── tasks.controller.ts   # POST/GET/PATCH/DELETE /tasks
    │   ├── tasks.service.ts
    │   └── dto/
    └── analytics/           # Analítica
        ├── analytics.module.ts
        ├── analytics.controller.ts   # GET /analytics
        └── analytics.service.ts
```

- **Controllers**: exponen rutas y delegan en servicios.
- **Services**: lógica de negocio y acceso a datos vía `PrismaService`.
- **DTOs**: validación con `class-validator` en body/query.

## 🗄️ Modelo de Datos

### User
- **id** (`String`, UUID)
- **name** (`String`)
- **email** (`String`, único)
- **role** (`UserRole`: `MEMBER` \| `ADMIN`, default `MEMBER`)
- **createdAt**, **updatedAt**
- Relación muchos a muchos con `Task` a través de `TaskAssignment`.

### Task
- **id** (`String`, UUID)
- **title** (`String`)
- **description** (`String?`)
- **estimatedHours** (`Float`)
- **dueDate** (`DateTime`)
- **status** (`TaskStatus`: `ACTIVE` \| `COMPLETED`, default `ACTIVE`)
- **cost** (`Float`, default `0`)
- **createdAt**, **updatedAt**
- Relación muchos a muchos con `User` vía `TaskAssignment`.

### TaskAssignment
- **id** (`String`, UUID)
- **userId** (`String`)
- **taskId** (`String`)
- **hoursWorked** (`Float`, default `0`)
- **createdAt** (`DateTime`)
- Relación:
  - `user`: `User` (onDelete: `Cascade`)
  - `task`: `Task` (onDelete: `Cascade`)
- Restricción única `(userId, taskId)`

Relaciones:

```text
User ←── TaskAssignment ──→ Task
```

## 🚀 Instalación

### Requisitos
- **Docker**
- **Docker Compose**
- (Opcional) **Node.js** (v18+ recomendado) y **npm** si quieres ejecutar la API fuera de Docker

### Opción 1: usar Docker Compose (recomendada)

1. **Clonar el repositorio**

   ```bash
   git clone https://github.com/H4ckerman666/puul-challenge.git
   cd challenge
   ```

2. **Levantar la API y la base de datos con Docker Compose**

   ```bash
   docker compose up -d --build
   ```

   Esto va a:
   - Levantar un contenedor de **PostgreSQL** (`db`).
   - Construir la imagen de la API NestJS.
   - Ejecutar `prisma migrate deploy` y `prisma db seed`.
   - Iniciar la API en el puerto `3000`.

3. **Probar la API**

   La API quedará disponible en:

   - `http://localhost:3000`

   La base de datos PostgreSQL estará disponible en:

   - `localhost:5432` (usuario: `postgres`, contraseña: `postgres`, base de datos: `puul_db`)

### Opción 2: ejecución local sin Docker

1. **Instalar dependencias**

   ```bash
   npm install
   ```

2. **Configurar variables de entorno**

   Crear un archivo `.env` en la raíz con:

   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
   PORT=3000
   ```

   Ajusta `USER`, `PASSWORD`, `HOST`, `PORT` y `DATABASE` según tu entorno.

3. **Generar cliente Prisma y aplicar migraciones**

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

4. **(Opcional) Poblar datos de prueba**

   ```bash
   npm run db:seed
   ```

5. **Arrancar la aplicación**

   ```bash
   npm run start:dev
   ```

   La API quedará disponible en `http://localhost:3000` (o el `PORT` definido).

## 📡 API – Resumen de endpoints

### Usuarios (`/users`)

| Método | Ruta     | Descripción |
|--------|----------|-------------|
| POST   | `/users` | Crear usuario (`name`, `email`, `role` opcional) |
| GET    | `/users` | Listar usuarios; filtros por `name`, `email`, `role`. La respuesta incluye: número de tareas completadas y suma del coste de tareas completadas por usuario |

### Tareas (`/tasks`)

| Método | Ruta        | Descripción |
|--------|-------------|-------------|
| POST   | `/tasks`    | Crear tarea (`title`, `estimatedHours`, `dueDate`, `userIds[]`, y opcionalmente `description`, `cost`) |
| GET    | `/tasks`    | Listar tareas con filtros: `title`, `status`, `dueDate`, `userId`, `userName`, `userEmail`. Ordenadas por `createdAt` descendente |
| PATCH  | `/tasks/:id`| Actualizar tarea (cualquiera de los campos y reasignación con `userIds`) |
| DELETE | `/tasks/:id`| Eliminar tarea (y sus asignaciones relacionadas) |

### Analítica (`/analytics`)

| Método | Ruta        | Descripción |
|--------|-------------|-------------|
| GET    | `/analytics`| Métricas generales, top usuarios y variabilidad de trabajo por tarea |

Respuesta de ejemplo (estructura):

```json
{
  "taskGeneralReport": {
    "totalTasks": 0,
    "activeTasks": 0,
    "completedTasks": 0,
    "overdueTasks": 0,
    "totalCompletedCost": 0,
    "averageEstimatedHoursPerTask": 0
  },
  "topUsers": [
    {
      "user_id": "uuid",
      "name": "User Name",
      "completed_tasks": 5
    }
  ],
  "taskVariance": [
    {
      "task_id": "uuid",
      "users": 3,
      "total_hours": 20,
      "avg_hours": 6.67,
      "std_dev": 1.2,
      "classification": "MEDIUM_VARIANCE",
      "insight": "Trabajo bien balanceado"
    }
  ]
}
```

- **Métricas generales**:
  - Total de tareas
  - Tareas activas
  - Tareas completadas
  - Tareas vencidas (`ACTIVE` con `dueDate` pasada)
  - Costo total de tareas completadas
  - Promedio de horas estimadas por tarea
- **Top 5 usuarios más productivos**: según número de tareas completadas.
- **Distribución de trabajo por tarea**:
  - Total de horas trabajadas (`total_hours`)
  - Promedio de horas por usuario (`avg_hours`)
  - Desviación estándar (`std_dev`)
  - Clasificación (`LOW_VARIANCE`, `MEDIUM_VARIANCE`, `HIGH_VARIANCE`)
  - Insight automático sobre el balance de carga.
  
## 📄 Licencia

UNLICENSED – Proyecto privado/challenge.
