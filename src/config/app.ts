import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import { config } from "./constants";
import {
	authRoutes,
	permissionRoutes,
	roleRoutes,
} from "../modules/Auth/routes";
import { userRoutes } from "../modules/User/user.routes";
import { securityMiddleware } from "../core/middleware/security.middleware";
import { errorMiddleware } from "../core/middleware/error.middleware";
import { rateLimitMiddleware } from "../core/middleware/rate-limit.middleware";
import { patientRegistrationRoutes } from "@/modules/Registration/routes/patient-registration.route";

export function createApp(): express.Application {
	const app = express();

	// Security middleware
	app.use(
		helmet({
			contentSecurityPolicy: {
				directives: {
					defaultSrc: ["'self'"],
					styleSrc: ["'self'", "'unsafe-inline'"],
					scriptSrc: ["'self'"],
					imgSrc: ["'self'", "data:", "https:"],
				},
			},
			hsts: {
				maxAge: 31536000,
				includeSubDomains: true,
				preload: true,
			},
		})
	);

	app.use(
		cors({
			origin: config.CORS_ORIGIN,
			credentials: true,
			methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
			allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
		})
	);

	app.use(compression());
	app.use(express.json({ limit: "10mb" }));
	app.use(express.urlencoded({ extended: true, limit: "10mb" }));

	// Custom security middleware
	app.use(securityMiddleware);

	// Rate limiting
	app.use(rateLimitMiddleware);

	// Logging
	if (config.NODE_ENV !== "test") {
		app.use(morgan("combined"));
	}

	// Health check
	app.get("/health", (req, res) => {
		res.status(200).json({
			status: "OK",
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
		});
	});

	// API routes
	const apiPrefix = `/api/${config.API_VERSION}`;

	app.use(`${apiPrefix}/auth`, authRoutes);
	app.use(`${apiPrefix}/users`, userRoutes);
	app.use(`${apiPrefix}/roles`, roleRoutes);
	app.use(`${apiPrefix}/permissions`, permissionRoutes);

	app.use(`${apiPrefix}/patient-register`, patientRegistrationRoutes);

	// 404 handler
	app.use("*", (req, res) => {
		res.status(404).json({
			success: false,
			message: "Endpoint not found",
			path: req.originalUrl,
		});
	});

	// Global error handler
	app.use(errorMiddleware);

	return app;
}
