import {
	IsString,
	IsOptional,
	IsEmail,
	IsDateString,
	IsPhoneNumber,
	IsEnum,
	IsArray,
	IsBoolean,
	IsNumber,
	Min,
	Max,
	MinLength,
	MaxLength,
	ValidateNested,
	IsUUID,
} from "class-validator";
import { Type } from "class-transformer";
import { BaseResponseDto, PaginationDto } from "@/shared/dto/base.dto";
import { Gender, PatientStatus } from "@/core/types/patient.types";

// Address ID DTO
export class AddressIdDto {
	@IsUUID()
	AddressId!: string;
}

// Address DTOs
export class AddressDto {
	@IsString()
	@MinLength(1)
	@MaxLength(200)
	streetAddress!: string;

	@IsString()
	@MinLength(1)
	@MaxLength(100)
	city!: string;

	@IsString()
	@MinLength(1)
	@MaxLength(100)
	county!: string;

	@IsString()
	@MinLength(1)
	@MaxLength(20)
	postalCode!: string;

	@IsOptional()
	@IsString()
	@MaxLength(100)
	country?: string;
}

// Next of Kin DTOs
export class NextOfKinDto {
	@IsString()
	@MinLength(2)
	@MaxLength(200)
	name!: string;

	@IsString()
	@MinLength(2)
	@MaxLength(100)
	relationship!: string;

	@IsPhoneNumber()
	contactNumber!: string;

	@IsOptional()
	@IsPhoneNumber()
	alternateContactNumber?: string;

	@IsOptional()
	@IsString()
	@MaxLength(500)
	address?: string;

	@IsOptional()
	@IsBoolean()
	isPrimaryContact?: boolean;
}

// Insurance Detail DTOs
export class InsuranceDetailDto {
	@IsString()
	@MinLength(2)
	@MaxLength(200)
	providerName!: string;

	@IsString()
	@MinLength(2)
	@MaxLength(100)
	policyNumber!: string;

	@IsString()
	@MinLength(2)
	@MaxLength(100)
	coverageType!: string;

	@IsDateString()
	validFrom!: string;

	@IsDateString()
	validTo!: string;

	@IsOptional()
	@IsBoolean()
	isPrimary?: boolean;

	@IsOptional()
	@IsNumber()
	@Min(0)
	@Max(100)
	coveragePercentage?: number;
}

// Patient ID DTO
export class PatientIdDto {
	@IsUUID()
	patientId!: string;
}

// Patient Create DTO
export class PatientCreateDto {
	@IsOptional()
	@IsString()
	@MaxLength(50)
	nationalId?: string;

	@IsString()
	@MinLength(2)
	@MaxLength(100)
	firstName!: string;

	@IsString()
	@MinLength(2)
	@MaxLength(100)
	lastName!: string;

	@IsOptional()
	@IsString()
	@MaxLength(100)
	middleName?: string;

	@IsDateString()
	dateOfBirth!: string;

	@IsEnum(Gender)
	gender!: Gender;

	@IsPhoneNumber()
	contactNumber!: string;

	@IsOptional()
	@IsPhoneNumber()
	alternateContactNumber?: string;

	@IsOptional()
	@IsEmail()
	@MaxLength(255)
	email?: string;

	@ValidateNested()
	@Type(() => AddressDto)
	address!: AddressDto;

	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => NextOfKinDto)
	nextOfKin?: NextOfKinDto[];

	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => InsuranceDetailDto)
	insuranceDetails?: InsuranceDetailDto[];

	@IsOptional()
	@IsString()
	@MaxLength(10)
	bloodGroup?: string;

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	allergies?: string[];

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	chronicConditions?: string[];

	@IsOptional()
	@IsString()
	photo?: string;
}

// Patient Update DTO
export class PatientUpdateDto {
	@IsOptional()
	@IsString()
	@MaxLength(50)
	nationalId?: string;

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
	@IsString()
	@MaxLength(100)
	middleName?: string;

	@IsOptional()
	@IsDateString()
	dateOfBirth?: string;

	@IsOptional()
	@IsEnum(Gender)
	gender?: Gender;

	@IsOptional()
	@IsPhoneNumber()
	contactNumber?: string;

	@IsOptional()
	@IsPhoneNumber()
	alternateContactNumber?: string;

	@IsOptional()
	@IsEmail()
	@MaxLength(255)
	email?: string;

	@IsOptional()
	@ValidateNested()
	@Type(() => AddressDto)
	address?: AddressDto;

	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => NextOfKinDto)
	nextOfKin?: NextOfKinDto[];

	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => InsuranceDetailDto)
	insuranceDetails?: InsuranceDetailDto[];

	@IsOptional()
	@IsString()
	@MaxLength(10)
	bloodGroup?: string;

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	allergies?: string[];

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	chronicConditions?: string[];

	@IsOptional()
	@IsString()
	photo?: string;

	@IsOptional()
	@IsEnum(PatientStatus)
	status?: PatientStatus;
}

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
	@MaxLength(500)
	consentDocument?: string;

	@IsOptional()
	@IsString()
	@MaxLength(1000)
	notes?: string;
}

