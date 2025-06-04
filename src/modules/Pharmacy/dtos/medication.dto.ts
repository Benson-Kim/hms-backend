import { MedicationStatus } from "@/core/types/pharmacy .types";
import { BaseResponseDto, PaginationDto } from "@/shared/dto/base.dto";
import { Transform } from "class-transformer";
import {
	IsBoolean,
	IsDateString,
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
	IsUUID,
	Min,
} from "class-validator";

export class MedicationIdto {
	@IsUUID()
	id!: string;
}

export class CreateMedicationDto {
	@IsString()
	code!: string;

	@IsString()
	name!: string;

	@IsString()
	genericName!: string;

	@IsString()
	@IsOptional()
	brandName?: string;

	@IsString()
	category!: string;

	@IsString()
	formulation!: string;

	@IsString()
	strength!: string;

	@IsString()
	unit!: string;

	@IsString()
	@IsOptional()
	manufacturer?: string;

	@IsNumber()
	@Transform(({ value }) => Number(value))
	reorderLevel!: number;

	@IsNumber()
	@Transform(({ value }) => Number(value))
	stockQuantity!: number;

	@IsDateString()
	@IsOptional()
	expiryDate?: Date;

	@IsString()
	@IsOptional()
	batchNumber?: string;

	@IsString()
	location!: string;

	@IsNumber()
	@Transform(({ value }) => Number(value))
	price!: number;

	@IsBoolean()
	@Transform(({ value }) => Boolean(value))
	isControlled!: boolean;

	@IsBoolean()
	@Transform(({ value }) => Boolean(value))
	requiresPrescription!: boolean;

	@IsEnum(MedicationStatus)
	status: MedicationStatus = MedicationStatus.ACTIVE;
}

export class UpdateMedicationDto {
	@IsOptional()
	@IsString()
	code?: string;

	@IsOptional()
	@IsString()
	name?: string;

	@IsOptional()
	@IsString()
	genericName?: string;

	@IsOptional()
	@IsString()
	brandName?: string;

	@IsOptional()
	@IsString()
	category?: string;

	@IsOptional()
	@IsString()
	formulation?: string;

	@IsOptional()
	@IsString()
	strength?: string;

	@IsOptional()
	@IsString()
	unit?: string;

	@IsOptional()
	@IsString()
	manufacturer?: string;

	@IsOptional()
	@IsNumber()
	@Min(0)
	reorderLevel?: number;

	@IsOptional()
	@IsNumber()
	@Min(0)
	stockQuantity?: number;

	@IsOptional()
	@IsDateString()
	expiryDate?: Date;

	@IsOptional()
	@IsString()
	batchNumber?: string;

	@IsOptional()
	@IsString()
	location?: string;

	@IsOptional()
	@IsNumber()
	@Min(0)
	price?: number;

	@IsOptional()
	@IsBoolean()
	isControlled?: boolean;

	@IsOptional()
	@IsBoolean()
	requiresPrescription?: boolean;

	@IsOptional()
	@IsString()
	status?: string;

	@IsOptional()
	@IsDateString()
	updatedAt?: Date;
}

export class MedicationResponseDto extends BaseResponseDto {
	code!: string;
	name!: string;
	genericName!: string;
	brandName?: string;
	category!: string;
	formulation!: string;
	strength!: string;
	unit!: string;
	manufacturer?: string;
	reorderLevel!: number;
	stockQuantity!: number;
	expiryDate?: Date;
	batchNumber?: string;
	location!: string;
	price!: number;
	isControlled!: boolean;
	requiresPrescription!: boolean;
	status!: MedicationStatus;
}

export class MedicationSearchParams extends PaginationDto {
	@IsOptional()
	@IsString()
	code?: string;

	@IsOptional()
	@IsString()
	name?: string;

	@IsOptional()
	@IsString()
	genericName?: string;

	@IsOptional()
	@IsString()
	category?: string;

	@IsOptional()
	@IsString()
	formulation?: string;

	@IsOptional()
	@IsString()
	strength?: string;

	@IsOptional()
	@IsString()
	unit?: string;

	@IsOptional()
	@IsString()
	location?: string;

	@IsOptional()
	@Transform(({ value }) => Number(value))
	minPrice?: number;

	@IsOptional()
	@Transform(({ value }) => Number(value))
	maxPrice?: number;

	@IsOptional()
	status?: MedicationStatus;

	@IsOptional()
	@IsBoolean()
	isControlled?: boolean;

	@IsOptional()
	@IsBoolean()
	requiresPrescription?: boolean;
}
