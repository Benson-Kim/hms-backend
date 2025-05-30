import { Request, Response, NextFunction } from "express";
import { logger } from "@/core/utils/logger.util";
import { ResponseUtil } from "@/core/utils/response.util";
import { config } from "@/config/constants";

// Base AppError interface
export interface AppError extends Error {
	statusCode?: number;
	isOperational?: boolean;
}

// Base error class
export class BaseError extends Error implements AppError {
	statusCode: number;
	isOperational: boolean;

	constructor(message: string, statusCode = 500, name = "Error") {
		super(message);
		this.name = name;
		this.statusCode = statusCode;
		this.isOperational = true;

		Error.captureStackTrace(this, this.constructor);
	}
}

// Specific error types
export class ValidationError extends BaseError {
	constructor(message: string) {
		super(message, 400, "ValidationError");
	}
}

export class UnauthorizedError extends BaseError {
	constructor(message = "Unauthorized") {
		super(message, 401, "UnauthorizedError");
	}
}

export class ForbiddenError extends BaseError {
	constructor(message = "Forbidden") {
		super(message, 403, "ForbiddenError");
	}
}

export class NotFoundError extends BaseError {
	constructor(message = "Resource not found") {
		super(message, 404, "NotFoundError");
	}
}

export class ConflictError extends BaseError {
	constructor(message = "Conflict") {
		super(message, 409, "ConflictError");
	}
}

// Express error-handling middleware
export function errorMiddleware(
	error: AppError,
	req: Request,
	res: Response,
	next: NextFunction
): void {
	if (res.headersSent) {
		return next(error);
	}

	const statusCode = error.statusCode ?? 500;
	let message = error.message;

	// Log the error
	logger.error("Error occurred:", {
		error: error.message,
		stack: error.stack,
		url: req.url,
		method: req.method,
		ip: req.ip,
		userAgent: req.get("User-Agent"),
	});

	// Hide internal messages in production
	if (config.NODE_ENV === "production" && statusCode === 500) {
		message = "Internal Server Error";
	}

	ResponseUtil.error(res, message, statusCode);
}

// Async handler wrapper for routes
export function asyncHandler(
	fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
	return (req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
}
