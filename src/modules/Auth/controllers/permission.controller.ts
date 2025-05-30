// src/modules/auth/controllers/permission.controller.ts
import { Response, NextFunction } from "express";
import { PermissionService } from "../services/permission.service";
import { ResponseUtil } from "@/core/utils/response.util";
import { logger } from "@/core/utils/logger.util";
import { CreatePermissionDto, UpdatePermissionDto } from "../dto/auth.dto";
import { PaginationDto } from "@/shared/dto/base.dto";
import { asyncHandler } from "@/core/middleware/error.middleware";
import { AuthenticatedRequest } from "@/core/types/common.types";

export class PermissionController {
	private permissionService: PermissionService;

	constructor() {
		this.permissionService = new PermissionService();
	}

	findAll = asyncHandler(
		async (
			req: AuthenticatedRequest,
			res: Response,
			next: NextFunction
		): Promise<void> => {
			try {
				const query = req.query as unknown as PaginationDto & {
					resource?: string;
					action?: string;
					isActive?: boolean;
				};

				const result = await this.permissionService.findAll({
					page: query.page,
					limit: query.limit,
					search: query.search,
					resource: query.resource,
					action: query.action,
					isActive: query.isActive,
					sortBy: query.sortBy,
					sortOrder: query.sortOrder,
				});

				logger.info("Permissions retrieved successfully", {
					userId: req.user?.id,
					total: result.total,
					page: result.page,
				});

				ResponseUtil.success(res, result, "Permissions retrieved successfully");
			} catch (error) {
				logger.error("Failed to retrieve permissions", {
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
				const permission = await this.permissionService.findById(id);

				logger.info("Permission retrieved successfully", {
					userId: req.user?.id,
					permissionId: id,
				});

				ResponseUtil.success(
					res,
					permission,
					"Permission retrieved successfully"
				);
			} catch (error) {
				logger.error("Failed to retrieve permission", {
					userId: req.user?.id,
					permissionId: req.params.id,
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
				const createPermissionDto: CreatePermissionDto = req.body;
				const permission = await this.permissionService.create(
					createPermissionDto
				);

				logger.info("Permission created successfully", {
					userId: req.user?.id,
					permissionId: permission.id,
					name: permission.name,
				});

				ResponseUtil.success(
					res,
					permission,
					"Permission created successfully",
					201
				);
			} catch (error) {
				logger.error("Failed to create permission", {
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
				const updatePermissionDto: UpdatePermissionDto = req.body;
				const permission = await this.permissionService.update(
					id,
					updatePermissionDto
				);

				logger.info("Permission updated successfully", {
					userId: req.user?.id,
					permissionId: id,
				});

				ResponseUtil.success(
					res,
					permission,
					"Permission updated successfully"
				);
			} catch (error) {
				logger.error("Failed to update permission", {
					userId: req.user?.id,
					permissionId: req.params.id,
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
				await this.permissionService.delete(id);

				logger.info("Permission deleted successfully", {
					userId: req.user?.id,
					permissionId: id,
				});

				ResponseUtil.success(res, null, "Permission deleted successfully");
			} catch (error) {
				logger.error("Failed to delete permission", {
					userId: req.user?.id,
					permissionId: req.params.id,
					error: error instanceof Error ? error.message : "Unknown error",
				});
				next(error);
			}
		}
	);
}
