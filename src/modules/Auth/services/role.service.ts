import { EntityManager, Repository } from "typeorm";
import { AppDataSource } from "@/config/database";
import { RoleRepository } from "../repositories/role.repository";
import { Role } from "../entities/role.entity";
import { Permission } from "../entities/permission.entity";
import { RolePermission } from "../entities/role-permission.entity";
import {
	ConflictError,
	NotFoundError,
	ValidationError,
} from "@/core/middleware/error.middleware";
import { logger } from "@/core/utils/logger.util";

// src/modules/auth/services/role.service.ts
export class RoleService {
	private roleRepository: RoleRepository;
	private permissionRepository: Repository<Permission>;
	private rolePermissionRepository: Repository<RolePermission>;

	constructor() {
		this.roleRepository = new RoleRepository();
		this.permissionRepository = AppDataSource.getRepository(Permission);
		this.rolePermissionRepository = AppDataSource.getRepository(RolePermission);
	}

	async findAll(params: {
		page?: number;
		limit?: number;
		search?: string;
		isActive?: boolean;
		sortBy?: string;
		sortOrder?: "ASC" | "DESC";
	}) {
		return this.roleRepository.findWithPagination(params);
	}

	async findById(id: string): Promise<Role> {
		const role = await this.roleRepository.findByIdWithPermissions(id);
		if (!role) {
			throw new NotFoundError("Role not found");
		}
		return role;
	}

	async create(createRoleDto: {
		name: string;
		description?: string;
		permissionIds?: string[];
	}): Promise<Role> {
		const queryRunner = AppDataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			// Check if role already exists
			const existingRole = await this.roleRepository.findByName(
				createRoleDto.name
			);
			if (existingRole) {
				throw new ConflictError("Role with this name already exists");
			}

			// Create role
			const role = this.roleRepository.create({
				name: createRoleDto.name,
				description: createRoleDto.description,
			});

			const savedRole = await queryRunner.manager.save(role);

			// Assign permissions if provided
			if (
				createRoleDto.permissionIds &&
				createRoleDto.permissionIds.length > 0
			) {
				await this.assignPermissions(
					savedRole.id,
					createRoleDto.permissionIds,
					queryRunner.manager
				);
			}

			await queryRunner.commitTransaction();

			logger.info("Role created successfully:", {
				roleId: savedRole.id,
				name: savedRole.name,
			});

			return savedRole;
		} catch (error) {
			await queryRunner.rollbackTransaction();
			throw error;
		} finally {
			await queryRunner.release();
		}
	}

	async update(
		id: string,
		updateRoleDto: {
			name?: string;
			description?: string;
			isSystemRole?: boolean;
			isActive?: boolean;
			permissionIds?: string[];
		}
	): Promise<Role> {
		const queryRunner = AppDataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			const role = await this.findById(id);

			// Check if role name already exists (if updating name)
			if (updateRoleDto.name && updateRoleDto.name !== role.name) {
				const existingRole = await this.roleRepository.findByName(
					updateRoleDto.name
				);
				if (existingRole) {
					throw new ConflictError("Role with this name already exists");
				}
			}

			// Update role
			Object.assign(role, {
				name: updateRoleDto.name || role.name,
				description: updateRoleDto.description ?? role.description,
				isSystemRole: updateRoleDto.isSystemRole ?? role.isSystemRole,
				isActive: updateRoleDto.isActive ?? role.isActive,
			});

			const updatedRole = await queryRunner.manager.save(role);

			// Update permissions if provided
			if (updateRoleDto.permissionIds) {
				await this.updateRolePermissions(
					id,
					updateRoleDto.permissionIds,
					queryRunner.manager
				);
			}

			await queryRunner.commitTransaction();

			logger.info("Role updated successfully:", { roleId: id });
			return updatedRole;
		} catch (error) {
			await queryRunner.rollbackTransaction();
			throw error;
		} finally {
			await queryRunner.release();
		}
	}

	async delete(id: string): Promise<void> {
		const role = await this.findById(id);

		if (role.isSystemRole) {
			throw new ValidationError("System roles cannot be deleted");
		}

		await this.roleRepository.update(id, { isActive: false });

		logger.info("Role deleted successfully:", {
			roleId: id,
			name: role.name,
		});
	}

	private async assignPermissions(
		roleId: string,
		permissionIds: string[],
		manager: EntityManager
	): Promise<void> {
		const rolePermissions = permissionIds.map((permissionId) => ({
			roleId,
			permissionId,
		}));

		await manager.save(RolePermission, rolePermissions);
	}

	private async updateRolePermissions(
		roleId: string,
		permissionIds: string[],
		manager: EntityManager
	): Promise<void> {
		// Remove existing permissions
		await manager.delete(RolePermission, { roleId });

		// Add new permissions
		if (permissionIds.length > 0) {
			await this.assignPermissions(roleId, permissionIds, manager);
		}
	}
}
