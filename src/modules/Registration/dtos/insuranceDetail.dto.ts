import {
	IsString,
	IsOptional,
	IsDateString,
	IsBoolean,
	IsNumber,
	Min,
	Max,
	MinLength,
	MaxLength,
} from "class-validator";

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
	@IsDateString()
	verifiedAt?: string;

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
