import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  estimatedHours: number;

  @IsDateString()
  dueDate: string;

  @IsOptional()
  @IsNumber()
  cost?: number;

  @IsArray()
  userIds: string[];
}
