import { UserRepository } from "../repositories/user.repository";

import { User } from "../entities/user.entity";
import { UserRole } from "../entities/user-role.entity";
import { EncryptionUtil } from "@/core/utils/encryption.util";
import {
	NotFoundError,
	ValidationError,
	UnauthorizedError,
} from "@/core/middleware/error.middleware";
import { PaginatedResponseDto } from "@/shared/dto/base.dto";
import { AppDataSource } from "@/config/database";
import { logger } from "@/core/utils/logger.util";
import { RoleRepository } from "@/modules/Auth/repositories/role.repository";
import {
	CreateUserDto,
	UpdateUserDto,
	ChangePasswordDto,
	UserListDto,
} from "../dto/user.dto";
import { EntityManager } from "typeorm";

export class UserService {
	private userRepository: UserRepository;
	private roleRepository: RoleRepository;

	constructor() {
		this.userRepository = new UserRepository();
		this.roleRepository = new RoleRepository();
	}

	async create(createUserDto: CreateUserDto): Promise<User> {
		const queryRunner = AppDataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			// Check if user already exists
			const existingUser = await this.userRepository.findByEmail(
				createUserDto.email
			);
			if (existingUser) {
				throw new ValidationError("User with this email already exists");
			}

			// Hash password
			const hashedPassword = await EncryptionUtil.hashPassword(
				createUserDto.password
			);

			// Create user
			const user = this.userRepository.create({
				firstName: createUserDto.firstName,
				lastName: createUserDto.lastName,
				email: createUserDto.email.toLowerCase(),
				password: hashedPassword,
				phone: createUserDto.phone,
				dateOfBirth: createUserDto.dateOfBirth
					? new Date(createUserDto.dateOfBirth)
					: undefined,
				emailVerificationToken: EncryptionUtil.generateSecureToken(),
			});

			const savedUser = await queryRunner.manager.save(user);

			// Assign roles if provided
			if (createUserDto.roleIds && createUserDto.roleIds.length > 0) {
				await this.assignRoles(
					savedUser.id,
					createUserDto.roleIds,
					queryRunner.manager
				);
			} else {
				// Assign default user role
				const defaultRole = await this.roleRepository.findByName("user");
				if (defaultRole) {
					await this.assignRoles(
						savedUser.id,
						[defaultRole.id],
						queryRunner.manager
					);
				}
			}

			await queryRunner.commitTransaction();

			logger.info("User created successfully:", {
				userId: savedUser.id,
				email: savedUser.email,
			});
			return savedUser;
		} catch (error) {
			await queryRunner.rollbackTransaction();
			throw error;
		} finally {
			await queryRunner.release();
		}
	}

	async findAll(params: UserListDto): Promise<PaginatedResponseDto<User>> {
		return this.userRepository.findWithPagination(params);
	}

	async findById(id: string): Promise<User> {
		const user = await this.userRepository.findOne({
			where: { id },
			relations: ["userRoles", "userRoles.role"],
		});

		if (!user) {
			throw new NotFoundError("User not found");
		}

		return user;
	}

	async findByIdWithRoles(id: string): Promise<User | null> {
		const user = await this.userRepository.findByIdWithRoles(id);

		if (user) {
			// Transform the nested structure for easier access
			user.roles =
				user.userRoles?.map((ur) => ({
					id: ur.role.id,
					name: ur.role.name,
					permissions:
						ur.role.rolePermissions?.map((rp) => ({
							id: rp.permission.id,
							name: rp.permission.name,
							resource: rp.permission.resource,
							action: rp.permission.action,
						})) || [],
				})) || [];
		}

		return user;
	}

	async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
		const queryRunner = AppDataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			const user = await this.findById(id);

			// Update user fields
			Object.assign(user, {
				...updateUserDto,
				dateOfBirth: updateUserDto.dateOfBirth
					? new Date(updateUserDto.dateOfBirth)
					: user.dateOfBirth,
			});

			const updatedUser = await queryRunner.manager.save(user);

			// Update roles if provided
			if (updateUserDto.roleIds) {
				await this.updateUserRoles(
					id,
					updateUserDto.roleIds,
					queryRunner.manager
				);
			}

			await queryRunner.commitTransaction();

			logger.info("User updated successfully:", { userId: id });
			return updatedUser;
		} catch (error) {
			await queryRunner.rollbackTransaction();
			throw error;
		} finally {
			await queryRunner.release();
		}
	}

	async changePassword(
		id: string,
		changePasswordDto: ChangePasswordDto
	): Promise<void> {
		const user = await this.userRepository.findOne({
			where: { id },
			select: ["id", "password"],
		});

		if (!user) {
			throw new NotFoundError("User not found");
		}

		// Verify current password
		const isCurrentPasswordValid = await EncryptionUtil.comparePassword(
			changePasswordDto.currentPassword,
			user.password
		);

		if (!isCurrentPasswordValid) {
			throw new UnauthorizedError("Current password is incorrect");
		}

		// Hash new password
		const hashedNewPassword = await EncryptionUtil.hashPassword(
			changePasswordDto.newPassword
		);

		await this.userRepository.update(id, { password: hashedNewPassword });

		logger.info("Password changed successfully:", { userId: id });
	}

	async delete(id: string): Promise<void> {
		const user = await this.findById(id);
		await this.userRepository.softDelete(id);
		logger.info("User deleted successfully:", {
			userId: id,
			email: user.email,
		});
	}

	private async assignRoles(
		userId: string,
		roleIds: string[],
		manager: EntityManager
	): Promise<void> {
		const userRoles = roleIds.map((roleId) => ({
			userId,
			roleId,
		}));

		await manager.save(UserRole, userRoles);
	}

	private async updateUserRoles(
		userId: string,
		roleIds: string[],
		manager: EntityManager
	): Promise<void> {
		// Remove existing roles
		await manager.delete(UserRole, { userId });

		// Add new roles
		if (roleIds.length > 0) {
			await this.assignRoles(userId, roleIds, manager);
		}
	}
}
