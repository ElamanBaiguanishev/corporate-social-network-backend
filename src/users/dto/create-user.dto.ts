import { IsEmail, IsInt, IsNotEmpty, IsString } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    @IsEmail({}, { message: 'Некорректный email' })
    email: string

    @IsNotEmpty()
    @IsString()
    password: string

    @IsNotEmpty()
    @IsString()
    username: string

    @IsNotEmpty()
    @IsInt()
    roleId: number;
}
