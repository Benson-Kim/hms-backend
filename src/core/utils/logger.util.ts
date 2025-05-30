import { config } from "@/config/constants";
import winston from "winston";

const logFormat = winston.format.combine(
	winston.format.timestamp(),
	winston.format.errors({ stack: true }),
	winston.format.json()
);

export const logger = winston.createLogger({
	level: config.LOG_LEVEL,
	format: logFormat,
	defaultMeta: { service: "kadacare-health-systems" },
	transports: [
		new winston.transports.File({
			filename: "logs/error.log",
			level: "error",
			maxsize: 10485760, // 10MB
			maxFiles: 5,
		}),
		new winston.transports.File({
			filename: "logs/combined.log",
			maxsize: 10485760, // 10MB
			maxFiles: 10,
		}),
	],
});

if (config.NODE_ENV !== "production") {
	logger.add(
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.simple()
			),
		})
	);
}
