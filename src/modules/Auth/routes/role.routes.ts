// src/modules/auth/routes/role.routes.ts
import { Router } from "express";
import { RoleController } from "../controllers/role.controller";
import { authMiddleware } from "@/core/middleware/auth.middleware";
import { requirePermission } from "@/core/middleware/rbac.middleware";
import {
	validateBody,
	validateQuery,
	validateParams,
} from "@/core/middleware/validation.middleware";
import { UUIDDto, PaginationDto } from "@/shared/dto/base.dto";
import { CreateRoleDto, UpdateRoleDto } from "../dto/auth.dto";

const router = Router();
const roleController = new RoleController();

// All role routes require authentication
router.use(authMiddleware);

// Extended query DTO for role filtering
class RoleListDto extends PaginationDto {
	isActive?: boolean;
}

// Get all roles
router.get(
	"/",
	requirePermission("ROLE", "VIEW"),
	validateQuery(RoleListDto),
	roleController.findAll
);

// Create role
router.post(
	"/",
	requirePermission("ROLE", "CREATE"),
	validateBody(CreateRoleDto),
	roleController.create
);

// Get role by ID
router.get(
	"/:id",
	requirePermission("ROLE", "VIEW"),
	validateParams(UUIDDto),
	roleController.findById
);

// Update role
router.put(
	"/update/:id",
	requirePermission("ROLE", "UPDATE"),
	validateParams(UUIDDto),
	validateBody(UpdateRoleDto),
	roleController.update
);

// Delete role (soft delete)
router.delete(
	"/delete/:id",
	requirePermission("ROLE", "DELETE"),
	validateParams(UUIDDto),
	roleController.delete
);

export { router as roleRoutes };
