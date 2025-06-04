// src/modules/auth/dto/auth.dto.ts
import { Type } from "class-transformer";
import {
	IsEmail,
	IsNotEmpty,
	IsString,
	MinLength,
	MaxLength,
	Matches,
	IsOptional,
	IsUUID,
	IsBoolean,
	IsArray,
	ArrayMinSize,
	ValidateNested,
} from "class-validator";

export class LoginDto {
	@IsEmail({}, { message: "Please provide a valid email address" })
	@IsNotEmpty({ message: "Email is required" })
	email!: string;

	@IsString({ message: "Password must be a string" })
	@IsNotEmpty({ message: "Password is required" })
	@MinLength(8, { message: "Password must be at least 8 characters long" })
	password!: string;
}

export class RegisterDto {
	@IsString({ message: "First name must be a string" })
	@IsNotEmpty({ message: "First name is required" })
	@MaxLength(50, { message: "First name cannot exceed 50 characters" })
	firstName!: string;

	@IsString({ message: "Last name must be a string" })
	@IsNotEmpty({ message: "Last name is required" })
	@MaxLength(50, { message: "Last name cannot exceed 50 characters" })
	lastName!: string;

	@IsEmail({}, { message: "Please provide a valid email address" })
	@IsNotEmpty({ message: "Email is required" })
	email!: string;

	@IsString({ message: "Password must be a string" })
	@IsNotEmpty({ message: "Password is required" })
	@MinLength(8, { message: "Password must be at least 8 characters long" })
	@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
		message:
			"Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
	})
	password!: string;

	@IsOptional()
	@IsString({ message: "Phone must be a string" })
	@MaxLength(20, { message: "Phone cannot exceed 20 characters" })
	phone?: string;

	@IsOptional()
	@IsString({ message: "Date of birth must be a string" })
	dateOfBirth?: string;
}

export class RefreshTokenDto {
	@IsString({ message: "Refresh token must be a string" })
	@IsNotEmpty({ message: "Refresh token is required" })
	refreshToken!: string;
}

export class ForgotPasswordDto {
	@IsEmail({}, { message: "Please provide a valid email address" })
	@IsNotEmpty({ message: "Email is required" })
	email!: string;
}

export class ResetPasswordDto {
	@IsString({ message: "Reset token must be a string" })
	@IsNotEmpty({ message: "Reset token is required" })
	token!: string;

	@IsString({ message: "Password must be a string" })
	@IsNotEmpty({ message: "Password is required" })
	@MinLength(8, { message: "Password must be at least 8 characters long" })
	@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
		message:
			"Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
	})
	password!: string;
}

export class VerifyEmailDto {
	@IsString({ message: "Verification token must be a string" })
	@IsNotEmpty({ message: "Verification token is required" })
	token!: string;
}

export class ResendVerificationDto {
	@IsEmail({}, { message: "Please provide a valid email address" })
	@IsNotEmpty({ message: "Email is required" })
	email!: string;
}

export class AssignRoleDto {
	@IsUUID("4", { message: "User ID must be a valid UUID" })
	@IsNotEmpty({ message: "User ID is required" })
	userId!: string;

	@IsUUID("4", { each: true, message: "Each role ID must be a valid UUID" })
	@IsNotEmpty({ message: "Role IDs are required" })
	roleIds!: string[];
}

export class CreateRoleDto {
	@IsString({ message: "Role name must be a string" })
	@IsNotEmpty({ message: "Role name is required" })
	@MaxLength(100, { message: "Role name cannot exceed 100 characters" })
	name!: string;

	@IsOptional()
	@IsString({ message: "Description must be a string" })
	@MaxLength(255, { message: "Description cannot exceed 255 characters" })
	description?: string;

	@IsOptional()
	@IsUUID("4", {
		each: true,
		message: "Each permission ID must be a valid UUID",
	})
	permissionIds?: string[];
}

export class UpdateRoleDto {
	@IsOptional()
	@IsString({ message: "Role name must be a string" })
	@MaxLength(100, { message: "Role name cannot exceed 100 characters" })
	name?: string;

	@IsOptional()
	@IsString({ message: "Description must be a string" })
	@MaxLength(255, { message: "Description cannot exceed 255 characters" })
	description?: string;

	@IsOptional()
	@IsUUID("4", {
		each: true,
		message: "Each permission ID must be a valid UUID",
	})
	permissionIds?: string[];

	@IsOptional()
	@IsBoolean({ message: "isSystemRole must be a boolean" })
	isSystemRole?: boolean;

	@IsOptional()
	@IsBoolean({ message: "isActive must be a boolean" })
	isActive?: boolean;
}

export class CreatePermissionDto {
	@IsString({ message: "Permission name must be a string" })
	@IsNotEmpty({ message: "Permission name is required" })
	@MaxLength(100, { message: "Permission name cannot exceed 100 characters" })
	name!: string;

	@IsOptional()
	@IsString({ message: "Description must be a string" })
	@MaxLength(255, { message: "Description cannot exceed 255 characters" })
	description?: string;

	@IsString({ message: "Resource must be a string" })
	@IsNotEmpty({ message: "Resource is required" })
	@MaxLength(100, { message: "Resource cannot exceed 100 characters" })
	resource!: string;

	@IsString({ message: "Action must be a string" })
	@IsNotEmpty({ message: "Action is required" })
	@MaxLength(50, { message: "Action cannot exceed 50 characters" })
	action!: string;
}

export class BatchCreatePermissionDto {
	@IsArray({ message: "Permissions must be an array" })
	@ArrayMinSize(1, { message: "At least one permission is required" })
	@ValidateNested({
		each: true,
		message: "Each permission must be a valid object",
	})
	@Type(() => CreatePermissionDto)
	permissions!: CreatePermissionDto[];
}

export class UpdatePermissionDto {
	@IsOptional()
	@IsString({ message: "Permission name must be a string" })
	@MaxLength(100, { message: "Permission name cannot exceed 100 characters" })
	name?: string;

	@IsOptional()
	@IsString({ message: "Description must be a string" })
	@MaxLength(255, { message: "Description cannot exceed 255 characters" })
	description?: string;

	@IsOptional()
	@IsString({ message: "Resource must be a string" })
	@MaxLength(100, { message: "Resource cannot exceed 100 characters" })
	resource?: string;

	@IsOptional()
	@IsString({ message: "Action must be a string" })
	@MaxLength(50, { message: "Action cannot exceed 50 characters" })
	action?: string;
}
