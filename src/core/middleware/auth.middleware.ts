import { Response, NextFunction } from "express";
import { JwtUtil } from "@/core/utils/jwt.util";
import { UnauthorizedError } from "./error.middleware";
import { AuthenticatedRequest } from "@/core/types/common.types";
import { logger } from "@/core/utils/logger.util";
import { UserService } from "@/modules/User/services/user.service";

export async function authMiddleware(
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			throw new UnauthorizedError("Access token required");
		}

		const token = authHeader.substring(7);
		const payload = JwtUtil.verifyAccessToken(token);

		// Get user with roles and permissions
		const userService = new UserService();
		const user = await userService.findByIdWithRoles(payload.sub);

		if (!user || !user.isActive) {
			throw new UnauthorizedError("User not found or inactive");
		}

		req.user = {
			id: user.id,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			roles: user.roles || [],
			isActive: user.isActive,
		};

		next();
	} catch (error) {
		logger.error("Authentication failed:", error);
		next(new UnauthorizedError("Invalid or expired token"));
	}
}

export function optionalAuthMiddleware(
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
): void {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return next();
	}

	authMiddleware(req, res, (error) => {
		if (error) {
			// Don't throw error for optional auth, just continue without user
			req.user = undefined;
		}
		next();
	});
}
