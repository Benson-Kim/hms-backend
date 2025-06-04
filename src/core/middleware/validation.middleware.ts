import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import { plainToClass, ClassConstructor } from "class-transformer";
import { ValidationError } from "./error.middleware";
import { ResponseUtil } from "@/core/utils/response.util";

// Define the validation error interface at the top level for reusability
interface ValidationErrorWithIndex {
	index: number;
	field: string;
	message: string;
	value?: unknown; // Optional, in case you want to include the invalid value
}

export function validateDto(
	dtoClass: ClassConstructor<object>,
	source: "body" | "query" | "params" = "body"
) {
	return async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void | Response> => {
		try {
			const dto = plainToClass(dtoClass, req[source]);
			const errors = await validate(dto);
			if (errors.length > 0) {
				const validationErrors = errors.map((error) => ({
					field: error.property,
					message: Object.values(error.constraints || {}).join(", "),
					value: error.value,
				}));
				return ResponseUtil.validationError(res, validationErrors);
			}
			req[source] = dto;
			next();
		} catch {
			next(new ValidationError("Validation failed"));
		}
	};
}

export function validateDtoArray(
	dtoClass: ClassConstructor<object>,
	source: "body" | "query" | "params" = "body"
) {
	return async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void | Response> => {
		try {
			const data = req[source];

			if (!Array.isArray(data)) {
				return ResponseUtil.validationError(res, [
					{ field: source, message: "Expected an array" },
				]);
			}

			// Check for empty array
			if (data.length === 0) {
				return ResponseUtil.validationError(res, [
					{ field: source, message: "Array cannot be empty" },
				]);
			}

			const dtos = data.map((item) => plainToClass(dtoClass, item));
			const allValidationErrors: ValidationErrorWithIndex[] = [];

			for (let i = 0; i < dtos.length; i++) {
				const errors = await validate(dtos[i]);
				if (errors.length > 0) {
					const validationErrors = errors.map((error) => ({
						index: i,
						field: error.property,
						message: Object.values(error.constraints || {}).join(", "),
						value: error.value, // Include the invalid value for better debugging
					}));
					allValidationErrors.push(...validationErrors);
				}
			}

			if (allValidationErrors.length > 0) {
				return ResponseUtil.validationError(res, allValidationErrors);
			}

			req[source] = dtos;
			next();
		} catch (error) {
			// Log the actual error for debugging
			console.error("Array validation error:", error);
			next(new ValidationError("Validation failed"));
		}
	};
}

export function validateBody<T extends object>(dtoClass: ClassConstructor<T>) {
	return validateDto(dtoClass, "body");
}

export function validateBodyArray<T extends object>(
	dtoClass: ClassConstructor<T>
) {
	return validateDtoArray(dtoClass, "body");
}

export function validateQuery<T extends object>(dtoClass: ClassConstructor<T>) {
	return validateDto(dtoClass, "query");
}

export function validateParams<T extends object>(
	dtoClass: ClassConstructor<T>
) {
	return validateDto(dtoClass, "params");
}
