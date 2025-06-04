import {
	IsString,
	IsOptional,
	IsEmail,
	IsDateString,
	IsPhoneNumber,
	IsEnum,
	IsArray,
	MinLength,
	MaxLength,
	ValidateNested,
	IsUUID,
	IsInt,
	Min,
	Max,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import { BaseResponseDto, PaginationDto } from "@/shared/dto/base.dto";
import { Gender, PatientStatus } from "@/core/types/patient.types";
import { AddressDto } from "./address.dto";
import { NextOfKinDto } from "./nextOfKin.dto";
import {
	InsuranceDetailDto,
	InsuranceStatisticsDto,
} from "./insuranceDetail.dto";

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

// Search Parameters DTO
export class PatientSearchParams extends PaginationDto {
	@IsOptional()
	@IsString()
	@MaxLength(100)
	searchTerm?: string;

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
	@IsString()
	@MaxLength(10)
	bloodGroup?: string;

	@IsOptional()
	@Transform(({ value }) => parseInt(value))
	@IsInt()
	@Min(0)
	@Max(150)
	ageMin?: number;

	@IsOptional()
	@Transform(({ value }) => parseInt(value))
	@IsInt()
	@Min(0)
	@Max(150)
	ageMax?: number;

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
	gender!: Gender;
	contactNumber!: string;
	alternateContactNumber?: string;
	email?: string;
	address!: AddressDto;
	registrationDate!: Date;
	nextOfKin!: NextOfKinDto[];
	insuranceDetails!: InsuranceDetailDto[];
	status!: PatientStatus;
	bloodGroup?: string;
	allergies?: string[];
	chronicConditions?: string[];
	photo?: string;
}

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
