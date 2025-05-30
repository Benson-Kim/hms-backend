import rateLimit from "express-rate-limit";
import { config } from "@/config/constants";
import { ResponseUtil } from "@/core/utils/response.util";

export const rateLimitMiddleware = rateLimit({
	windowMs: config.RATE_LIMIT_WINDOW_MS,
	max: config.RATE_LIMIT_MAX_REQUESTS,
	message: "Too many requests from this IP, please try again later",
	handler: (req, res) => {
		ResponseUtil.error(res, "Rate limit exceeded", 429);
	},
	standardHeaders: true,
	legacyHeaders: false,
});

export const authRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // 5 attempts per window
	message: "Too many authentication attempts, please try again later",
	handler: (req, res) => {
		ResponseUtil.error(res, "Authentication rate limit exceeded", 429);
	},
	skipSuccessfulRequests: true,
});

export const passwordResetRateLimit = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 3, // 3 attempts per hour
	message: "Too many password reset attempts, please try again later",
	handler: (req, res) => {
		ResponseUtil.error(res, "Password reset rate limit exceeded", 429);
	},
});
