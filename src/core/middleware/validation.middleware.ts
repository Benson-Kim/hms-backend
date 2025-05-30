import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import { plainToClass, ClassConstructor } from "class-transformer";
import { ValidationError } from "./error.middleware";
import { ResponseUtil } from "@/core/utils/response.util";

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

export function validateBody<T extends object>(dtoClass: ClassConstructor<T>) {
	return validateDto(dtoClass, "body");
}

export function validateQuery<T extends object>(dtoClass: ClassConstructor<T>) {
	return validateDto(dtoClass, "query");
}

export function validateParams<T extends object>(
	dtoClass: ClassConstructor<T>
) {
	return validateDto(dtoClass, "params");
}
