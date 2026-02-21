import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Título de la tarea',
    example: 'Desarrollar API de usuarios',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada de la tarea',
    example: 'Crear endpoints CRUD para gestión de usuarios',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Horas estimadas para completar la tarea',
    example: 8.5,
  })
  @IsNumber()
  estimatedHours: number;

  @ApiProperty({
    description: 'Fecha de vencimiento de la tarea',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsDateString()
  dueDate: string;

  @ApiPropertyOptional({
    description: 'Costo asociado a la tarea',
    example: 1000,
  })
  @IsOptional()
  @IsNumber()
  cost?: number;

  @ApiProperty({
    description: 'Array de IDs de usuarios asignados a la tarea',
    type: [String],
    example: ['uuid1', 'uuid2'],
  })
  @IsArray()
  userIds: string[];
}
