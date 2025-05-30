import { Response, NextFunction } from "express";
import { ForbiddenError } from "./error.middleware";
import { AuthenticatedRequest } from "@/core/types/common.types";

export function requireRole(...roles: string[]) {
	return (
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	): void => {
		if (!req.user) {
			throw new ForbiddenError("Authentication required");
		}

		const userRoles = req.user.roles.map((role) => role.name);
		const hasRole = roles.some((role) => userRoles.includes(role));

		if (!hasRole) {
			throw new ForbiddenError(`Required roles: ${roles.join(", ")}`);
		}

		next();
	};
}

export function requirePermission(resource: string, action: string) {
	return (
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	): void => {
		if (!req.user) {
			throw new ForbiddenError("Authentication required");
		}

		const permissions = req.user.roles.flatMap((role) => role.permissions);
		const hasPermission = permissions.some(
			(permission) =>
				(permission.resource === resource || permission.resource === "*") &&
				(permission.action === action || permission.action === "*")
		);

		if (!hasPermission) {
			throw new ForbiddenError(`Required permission: ${action} on ${resource}`);
		}

		next();
	};
}

export function requireAnyPermission(
	...permissionChecks: Array<{ resource: string; action: string }>
) {
	return (
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	): void => {
		if (!req.user) {
			throw new ForbiddenError("Authentication required");
		}

		const permissions = req.user.roles.flatMap((role) => role.permissions);

		const hasAnyPermission = permissionChecks.some((check) =>
			permissions.some(
				(permission) =>
					(permission.resource === check.resource ||
						permission.resource === "*") &&
					(permission.action === check.action || permission.action === "*")
			)
		);

		if (!hasAnyPermission) {
			throw new ForbiddenError("Insufficient permissions");
		}

		next();
	};
}
