import {
	IsString,
	IsOptional,
	MinLength,
	MaxLength,
	IsUUID,
} from "class-validator";

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
