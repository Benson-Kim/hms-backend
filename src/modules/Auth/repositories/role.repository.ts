import { Repository } from "typeorm";
import { AppDataSource } from "@/config/database";
import { PaginatedResponseDto } from "@/shared/dto/base.dto";
import { Role } from "../entities/role.entity";

export class RoleRepository extends Repository<Role> {
	constructor() {
		super(Role, AppDataSource.manager);
	}

	async findByName(name: string): Promise<Role | null> {
		return this.findOne({
			where: { name, isActive: true },
			relations: ["rolePermissions", "rolePermissions.permission"],
		});
	}

	async findByIdWithPermissions(id: string): Promise<Role | null> {
		return this.createQueryBuilder("role")
			.leftJoinAndSelect("role.rolePermissions", "rolePermission")
			.leftJoinAndSelect("rolePermission.permission", "permission")
			.where("role.id = :id", { id })
			.andWhere("role.isActive = true")
			.andWhere("permission.isActive = true")
			.getOne();
	}

	async findWithPagination(params: {
		page?: number;
		limit?: number;
		search?: string;
		isActive?: boolean;
		sortBy?: string;
		sortOrder?: "ASC" | "DESC";
	}): Promise<PaginatedResponseDto<Role>> {
		const {
			page = 1,
			limit = 10,
			search,
			isActive,
			sortBy = "createdAt",
			sortOrder = "DESC",
		} = params;
		const skip = (page - 1) * limit;

		const query = this.createQueryBuilder("role")
			.leftJoinAndSelect("role.rolePermissions", "rolePermission")
			.leftJoinAndSelect("rolePermission.permission", "permission");

		if (search) {
			query.andWhere(
				"(role.name ILIKE :search OR role.description ILIKE :search)",
				{
					search: `%${search}%`,
				}
			);
		}

		if (typeof isActive === "boolean") {
			query.andWhere("role.isActive = :isActive", { isActive });
		}

		query.orderBy(`role.${sortBy}`, sortOrder);
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
}
