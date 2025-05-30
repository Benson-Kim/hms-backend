import { Router } from "express";
import { UserController } from "./controllers/user.controller";
import { authMiddleware } from "@/core/middleware/auth.middleware";
import { requirePermission } from "@/core/middleware/rbac.middleware";
import {
	validateBody,
	validateQuery,
	validateParams,
} from "@/core/middleware/validation.middleware";

import { UUIDDto } from "@/shared/dto/base.dto";
import {
	CreateUserDto,
	UpdateUserDto,
	UserListDto,
	ChangePasswordDto,
} from "./dto/user.dto";

const router = Router();
const userController = new UserController();

// Public routes (none for users - must be authenticated)

// Protected routes
router.use(authMiddleware);

// Get current user profile
router.get("/profile", userController.getProfile);

// Change password
router.patch(
	"/password",
	validateBody(ChangePasswordDto),
	userController.changePassword
);

// Admin routes
router.get(
	"/",
	requirePermission("user", "view"),
	validateQuery(UserListDto),
	userController.findAll
);

router.post(
	"/",
	requirePermission("user", "create"),
	validateBody(CreateUserDto),
	userController.create
);

router.get(
	"/:id",
	requirePermission("user", "view"),
	validateParams(UUIDDto),
	userController.findById
);

router.put(
	"/:id",
	requirePermission("user", "update"),
	validateParams(UUIDDto),
	validateBody(UpdateUserDto),
	userController.update
);

router.delete(
	"/:id",
	requirePermission("user", "delete"),
	validateParams(UUIDDto),
	userController.delete
);

export { router as userRoutes };
