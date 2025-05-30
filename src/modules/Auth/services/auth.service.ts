// src/modules/auth/services/auth.service.ts
import { Repository } from "typeorm";
import { AppDataSource } from "@/config/database";
import { User } from "@/modules/User/entities/user.entity";
import { UserRole } from "@/modules/User/entities/user-role.entity";

import { EncryptionUtil } from "@/core/utils/encryption.util";
import { JwtUtil } from "@/core/utils/jwt.util";
import { logger } from "@/core/utils/logger.util";
import {
	ValidationError,
	UnauthorizedError,
	NotFoundError,
	ConflictError,
} from "@/core/middleware/error.middleware";
import {
	LoginDto,
	RegisterDto,
	RefreshTokenDto,
	ForgotPasswordDto,
	ResetPasswordDto,
	VerifyEmailDto,
	ResendVerificationDto,
} from "../dto/auth.dto";
import {
	LoginResponse,
	RefreshTokenResponse,
	AuthenticatedUser,
} from "@/core/types/auth.types";
import { UserService } from "@/modules/User/services/user.service";
import { RoleRepository } from "../repositories/role.repository";
import { EmailService } from "./email.service";

export class AuthService {
	private userRepository: Repository<User>;
	private roleRepository: RoleRepository;
	private userService: UserService;
	private emailService: EmailService;

	constructor() {
		this.userRepository = AppDataSource.getRepository(User);
		this.roleRepository = new RoleRepository();
		this.userService = new UserService();
		this.emailService = new EmailService();
	}

	async login(loginDto: LoginDto): Promise<LoginResponse> {
		const { email, password } = loginDto;

		// Find user with roles and permissions
		const user = await this.userRepository
			.createQueryBuilder("user")
			.leftJoinAndSelect("user.userRoles", "userRole")
			.leftJoinAndSelect("userRole.role", "role")
			.leftJoinAndSelect("role.rolePermissions", "rolePermission")
			.leftJoinAndSelect("rolePermission.permission", "permission")
			.where("user.email = :email", { email: email.toLowerCase() })
			.andWhere("user.isActive = true")
			.andWhere("role.isActive = true")
			.andWhere("permission.isActive = true")
			.getOne();

		if (!user) {
			throw new UnauthorizedError("Invalid credentials");
		}

		// Verify password
		const isPasswordValid = await EncryptionUtil.comparePassword(
			password,
			user.password
		);

		if (!isPasswordValid) {
			throw new UnauthorizedError("Invalid credentials");
		}

		// Check if email is verified
		if (!user.emailVerifiedAt) {
			throw new UnauthorizedError("Please verify your email before logging in");
		}

		// Transform user data
		const authenticatedUser = this.transformUserData(user);

		// Generate tokens
		const accessToken = JwtUtil.generateAccessToken({
			sub: user.id,
			email: user.email,
			roles: authenticatedUser.roles.map((role) => role.name),
			permissions: authenticatedUser.roles.flatMap((role) =>
				role.permissions.map((perm) => `${perm.resource}:${perm.action}`)
			),
		});

		const refreshToken = JwtUtil.generateRefreshToken(user.id);

		// Update last login
		await this.userRepository.update(user.id, {
			lastLoginAt: new Date(),
		});

		logger.info("User logged in successfully:", {
			userId: user.id,
			email: user.email,
		});

		return {
			user: authenticatedUser,
			accessToken,
			refreshToken,
			expiresIn: 3600, // 1 hour
		};
	}

