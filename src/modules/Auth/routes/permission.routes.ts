// src/modules/auth/routes/permission.routes.ts
import { Router } from "express";
import { PermissionController } from "../controllers/permission.controller";
import { authMiddleware } from "@/core/middleware/auth.middleware";
import { requirePermission } from "@/core/middleware/rbac.middleware";
import {
	validateBody,
	validateQuery,
	validateParams,
	validateBodyArray,
} from "@/core/middleware/validation.middleware";
import { UUIDDto, PaginationDto } from "@/shared/dto/base.dto";
import { CreatePermissionDto, UpdatePermissionDto } from "../dto/auth.dto";

const router = Router();
const permissionController = new PermissionController();

// All permission routes require authentication
router.use(authMiddleware);

// Extended query DTO for permission filtering
class PermissionListDto extends PaginationDto {
	resource?: string;
	action?: string;
	isActive?: boolean;
}

// Get all permissions
router.get(
	"/",
	requirePermission("PERMISSION", "VIEW"),
	validateQuery(PermissionListDto),
	permissionController.findAll
);

// Create permission
router.post(
	"/",
	requirePermission("PERMISSION", "CREATE"),
	validateBody(CreatePermissionDto),
	permissionController.create
);

router.post(
	"/batch",
	requirePermission("PERMISSION", "CREATE"),
	validateBodyArray(CreatePermissionDto),
	permissionController.createBatch
);

// Get permission by ID
router.get(
	"/:id",
	requirePermission("PERMISSION", "VIEW"),
	validateParams(UUIDDto),
	permissionController.findById
);

// Update permission
router.put(
	"/:id",
	requirePermission("PERMISSION", "UPDATE"),
	validateParams(UUIDDto),
	validateBody(UpdatePermissionDto),
	permissionController.update
);

// Delete permission (soft delete)
router.delete(
	"/:id",
	requirePermission("PERMISSION", "DELETE"),
	validateParams(UUIDDto),
	permissionController.delete
);

export { router as permissionRoutes };
