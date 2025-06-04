import {
	IsString,
	IsOptional,
	IsDateString,
	MinLength,
	MaxLength,
	IsUUID,
} from "class-validator";
import { BaseResponseDto } from "@/shared/dto/base.dto";
import { ConsentStatus } from "@/core/types/patient.types";

// Consent ID DTO
export class ConsentIdDto {
	@IsUUID()
	ConsentId!: string;
}

// Consent DTO
export class ConsentDto {
	@IsString()
	@MinLength(2)
	@MaxLength(200)
	consentType!: string;

	@IsDateString()
	consentDate!: string;

	@IsOptional()
	@IsDateString()
	validUntil?: string;

	@IsOptional()
	@IsString()
	recordedBy?: string;

	@IsOptional()
	@IsString()
	witnessName?: string;

	@IsOptional()
	@IsString()
	@MaxLength(500)
	consentDocument?: string;

	@IsOptional()
	@IsString()
	@MaxLength(1000)
	notes?: string;
}

export class PatientConsentResponseDto extends BaseResponseDto {
	patientId!: string;
	consentType!: string;
	consentDate!: Date;
	validUntil?: Date;
	consentDocument?: string;
	notes?: string;
	status!: ConsentStatus;
}