	async register(registerDto: RegisterDto): Promise<User> {
		const queryRunner = AppDataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			// Check if user already exists
			const existingUser = await this.userRepository.findOne({
				where: { email: registerDto.email.toLowerCase() },
			});

			if (existingUser) {
				throw new ConflictError("User with this email already exists");
			}

			// Hash password
			const hashedPassword = await EncryptionUtil.hashPassword(
				registerDto.password
			);

			// Create user
			const user = this.userRepository.create({
				firstName: registerDto.firstName,
				lastName: registerDto.lastName,
				email: registerDto.email.toLowerCase(),
				password: hashedPassword,
				phone: registerDto.phone,
				dateOfBirth: registerDto.dateOfBirth
					? new Date(registerDto.dateOfBirth)
					: undefined,
				emailVerificationToken: EncryptionUtil.generateSecureToken(),
			});

			const savedUser = await queryRunner.manager.save(user);

			// Assign default PATIENT role
			const defaultRole = await this.roleRepository.findByName("PATIENT");
			if (defaultRole) {
				const userRole = new UserRole();
				userRole.userId = savedUser.id;
				userRole.roleId = defaultRole.id;
				await queryRunner.manager.save(userRole);
			}

			await queryRunner.commitTransaction();

			logger.info("User registered successfully:", {
				userId: savedUser.id,
				email: savedUser.email,
			});

			try {
				await this.sendVerificationEmail(savedUser);
			} catch (emailError) {
				logger.error("Failed to send verification email:", {
					userId: savedUser.id,
					email: savedUser.email,
					error:
						emailError instanceof Error ? emailError.message : "Unknown error",
				});
			}

			return savedUser;
		} catch (error) {
			await queryRunner.rollbackTransaction();
			throw error;
		} finally {
			await queryRunner.release();
		}
	}

	async refreshToken(
		refreshTokenDto: RefreshTokenDto
	): Promise<RefreshTokenResponse> {
		const { refreshToken } = refreshTokenDto;

		try {
			const payload = JwtUtil.verifyRefreshToken(refreshToken);

			// Get user with roles and permissions
			const user = await this.userService.findByIdWithRoles(payload.sub);

			if (!user || !user.isActive) {
				throw new UnauthorizedError("User not found or inactive");
			}

			// Generate new access token
			const accessToken = JwtUtil.generateAccessToken({
				sub: user.id,
				email: user.email,
				roles: user.roles?.map((role) => role.name) || [],
				permissions:
					user.roles?.flatMap((role) =>
						role.permissions.map((perm) => `${perm.resource}:${perm.action}`)
					) || [],
			});

			return {
				accessToken,
				expiresIn: 3600, // 1 hour
			};
		} catch {
			throw new UnauthorizedError("Invalid refresh token");
		}
	}

	async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
		const { email } = forgotPasswordDto;

		const user = await this.userRepository.findOne({
			where: { email: email.toLowerCase(), isActive: true },
		});

		if (!user) {
			// Don't reveal if user exists or not
			logger.warn("Password reset requested for non-existent email:", {
				email,
			});
			return;
		}

		// Generate reset token
		const resetToken = EncryptionUtil.generateSecureToken();
		const resetTokenExpiry = new Date();
		resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // 1 hour expiry

		await this.userRepository.update(user.id, {
			passwordResetToken: resetToken,
			passwordResetExpiresAt: resetTokenExpiry,
		});

		logger.info("Password reset token generated:", {
			userId: user.id,
			email: user.email,
		});

		try {
			await this.sendPasswordResetEmail(user, resetToken);
		} catch (emailError) {
			logger.error("Failed to send password reset email:", {
				userId: user.id,
				email: user.email,
				error:
					emailError instanceof Error ? emailError.message : "Unknown error",
			});
		}
	}

	async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
		const { token, password } = resetPasswordDto;

		const user = await this.userRepository.findOne({
			where: {
				passwordResetToken: token,
				isActive: true,
			},
		});

		if (!user || !user.passwordResetExpiresAt) {
			throw new ValidationError("Invalid or expired reset token");
		}

		if (user.passwordResetExpiresAt < new Date()) {
			throw new ValidationError("Reset token has expired");
		}

		// Hash new password
		const hashedPassword = await EncryptionUtil.hashPassword(password);

		// Update user
		await this.userRepository.update(user.id, {
			password: hashedPassword,
			passwordResetToken: undefined,
			passwordResetExpiresAt: undefined,
		});

		logger.info("Password reset successfully:", {
			userId: user.id,
			email: user.email,
		});
	}

	async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<void> {
		const { token } = verifyEmailDto;

		const user = await this.userRepository.findOne({
			where: {
				emailVerificationToken: token,
				isActive: true,
			},
		});

		if (!user) {
			throw new ValidationError("Invalid verification token");
		}

		if (user.emailVerifiedAt) {
			throw new ValidationError("Email is already verified");
		}

		// Update user
		await this.userRepository.update(user.id, {
			emailVerifiedAt: new Date(),
			emailVerificationToken: undefined,
		});

		logger.info("Email verified successfully:", {
			userId: user.id,
			email: user.email,
		});
	}

	async resendVerification(
		resendVerificationDto: ResendVerificationDto
	): Promise<void> {
		const { email } = resendVerificationDto;

		const user = await this.userRepository.findOne({
			where: { email: email.toLowerCase(), isActive: true },
		});

		if (!user) {
			throw new NotFoundError("User not found");
		}

		if (user.emailVerifiedAt) {
			throw new ValidationError("Email is already verified");
		}

		// Generate new verification token
		const verificationToken = EncryptionUtil.generateSecureToken();

		await this.userRepository.update(user.id, {
			emailVerificationToken: verificationToken,
		});

		logger.info("Verification email resent:", {
			userId: user.id,
			email: user.email,
		});

		try {
			await this.sendVerificationEmail(user);
		} catch (emailError) {
			logger.error("Failed to send verification email:", {
				userId: user.id,
				email: user.email,
				error:
					emailError instanceof Error ? emailError.message : "Unknown error",
			});
		}
	}

	private async sendVerificationEmail(user: User): Promise<void> {
		if (!user.emailVerificationToken) {
			throw new Error("User does not have a verification token");
		}

		await this.emailService.sendVerificationEmail(
			user.email,
			user.emailVerificationToken,
			user.firstName
		);
	}

	private async sendPasswordResetEmail(
		user: User,
		token: string
	): Promise<void> {
		await this.emailService.sendPasswordResetEmail(
			user.email,
			token,
			user.firstName
		);
	}

	private transformUserData(user: User): AuthenticatedUser {
		return {
			id: user.id,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			roles:
				user.userRoles?.map((userRole) => ({
					id: userRole.role.id,
					name: userRole.role.name,
					permissions:
						userRole.role.rolePermissions?.map((rolePermission) => ({
							id: rolePermission.permission.id,
							name: rolePermission.permission.name,
							resource: rolePermission.permission.resource,
							action: rolePermission.permission.action,
						})) || [],
				})) || [],
			isActive: user.isActive,
		};
	}
}
