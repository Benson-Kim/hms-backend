import { DataSource } from "typeorm";
import { config } from "./constants";
import { User } from "@/modules/User/entities/user.entity";
import { Role } from "@/modules/Auth/entities/role.entity";
import { Permission } from "@/modules/Auth/entities/permission.entity";
import { RolePermission } from "@/modules/Auth/entities/role-permission.entity";
import { UserRole } from "@/modules/User/entities/user-role.entity";
import {
	Address,
	InsuranceDetail,
	NextOfKin,
	Patient,
	PatientConsent,
	PatientDocument,
} from "@/modules/Registration/entities";

export const AppDataSource = new DataSource({
	type: "postgres",
	host: config.DB_HOST,
	port: config.DB_PORT,
	username: config.DB_USERNAME,
	password: config.DB_PASSWORD,
	database: config.DB_DATABASE,
	synchronize: config.NODE_ENV === "development",
	logging: config.DB_LOGGING,
	entities: [
		User,
		Role,
		Permission,
		RolePermission,
		UserRole,
		Patient,
		PatientConsent,
		PatientDocument,
		Address,
		NextOfKin,
		InsuranceDetail,
		// Add other entities here as modules are created
	],
	migrations: ["dist/shared/migrations/*.js"],
	subscribers: ["dist/shared/subscribers/*.js"],
	extra: {
		max: 20,
		idleTimeoutMillis: 30000,
		connectionTimeoutMillis: 2000,
	},
});
