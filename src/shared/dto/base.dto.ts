import { IsOptional, IsUUID, IsDateString } from "class-validator";
import { Transform } from "class-transformer";

export class BaseResponseDto {
	@IsUUID()
	id!: string;

	@IsDateString()
	createdAt!: Date;

	@IsDateString()
	updatedAt!: Date;

	@IsOptional()
	@IsDateString()
	deletedAt?: Date;
}

export class UUIDDto {
	@IsUUID()
	id!: string;
}

export class PaginationDto {
	@IsOptional()
	@Transform(({ value }) => parseInt(value))
	page?: number = 1;

	@IsOptional()
	@Transform(({ value }) => parseInt(value))
	limit?: number = 10;

	@IsOptional()
	search?: string;

	@IsOptional()
	sortBy?: string;

	@IsOptional()
	sortOrder?: "ASC" | "DESC" = "ASC";
}

export class PaginatedResponseDto<T> {
	data: T[] = [];
	total!: number;
	page!: number;
	limit!: number;
	totalPages!: number;
	hasNext: boolean = false;
	hasPrev: boolean = false;
}
