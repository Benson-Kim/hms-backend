import {
	IsEmail,
	IsString,
	IsOptional,
	IsBoolean,
	IsDateString,
	MinLength,
	MaxLength,
	IsPhoneNumber,
} from "class-validator";
import { Transform } from "class-transformer";
import { BaseResponseDto, PaginationDto } from "@/shared/dto/base.dto";

export class CreateUserDto {
	@IsString()
	@MinLength(2)
	@MaxLength(100)
	firstName!: string;

	@IsString()
	@MinLength(2)
	@MaxLength(100)
	lastName!: string;

	@IsEmail()
	@MaxLength(255)
	email!: string;

	@IsString()
	@MinLength(8)
	@MaxLength(128)
	password!: string;

	@IsOptional()
	@IsPhoneNumber()
	phone?: string;

	@IsOptional()
	@IsDateString()
	dateOfBirth?: string;

	@IsOptional()
	@IsString({ each: true })
	roleIds?: string[];
}

export class UpdateUserDto {
	@IsOptional()
	@IsString()
	@MinLength(2)
	@MaxLength(100)
	firstName?: string;

	@IsOptional()
	@IsString()
	@MinLength(2)
	@MaxLength(100)
	lastName?: string;

	@IsOptional()
	@IsPhoneNumber()
	phone?: string;

	@IsOptional()
	@IsDateString()
	dateOfBirth?: string;

	@IsOptional()
	@IsBoolean()
	isActive?: boolean;

	@IsOptional()
	@IsString({ each: true })
	roleIds?: string[];
}

export class ChangePasswordDto {
	@IsString()
	currentPassword!: string;

	@IsString()
	@MinLength(8)
	@MaxLength(128)
	newPassword!: string;
}

export class UserResponseDto extends BaseResponseDto {
	firstName!: string;
	lastName!: string;
	email!: string;
	phone?: string;
	dateOfBirth?: Date;
	isActive!: boolean;
	isEmailVerified!: boolean;
	lastLoginAt?: Date;
	fullName!: string;
	roles?: Array<{
		id: string;
		name: string;
		description?: string;
	}>;
}

export class UserListDto extends PaginationDto {
	@IsOptional()
	@IsBoolean()
	@Transform(({ value }) => value === "true")
	isActive?: boolean;

	@IsOptional()
	@IsString()
	role?: string;
}