// Search Parameters DTO
export class PatientSearchParams extends PaginationDto {
	@IsOptional()
	@IsString()
	@MaxLength(100)
	firstName?: string;

	@IsOptional()
	@IsString()
	@MaxLength(100)
	lastName?: string;

	@IsOptional()
	@IsString()
	@MaxLength(50)
	mrn?: string;

	@IsOptional()
	@IsString()
	@MaxLength(50)
	nationalId?: string;

	@IsOptional()
	@IsPhoneNumber()
	contactNumber?: string;

	@IsOptional()
	@IsEmail()
	email?: string;

	@IsOptional()
	@IsEnum(PatientStatus)
	status?: PatientStatus;

	@IsOptional()
	@IsEnum(Gender)
	gender?: Gender;

	@IsOptional()
	@IsDateString()
	dateOfBirthFrom?: string;

	@IsOptional()
	@IsDateString()
	dateOfBirthTo?: string;

	@IsOptional()
	@IsDateString()
	registrationDateFrom?: string;

	@IsOptional()
	@IsDateString()
	registrationDateTo?: string;

	@IsOptional()
	@IsString()
	@MaxLength(100)
	city?: string;

	@IsOptional()
	@IsString()
	@MaxLength(100)
	county?: string;
}

// Response DTOs
export class PatientResponseDto extends BaseResponseDto {
	mrn!: string;
	nationalId?: string;
	firstName!: string;
	lastName!: string;
	middleName?: string;
	fullName!: string;
	dateOfBirth!: Date;
	age!: number;
	gender!: "Male" | "Female" | "Other";
	contactNumber!: string;
	alternateContactNumber?: string;
	email?: string;
	address!: AddressDto;
	registrationDate!: Date;
	nextOfKin!: NextOfKinDto[];
	insuranceDetails!: InsuranceDetailDto[];
	status!: "Active" | "Inactive" | "Deceased";
	bloodGroup?: string;
	allergies?: string[];
	chronicConditions?: string[];
	photo?: string;
}

export class PatientDocumentResponseDto extends BaseResponseDto {
	patientId!: string;
	documentType!: string;
	documentName!: string;
	filePath!: string;
	uploadDate!: Date;
	notes?: string;
}

export class PatientConsentResponseDto extends BaseResponseDto {
	patientId!: string;
	consentType!: string;
	consentDate!: Date;
	validUntil?: Date;
	consentDocument?: string;
	notes?: string;
	status!: "Active" | "Revoked" | "Expired";
}

export class VerificationResult {
	@IsBoolean()
	isValid!: boolean;

	@IsOptional()
	@IsString()
	message?: string;

	@IsOptional()
	@IsString()
	verificationId?: string;

	@IsOptional()
	details?: {
		providerName: string;
		policyNumber: string;
		coverageType: string;
		coveragePercentage: number;
		validFrom: Date;
		validTo: Date;
		beneficiaryName?: string;
		status: string;
	};
}

// Patient Statistics DTOs - Add these to your existing DTOs file

export class PatientOverviewDto {
	totalPatients!: number;
	activePatients!: number;
	inactivePatients!: number;
	deceasedPatients!: number;
	recentRegistrations!: number; // Last 12 months
	thisMonthRegistrations!: number;
	averageAge!: number;
}

export class GenderDistributionDto {
	male!: number;
	female!: number;
	other!: number;
}

export class AgeGroupDistributionDto {
	children!: number; // 0-17
	adults!: number; // 18-64
	seniors!: number; // 65+
}

export class CountyStatDto {
	county!: string;
	count!: number;
}

export class PatientDemographicsDto {
	gender!: GenderDistributionDto;
	ageGroups!: AgeGroupDistributionDto;
	topCounties!: CountyStatDto[];
}

export class InsuranceProviderStatDto {
	provider!: string;
	patientCount!: number;
}

export class InsuranceStatisticsDto {
	covered!: number;
	uncovered!: number;
	coveragePercentage!: number;
	topProviders!: InsuranceProviderStatDto[];
}

export class MonthlyRegistrationDto {
	month!: string; // e.g., "2023-01"
	monthName!: string; // e.g., "January"
	year!: number;
	count!: number;
}

export class RegistrationTrendsDto {
	lastTwelveMonths!: number;
	currentMonth!: number;
	monthlyBreakdown!: MonthlyRegistrationDto[];
}

export class PatientStatisticsDto {
	overview!: PatientOverviewDto;
	demographics!: PatientDemographicsDto;
	insurance!: InsuranceStatisticsDto;
	registrationTrends!: RegistrationTrendsDto;
}
