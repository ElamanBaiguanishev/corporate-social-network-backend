import { IsString, IsEnum, IsOptional, IsNumber, IsDate } from 'class-validator';
import { TaskPriority, TaskStatus } from '../entities/task.entity';

export class CreateTaskDto {
    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsEnum(TaskPriority)
    @IsOptional()
    priority?: TaskPriority;

    @IsEnum(TaskStatus)
    @IsOptional()
    status?: TaskStatus;

    @IsNumber()
    @IsOptional()
    assigneeId?: number;

    @IsDate()
    @IsOptional()
    dueDate?: Date;
} 