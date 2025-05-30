// src/modules/auth/controllers/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import { ResponseUtil } from "@/core/utils/response.util";
import { logger } from "@/core/utils/logger.util";
import {
	LoginDto,
	RegisterDto,
	RefreshTokenDto,
	ForgotPasswordDto,
	ResetPasswordDto,
	VerifyEmailDto,
	ResendVerificationDto,
} from "../dto/auth.dto";
import { AuthService } from "../services/auth.service";
import { asyncHandler } from "@/core/middleware/error.middleware";
import { AuthenticatedRequest } from "@/core/types/common.types";

export class AuthController {
	private authService: AuthService;

	constructor() {
		this.authService = new AuthService();
	}

	login = asyncHandler(
		async (req: Request, res: Response, next: NextFunction): Promise<void> => {
			try {
				const loginDto: LoginDto = req.body;
				const result = await this.authService.login(loginDto);

				logger.info("Login successful", {
					userId: result.user.id,
					email: result.user.email,
					ip: req.ip,
					userAgent: req.get("User-Agent"),
				});

				ResponseUtil.success(res, result, "Login successful");
			} catch (error) {
				logger.error("Login failed", {
					email: req.body?.email,
					ip: req.ip,
					error: error instanceof Error ? error.message : "Unknown error",
				});
				next(error);
			}
		}
	);

	register = asyncHandler(
		async (req: Request, res: Response, next: NextFunction): Promise<void> => {
			try {
				const registerDto: RegisterDto = req.body;
				const user = await this.authService.register(registerDto);

				logger.info("Registration successful", {
					userId: user.id,
					email: user.email,
					ip: req.ip,
				});

				ResponseUtil.success(
					res,
					{
						id: user.id,
						email: user.email,
						firstName: user.firstName,
						lastName: user.lastName,
					},
					"Registration successful. Please check your email to verify your account.",
					201
				);
			} catch (error) {
				logger.error("Registration failed", {
					email: req.body?.email,
					error: error instanceof Error ? error.message : "Unknown error",
				});
				next(error);
			}
		}
	);

	refreshToken = asyncHandler(
		async (req: Request, res: Response, next: NextFunction): Promise<void> => {
			try {
				const refreshTokenDto: RefreshTokenDto = req.body;
				const result = await this.authService.refreshToken(refreshTokenDto);

				ResponseUtil.success(res, result, "Token refreshed successfully");
			} catch (error) {
				logger.error("Token refresh failed", {
					error: error instanceof Error ? error.message : "Unknown error",
				});
				next(error);
			}
		}
	);

	forgotPassword = asyncHandler(
		async (req: Request, res: Response, next: NextFunction): Promise<void> => {
			try {
				const forgotPasswordDto: ForgotPasswordDto = req.body;
				await this.authService.forgotPassword(forgotPasswordDto);

				ResponseUtil.success(
					res,
					null,
					"If an account with that email exists, a password reset link has been sent."
				);
			} catch (error) {
				logger.error("Forgot password failed", {
					email: req.body?.email,
					error: error instanceof Error ? error.message : "Unknown error",
				});
				next(error);
			}
		}
	);

	resetPassword = asyncHandler(
		async (req: Request, res: Response, next: NextFunction): Promise<void> => {
			try {
				const resetPasswordDto: ResetPasswordDto = req.body;
				await this.authService.resetPassword(resetPasswordDto);

				ResponseUtil.success(res, null, "Password reset successful");
			} catch (error) {
				logger.error("Password reset failed", {
					error: error instanceof Error ? error.message : "Unknown error",
				});
				next(error);
			}
		}
	);

	verifyEmail = asyncHandler(
		async (req: Request, res: Response, next: NextFunction): Promise<void> => {
			try {
				const verifyEmailDto: VerifyEmailDto = req.body;
				await this.authService.verifyEmail(verifyEmailDto);

				ResponseUtil.success(res, null, "Email verified successfully");
			} catch (error) {
				logger.error("Email verification failed", {
					error: error instanceof Error ? error.message : "Unknown error",
				});
				next(error);
			}
		}
	);

	resendVerification = asyncHandler(
		async (req: Request, res: Response, next: NextFunction): Promise<void> => {
			try {
				const resendVerificationDto: ResendVerificationDto = req.body;
				await this.authService.resendVerification(resendVerificationDto);

				ResponseUtil.success(res, null, "Verification email sent successfully");
			} catch (error) {
				logger.error("Resend verification failed", {
					email: req.body?.email,
					error: error instanceof Error ? error.message : "Unknown error",
				});
				next(error);
			}
		}
	);

	logout = asyncHandler(
		async (
			req: AuthenticatedRequest,
			res: Response,
			next: NextFunction
		): Promise<void> => {
			try {
				// For stateless JWT, logout is handled client-side by removing the token
				// You could implement a token blacklist here if needed

				logger.info("User logged out", {
					userId: req.user?.id,
					email: req.user?.email,
				});

				ResponseUtil.success(res, null, "Logged out successfully");
			} catch (error) {
				logger.error("Logout failed", {
					error: error instanceof Error ? error.message : "Unknown error",
				});
				next(error);
			}
		}
	);

	getProfile = asyncHandler(
		async (
			req: AuthenticatedRequest,
			res: Response,
			next: NextFunction
		): Promise<void> => {
			try {
				// The user data is already available from auth middleware
				const user = req.user;

				ResponseUtil.success(res, user, "Profile retrieved successfully");
			} catch (error) {
				logger.error("Get profile failed", {
					userId: req.user?.id,
					error: error instanceof Error ? error.message : "Unknown error",
				});
				next(error);
			}
		}
	);
}
