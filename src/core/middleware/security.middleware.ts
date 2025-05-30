import { Request, Response, NextFunction } from "express";
import { logger } from "@/core/utils/logger.util";

export function securityMiddleware(
	req: Request,
	res: Response,
	next: NextFunction
): void {
	// Remove server information
	res.removeHeader("X-Powered-By");

	// Add security headers
	res.setHeader("X-Content-Type-Options", "nosniff");
	res.setHeader("X-Frame-Options", "DENY");
	res.setHeader("X-XSS-Protection", "1; mode=block");
	res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

	// Log suspicious activities
	const suspiciousPatterns = [
		/(<script|javascript:|vbscript:|onload=|onerror=)/i,
		/(union|select|insert|delete|drop|create|alter)/i,
		/(\.\.|\/etc\/|\/proc\/|\/sys\/)/i,
	];

	const requestData = JSON.stringify({
		body: req.body,
		query: req.query,
		params: req.params,
	});

	if (suspiciousPatterns.some((pattern) => pattern.test(requestData))) {
		logger.warn("Suspicious request detected:", {
			ip: req.ip,
			userAgent: req.get("User-Agent"),
			url: req.url,
			method: req.method,
			data: requestData,
		});
	}

	next();
}

export function sanitizeInput(
	req: Request,
	res: Response,
	next: NextFunction
): void {
	// Basic input sanitization
	const sanitize = <T>(obj: T): T => {
		if (typeof obj === "string") {
			return obj.replace(
				/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
				""
			) as T;
		}
		if (typeof obj === "object" && obj !== null) {
			for (const key in obj) {
				obj[key] = sanitize(obj[key]);
			}
		}
		return obj;
	};

	if (req.body) req.body = sanitize(req.body);
	if (req.query) req.query = sanitize(req.query);
	if (req.params) req.params = sanitize(req.params);

	next();
}
