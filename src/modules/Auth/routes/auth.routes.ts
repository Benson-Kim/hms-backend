// src/modules/auth/routes/auth.routes.ts
import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "@/core/middleware/auth.middleware";
import { validateBody } from "@/core/middleware/validation.middleware";
import {
	LoginDto,
	RegisterDto,
	RefreshTokenDto,
	ForgotPasswordDto,
	ResetPasswordDto,
	VerifyEmailDto,
	ResendVerificationDto,
} from "../dto/auth.dto";

const router = Router();
const authController = new AuthController();

// Public routes - no authentication required
router.post("/login", validateBody(LoginDto), authController.login);

router.post("/register", validateBody(RegisterDto), authController.register);

router.post(
	"/refresh-token",
	validateBody(RefreshTokenDto),
	authController.refreshToken
);

router.post(
	"/forgot-password",
	validateBody(ForgotPasswordDto),
	authController.forgotPassword
);

router.post(
	"/reset-password",
	validateBody(ResetPasswordDto),
	authController.resetPassword
);

router.post(
	"/verify-email",
	validateBody(VerifyEmailDto),
	authController.verifyEmail
);

router.post(
	"/resend-verification",
	validateBody(ResendVerificationDto),
	authController.resendVerification
);

// Protected routes - authentication required
router.use(authMiddleware);

router.post("/logout", authController.logout);

router.get("/profile", authController.getProfile);

export { router as authRoutes };
