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

	createBatch = asyncHandler(
		async (
			req: AuthenticatedRequest,
			res: Response,
			next: NextFunction
		): Promise<void> => {
			try {
				const dtos: CreatePermissionDto[] = req.body;
				const permissions: unknown[] = [];

				// Define types for better type safety
				interface BatchDuplicate {
					index: number;
					resource: string;
					action: string;
					name: string;
					conflictsWith: number;
				}

				interface ProcessingError {
					index: number;
					name: string;
					resource: string;
					action: string;
					error: string;
				}

				const errors: ProcessingError[] = [];

				// Check for duplicates within the batch first
				const resourceActionMap = new Map<string, number>();
				const batchDuplicates: BatchDuplicate[] = [];

				dtos.forEach((dto, index) => {
					const key = `${dto.resource}:${dto.action}`;
					if (resourceActionMap.has(key)) {
						batchDuplicates.push({
							index,
							resource: dto.resource,
							action: dto.action,
							name: dto.name,
							conflictsWith: resourceActionMap.get(key)!,
						});
					} else {
						resourceActionMap.set(key, index);
					}
				});

				if (batchDuplicates.length > 0) {
					logger.warn("Duplicate resource:action combinations found in batch", {
						userId: req.user?.id,
						duplicates: batchDuplicates,
					});

					const duplicateErrors = batchDuplicates.map((d) => ({
						field: `permissions[${d.index}]`,
						message: `Duplicate resource:action combination "${d.resource}:${d.action}" with permissions[${d.conflictsWith}]`,
					}));

					ResponseUtil.error(
						res,
						`Duplicate resource:action combinations found in batch`,
						400,
						duplicateErrors
					);
					return;
				}

				// Process each permission
				for (let i = 0; i < dtos.length; i++) {
					const dto = dtos[i];
					try {
						const permission = await this.permissionService.create(dto);
						permissions.push(permission);
					} catch (error) {
						const errorMessage =
							error instanceof Error ? error.message : "Unknown error";
						errors.push({
							index: i,
							name: dto.name,
							resource: dto.resource,
							action: dto.action,
							error: errorMessage,
						});

						logger.error("Failed to create individual permission", {
							userId: req.user?.id,
							index: i,
							permission: dto,
							error: errorMessage,
						});
					}
				}

				// If there are any errors, return detailed information
				if (errors.length > 0) {
					logger.error("Some permissions failed to create", {
						userId: req.user?.id,
						successCount: permissions.length,
						errorCount: errors.length,
						errors,
					});

					const formattedErrors = errors.map((e) => ({
						field: `permissions[${e.index}]`,
						message: `${e.name} (${e.resource}:${e.action}): ${e.error}`,
					}));

					ResponseUtil.error(
						res,
						`Failed to create ${errors.length} out of ${dtos.length} permissions. ${permissions.length} were created successfully.`,
						400,
						formattedErrors
					);
				}

				logger.info("Permissions batch created successfully", {
					userId: req.user?.id,
					count: permissions.length,
				});

				ResponseUtil.success(
					res,
					permissions,
					"Permissions batch created successfully",
					201
				);
			} catch (error) {
				logger.error("Failed to create permissions batch", {
					userId: req.user?.id,
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
