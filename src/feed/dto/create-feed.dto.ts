import { IsString, IsOptional, IsArray, IsNumber } from 'class-validator';

export class CreateFeedDto {
    @IsString()
    content: string;

    @IsString()
    @IsOptional()
    title?: string;

    @IsArray()
    @IsNumber({}, { each: true })
    @IsOptional()
    taggedUserIds?: number[];

    @IsArray()
    @IsNumber({}, { each: true })
    @IsOptional()
    taggedRoleIds?: number[];
} 