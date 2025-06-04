import {
	IsString,
	IsOptional,
	IsPhoneNumber,
	IsBoolean,
	MinLength,
	MaxLength,
} from "class-validator";

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
