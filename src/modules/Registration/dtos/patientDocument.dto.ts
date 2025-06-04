import {
	IsString,
	IsOptional,
	MinLength,
	MaxLength,
	IsUUID,
} from "class-validator";
import { BaseResponseDto } from "@/shared/dto/base.dto";

// Document ID DTO
export class documentIdDto {
	@IsUUID()
	documentId!: string;
}

// Document Upload DTO
export class DocumentUploadDto {
	@IsString()
	@MinLength(2)
	@MaxLength(100)
	documentType!: string;

	@IsString()
	@MinLength(2)
	@MaxLength(200)
	documentName!: string;

	@IsString()
	@MinLength(2)
	@MaxLength(500)
	filePath!: string;

	@IsOptional()
	@IsString()
	@MaxLength(1000)
	notes?: string;
}

export class PatientDocumentResponseDto extends BaseResponseDto {
	patientId!: string;
	documentType!: string;
	documentName!: string;
	filePath!: string;
	uploadDate!: Date;
	notes?: string;
}
