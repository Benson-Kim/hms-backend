import { Repository } from "typeorm";
import {
	ConflictError,
	NotFoundError,
} from "@/core/middleware/error.middleware";
import { logger } from "@/core/utils/logger.util";
import { Permission } from "../entities/permission.entity";
import { AppDataSource } from "@/config/database";

// src/modules/auth/services/permission.service.ts
export class PermissionService {
	private permissionRepository: Repository<Permission>;

	constructor() {
		this.permissionRepository = AppDataSource.getRepository(Permission);
	}

	async findAll(params: {
		page?: number;
		limit?: number;
		search?: string;
		resource?: string;
		action?: string;
		isActive?: boolean;
		sortBy?: string;
		sortOrder?: "ASC" | "DESC";
	}) {
		const {
			page = 1,
			limit = 10,
			search,
			resource,
			action,
			isActive,
			sortBy = "createdAt",
			sortOrder = "DESC",
		} = params;

		const skip = (page - 1) * limit;
		const query = this.permissionRepository.createQueryBuilder("permission");

		if (search) {
			query.andWhere(
				"(permission.name ILIKE :search OR permission.description ILIKE :search)",
				{ search: `%${search}%` }
			);
		}

		if (resource) {
			query.andWhere("permission.resource = :resource", { resource });
		}

		if (action) {
			query.andWhere("permission.action = :action", { action });
		}

		if (typeof isActive === "boolean") {
			query.andWhere("permission.isActive = :isActive", { isActive });
		}

		query.orderBy(`permission.${sortBy}`, sortOrder);
		query.skip(skip).take(limit);

		const [data, total] = await query.getManyAndCount();

		return {
			data,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
			hasNext: page < Math.ceil(total / limit),
			hasPrev: page > 1,
		};
	}

	async findById(id: string): Promise<Permission> {
		const permission = await this.permissionRepository.findOne({
			where: { id, isActive: true },
		});

		if (!permission) {
			throw new NotFoundError("Permission not found");
		}

		return permission;
	}

	async create(createPermissionDto: {
		name: string;
		description?: string;
		resource: string;
		action: string;
	}): Promise<Permission> {
		// Check if permission already exists
		const existingPermission = await this.permissionRepository.findOne({
			where: {
				resource: createPermissionDto.resource,
				action: createPermissionDto.action,
			},
		});

		if (existingPermission) {
			throw new ConflictError(
				"Permission with this resource and action already exists"
			);
		}

		const permission = this.permissionRepository.create(createPermissionDto);
		const savedPermission = await this.permissionRepository.save(permission);

		logger.info("Permission created successfully:", {
			permissionId: savedPermission.id,
			name: savedPermission.name,
		});

		return savedPermission;
	}

	async update(
		id: string,
		updatePermissionDto: {
			name?: string;
			description?: string;
			resource?: string;
			action?: string;
		}
	): Promise<Permission> {
		const permission = await this.findById(id);

		// Check if resource/action combination already exists (if updating)
		if (updatePermissionDto.resource || updatePermissionDto.action) {
			const resource = updatePermissionDto.resource || permission.resource;
			const action = updatePermissionDto.action || permission.action;

			const existingPermission = await this.permissionRepository.findOne({
				where: { resource, action },
			});

			if (existingPermission && existingPermission.id !== id) {
				throw new ConflictError(
					"Permission with this resource and action already exists"
				);
			}
		}

		Object.assign(permission, updatePermissionDto);
		const updatedPermission = await this.permissionRepository.save(permission);

		logger.info("Permission updated successfully:", { permissionId: id });
		return updatedPermission;
	}

	async delete(id: string): Promise<void> {
		const permission = await this.findById(id);

		await this.permissionRepository.update(id, { isActive: false });

		logger.info("Permission deleted successfully:", {
			permissionId: id,
			name: permission.name,
		});
	}
}
