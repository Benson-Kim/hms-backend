import { createClient } from "redis";
import { config } from "./constants";
import { logger } from "@/core/utils/logger.util";

export const redisClient = createClient({
	socket: {
		host: config.REDIS_HOST,
		port: config.REDIS_PORT,
	},
	password: config.REDIS_PASSWORD || undefined,
});

redisClient.on("error", (err: Error) => {
	logger.error("Redis Client Error:", err);
});

redisClient.on("connect", () => {
	logger.info("Redis Client Connected");
});

export async function connectRedis(): Promise<void> {
	if (redisClient.isOpen) {
		logger.info("Redis client is already connected");
		return;
	}

	try {
		await redisClient.connect();
	} catch (error) {
		logger.error("Failed to connect to Redis:", error);
		throw error;
	}
}
export { createClient };
