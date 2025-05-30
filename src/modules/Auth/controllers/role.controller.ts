// src/modules/auth/controllers/role.controller.ts
import { Response, NextFunction } from "express";
import { RoleService } from "../services/role.service";
import { ResponseUtil } from "@/core/utils/response.util";
import { logger } from "@/core/utils/logger.util";
import { CreateRoleDto, UpdateRoleDto } from "../dto/auth.dto";
import { PaginationDto } from "@/shared/dto/base.dto";
import { asyncHandler } from "@/core/middleware/error.middleware";
import { AuthenticatedRequest } from "@/core/types/common.types";

export class RoleController {
	private roleService: RoleService;

	constructor() {
		this.roleService = new RoleService();
	}

	findAll = asyncHandler(
		async (
			req: AuthenticatedRequest,
			res: Response,
			next: NextFunction
		): Promise<void> => {
			try {
				const query = req.query as unknown as PaginationDto & {
					isActive?: boolean;
				};

				const result = await this.roleService.findAll({
					page: query.page,
					limit: query.limit,
					search: query.search,
					isActive: query.isActive,
					sortBy: query.sortBy,
					sortOrder: query.sortOrder,
				});

				logger.info("Roles retrieved successfully", {
					userId: req.user?.id,
					total: result.total,
					page: result.page,
				});

				ResponseUtil.success(res, result, "Roles retrieved successfully");
			} catch (error) {
				logger.error("Failed to retrieve roles", {
					userId: req.user?.id,
					error: error instanceof Error ? error.message : "Unknown error",
				});
				next(error);
			}
		}
	);

	findById = asyncHandler(
		async (
			req: AuthenticatedRequest,
			res: Response,
			next: NextFunction
		): Promise<void> => {
			try {
				const { id } = req.params;
				const role = await this.roleService.findById(id);

				logger.info("Role retrieved successfully", {
					userId: req.user?.id,
					roleId: id,
				});

				ResponseUtil.success(res, role, "Role retrieved successfully");
			} catch (error) {
				logger.error("Failed to retrieve role", {
					userId: req.user?.id,
					roleId: req.params.id,
					error: error instanceof Error ? error.message : "Unknown error",
				});
				next(error);
			}
		}
	);

	create = asyncHandler(
		async (
			req: AuthenticatedRequest,
			res: Response,
			next: NextFunction
		): Promise<void> => {
			try {
				const createRoleDto: CreateRoleDto = req.body;
				const role = await this.roleService.create(createRoleDto);

				logger.info("Role created successfully", {
					userId: req.user?.id,
					roleId: role.id,
					name: role.name,
				});

				ResponseUtil.success(res, role, "Role created successfully", 201);
			} catch (error) {
				logger.error("Failed to create role", {
					userId: req.user?.id,
					name: req.body?.name,
					error: error instanceof Error ? error.message : "Unknown error",
				});
				next(error);
			}
		}
	);

	update = asyncHandler(
		async (
			req: AuthenticatedRequest,
			res: Response,
			next: NextFunction
		): Promise<void> => {
			try {
				const { id } = req.params;
				const updateRoleDto: UpdateRoleDto = req.body;
				const role = await this.roleService.update(id, updateRoleDto);

				logger.info("Role updated successfully", {
					userId: req.user?.id,
					roleId: id,
				});

				ResponseUtil.success(res, role, "Role updated successfully");
			} catch (error) {
				logger.error("Failed to update role", {
					userId: req.user?.id,
					roleId: req.params.id,
					error: error instanceof Error ? error.message : "Unknown error",
				});
				next(error);
			}
		}
	);

	delete = asyncHandler(
		async (
			req: AuthenticatedRequest,
			res: Response,
			next: NextFunction
		): Promise<void> => {
			try {
				const { id } = req.params;
				await this.roleService.delete(id);

				logger.info("Role deleted successfully", {
					userId: req.user?.id,
					roleId: id,
				});

				ResponseUtil.success(res, null, "Role deleted successfully");
			} catch (error) {
				logger.error("Failed to delete role", {
					userId: req.user?.id,
					roleId: req.params.id,
					error: error instanceof Error ? error.message : "Unknown error",
				});
				next(error);
			}
		}
	);
}
