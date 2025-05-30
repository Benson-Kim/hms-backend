import "reflect-metadata";
import { createApp } from "./config/app";
import { config } from "./config/constants";
import { AppDataSource } from "./config/database";
import { logger } from "./core/utils/logger.util";

async function bootstrap() {
	try {
		// Initialize database connection
		await AppDataSource.initialize();
		logger.info("Database connected successfully");

		// Create Express app
		const app = createApp();

		// Start server
		const server = app.listen(config.PORT, () => {
			logger.info(
				`Server running on port ${config.PORT} in ${config.NODE_ENV} mode`
			);
		});

		// Graceful shutdown
		process.on("SIGTERM", () => {
			logger.info("SIGTERM received, shutting down gracefully");
			server.close(() => {
				AppDataSource.destroy();
				process.exit(0);
			});
		});
	} catch (error) {
		logger.error("Error starting application:", error);
		process.exit(1);
	}
}

bootstrap();
