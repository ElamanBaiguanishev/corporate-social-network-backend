import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async create(createTaskDto: CreateTaskDto, creatorId: number): Promise<Task> {
        const creator = await this.userRepository.findOne({ where: { id: creatorId } });
        if (!creator) {
            throw new NotFoundException('Creator not found');
        }

        const task = this.taskRepository.create({
            ...createTaskDto,
            creator
        });

        if (createTaskDto.assigneeId) {
            const assignee = await this.userRepository.findOne({ where: { id: createTaskDto.assigneeId } });
            if (!assignee) {
                throw new NotFoundException('Assignee not found');
            }
            task.assignee = assignee;
        }

        return this.taskRepository.save(task);
    }

    async findAll(): Promise<Task[]> {
        return this.taskRepository.find({
            relations: ['creator', 'assignee'],
            order: { createdAt: 'DESC' }
        });
    }

    async findOne(id: number): Promise<Task> {
        const task = await this.taskRepository.findOne({
            where: { id },
            relations: ['creator', 'assignee']
        });

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        return task;
    }

    async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
        const task = await this.findOne(id);

        if (updateTaskDto.assigneeId) {
            const assignee = await this.userRepository.findOne({ where: { id: updateTaskDto.assigneeId } });
            if (!assignee) {
                throw new NotFoundException('Assignee not found');
            }
            task.assignee = assignee;
        }

        Object.assign(task, updateTaskDto);
        return this.taskRepository.save(task);
    }

    async remove(id: number): Promise<void> {
        const task = await this.findOne(id);
        await this.taskRepository.remove(task);
    }

    async findByAssignee(assigneeId: number): Promise<Task[]> {
        return this.taskRepository.find({
            where: { assignee: { id: assigneeId } },
            relations: ['creator', 'assignee'],
            order: { createdAt: 'DESC' }
        });
    }

    async findByCreator(creatorId: number): Promise<Task[]> {
        return this.taskRepository.find({
            where: { creator: { id: creatorId } },
            relations: ['creator', 'assignee'],
            order: { createdAt: 'DESC' }
        });
    }
} 