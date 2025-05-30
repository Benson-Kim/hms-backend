import { Request } from "express";
import { AuthenticatedUser } from "./auth.types";

export interface AuthenticatedRequest extends Request {
	user?: AuthenticatedUser;
}

export interface ApiResponse<T = unknown> {
	success: boolean;
	message: string;
	data?: T;
	errors?: ValidationError[];
	timestamp: string;
}

export interface ValidationError {
	field: string;
	message: string;
	value?: string | number | boolean | null;
}

export enum PermissionAction {
	CREATE = "create",
	READ = "read",
	UPDATE = "update",
	DELETE = "delete",
	MANAGE = "manage",
}

export enum PermissionResource {
	USER = "user",
	ROLE = "role",
	PERMISSION = "permission",
	ADMIN = "admin",
	ALL = "*",
}
