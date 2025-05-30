import dotenv from "dotenv";

dotenv.config();

export const config = {
	// Application
	NODE_ENV: process.env.NODE_ENV || "development",
	PORT: parseInt(process.env.PORT || "3000", 10),
	API_VERSION: process.env.API_VERSION || "v1",
	FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:8000",

	// Database
	DB_HOST: process.env.DB_HOST || "localhost",
	DB_PORT: parseInt(process.env.DB_PORT || "5432", 10),
	DB_USERNAME: process.env.DB_USERNAME || "postgres",
	DB_PASSWORD: process.env.DB_PASSWORD || "Password",
	DB_DATABASE: process.env.DB_DATABASE || "kadacare-health-systems",
	DB_LOGGING: process.env.DB_LOGGING === "true",

	// Redis
	REDIS_HOST: process.env.REDIS_HOST || "localhost",
	REDIS_PORT: parseInt(process.env.REDIS_PORT || "6379", 10),
	REDIS_PASSWORD: process.env.REDIS_PASSWORD || "",

	// JWT
	JWT_SECRET:
		process.env.JWT_SECRET ||
		"22b3448a49e1be33c5775c1d9f330f96e8e307e347554f2c9df385bc061a15b23a0f47d7271181ca9350c81435dd78a043d717ff40aa14bb75e23f57a2ec0d173205527307adee7a7275c70cbfe3d88493b8685b2ac2cd9331d667d0d6c9b22182bec8c88c6022cf50dd5b673af9ca646ea452468ad7ae72531946ea79b6b97ca99c739bf020e812e5f7790bda13f2f25828a4fcec9ea8a2d8d870f3134e2fd7d5de95ee1820c73dd6615bc38e92ca6eae5c21230452f8d63b4a54e2037a9f895d60d75e9f3b3b41edceb79bdd797787ec24dfd03f8cc3d9d8b781668e1cb02bc08fe8462b051e4fc094b0a07e4d8cd62b1fedac1bbbf3a65bceaa0de28927c3",
	JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
	JWT_REFRESH_SECRET:
		process.env.JWT_REFRESH_SECRET ||
		"0c0c747de7eb18f122703cdd54de99797c1d39268b827370c758a3dde4f4443a272d10565da6c59fe92785dc901e6cf7e02de06cff759b61568b98c4563c260c3c48970e3283e698fcbaf35c53d20a04466e0fead8e06c0019f4990d03808eb0dee19d029ba3fb0701afcd84cd86d7ed8b137fffc3bb75d86fe9b1754165b2f0256d475e56196484ab1e137a71a804166bf72eb9a53cf4a4ef73421b96adfd70e4eeff0dccfbed323ecdefb5ced286a574020876b33e2fd7ee093d488fcc55bb114be10312d765b29dc98eba99824431636ec6d0f777bee242acf41058f8bb18cf6214b4d6f09d8194ae35796822815a454ab31214038cf6e8039c6f937f4722",
	JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",

	// Encryption
	ENCRYPTION_KEY:
		process.env.ENCRYPTION_KEY ||
		"CZSW4cWfW3IpoGPMtpcnWxY8lb2vYDKNrDVS5WQwImzSA5P4XTm5Us0emc4af0Tt",

	// Email/SMTP Configuration
	SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
	SMTP_PORT: parseInt(process.env.SMTP_PORT || "587", 10),
	SMTP_SECURE: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
	SMTP_USER: process.env.SMTP_USER || "",
	SMTP_PASS: process.env.SMTP_PASS || "",
	SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || "KadaCare Health Systems",
	SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL || "noreply@kadacare.com",

	// Rate Limiting
	RATE_LIMIT_WINDOW_MS: parseInt(
		process.env.RATE_LIMIT_WINDOW_MS || "900000",
		10
	),
	RATE_LIMIT_MAX_REQUESTS: parseInt(
		process.env.RATE_LIMIT_MAX_REQUESTS || "100",
		10
	),

	// CORS
	CORS_ORIGIN: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000"],

	// Logging
	LOG_LEVEL: process.env.LOG_LEVEL || "info",
} as const;
