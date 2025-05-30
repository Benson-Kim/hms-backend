import { Request, Response } from "express";

import { ResponseUtil } from "@/core/utils/response.util";
import { AuthenticatedRequest } from "@/core/types/common.types";
import { asyncHandler } from "@/core/middleware/error.middleware";
import { UserService } from "../services/user.service";
import {
	CreateUserDto,
	UpdateUserDto,
	ChangePasswordDto,
	UserListDto,
} from "../dto/user.dto";

export class UserController {
	private userService: UserService;

	constructor() {
		this.userService = new UserService();
	}

	create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
		const createUserDto: CreateUserDto = req.body;
		const user = await this.userService.create(createUserDto);
		ResponseUtil.success(res, user, "User created successfully", 201);
	});

	findAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
		const params: UserListDto = req.query;
		const result = await this.userService.findAll(params);
		ResponseUtil.success(res, result, "Users retrieved successfully");
	});

	findById = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const { id } = req.params;
			const user = await this.userService.findById(id);
			ResponseUtil.success(res, user, "User retrieved successfully");
		}
	);

	update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
		const { id } = req.params;
		const updateUserDto: UpdateUserDto = req.body;
		const user = await this.userService.update(id, updateUserDto);
		ResponseUtil.success(res, user, "User updated successfully");
	});

	changePassword = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const changePasswordDto: ChangePasswordDto = req.body;
			await this.userService.changePassword(req.user!.id, changePasswordDto);
			ResponseUtil.success(res, null, "Password changed successfully");
		}
	);

	delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
		const { id } = req.params;
		await this.userService.delete(id);
		ResponseUtil.success(res, null, "User deleted successfully");
	});

	getProfile = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const user = await this.userService.findByIdWithRoles(req.user!.id);
			ResponseUtil.success(res, user, "Profile retrieved successfully");
		}
	);
}
