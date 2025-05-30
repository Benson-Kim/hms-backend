import { Response } from "express";
import { ApiResponse } from "@/core/types/common.types";

export class ResponseUtil {
	static success<T>(
		res: Response,
		data: T,
		message: string = "Success",
		statusCode: number = 200
	): Response<ApiResponse<T>> {
		return res.status(statusCode).json({
			success: true,
			message,
			data,
			timestamp: new Date().toISOString(),
		});
	}

	static error(
		res: Response,
		message: string = "Internal Server Error",
		statusCode: number = 500,
		errors?: { field: string; message: string }[]
	): Response<ApiResponse> {
		return res.status(statusCode).json({
			success: false,
			message,
			errors,
			timestamp: new Date().toISOString(),
		});
	}

	static validationError(
		res: Response,
		errors: { field: string; message: string }[],
		message: string = "Validation failed"
	): Response<ApiResponse> {
		return res.status(400).json({
			success: false,
			message,
			errors,
			timestamp: new Date().toISOString(),
		});
	}

	static unauthorized(
		res: Response,
		message: string = "Unauthorized"
	): Response<ApiResponse> {
		return res.status(401).json({
			success: false,
			message,
			timestamp: new Date().toISOString(),
		});
	}

	static forbidden(
		res: Response,
		message: string = "Forbidden"
	): Response<ApiResponse> {
		return res.status(403).json({
			success: false,
			message,
			timestamp: new Date().toISOString(),
		});
	}

	static notFound(
		res: Response,
		message: string = "Resource not found"
	): Response<ApiResponse> {
		return res.status(404).json({
			success: false,
			message,
			timestamp: new Date().toISOString(),
		});
	}
}
