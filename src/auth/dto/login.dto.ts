import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
    @IsNotEmpty()
    @IsString()
    @IsEmail({}, { message: 'Некорректный email' })
    email: string

    @IsNotEmpty()
    @IsString()
    password: string
}
