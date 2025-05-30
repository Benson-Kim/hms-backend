import { Repository, MoreThan } from "typeorm";
import { AppDataSource } from "@/config/database";
import { PaginatedResponseDto } from "@/shared/dto/base.dto";
import { User } from "../entities/user.entity";
import { UserListDto } from "../dto/user.dto";

export class UserRepository extends Repository<User> {
	constructor() {
		super(User, AppDataSource.manager);
	}

	async findByEmail(email: string): Promise<User | null> {
		return this.findOne({
			where: { email: email.toLowerCase() },
			select: [
				"id",
				"firstName",
				"lastName",
				"email",
				"password",
				"isActive",
				"isEmailVerified",
			],
		});
	}

	async findByIdWithRoles(id: string): Promise<User | null> {
		return this.createQueryBuilder("user")
			.leftJoinAndSelect("user.userRoles", "userRole")
			.leftJoinAndSelect("userRole.role", "role")
			.leftJoinAndSelect("role.rolePermissions", "rolePermission")
			.leftJoinAndSelect("rolePermission.permission", "permission")
			.where("user.id = :id", { id })
			.andWhere("user.isActive = true")
			.andWhere("role.isActive = true")
			.andWhere("permission.isActive = true")
			.getOne();
	}

	async findWithPagination(
		params: UserListDto
	): Promise<PaginatedResponseDto<User>> {
		const {
			page = 1,
			limit = 10,
			search,
			isActive,
			role,
			sortBy = "createdAt",
			sortOrder = "DESC",
		} = params;
		const skip = (page - 1) * limit;

		const query = this.createQueryBuilder("user")
			.leftJoinAndSelect("user.userRoles", "userRole")
			.leftJoinAndSelect("userRole.role", "role");

		if (search) {
			query.andWhere(
				"(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)",
				{ search: `%${search}%` }
			);
		}

		if (typeof isActive === "boolean") {
			query.andWhere("user.isActive = :isActive", { isActive });
		}

		if (role) {
			query.andWhere("role.name = :role", { role });
		}

		query.orderBy(`user.${sortBy}`, sortOrder);
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

	async updateLastLogin(id: string, ip: string): Promise<void> {
		await this.update(id, {
			lastLoginAt: new Date(),
			lastLoginIp: ip,
		});
	}

	async findByEmailVerificationToken(token: string): Promise<User | null> {
		return this.findOne({
			where: {
				emailVerificationToken: token,
				emailVerificationExpiresAt: MoreThan(new Date()),
			},
		});
	}

	async findByPasswordResetToken(token: string): Promise<User | null> {
		return this.findOne({
			where: {
				passwordResetToken: token,
				passwordResetExpiresAt: MoreThan(new Date()),
			},
		});
	}
}
