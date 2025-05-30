import jwt, { SignOptions } from "jsonwebtoken";
import { config } from "@/config/constants";
import { JwtPayload } from "@/core/types/auth.types";
import { logger } from "./logger.util";

const accessTokenExpiresIn: string | number = config.JWT_EXPIRES_IN ?? "7d";
const refreshTokenExpiresIn: string | number =
	config.JWT_REFRESH_EXPIRES_IN ?? "30d";

export class JwtUtil {
	static generateAccessToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
		return jwt.sign(payload, config.JWT_SECRET, {
			expiresIn: accessTokenExpiresIn,
			issuer: "kadacare-health-systems-app",
			audience: "kadacare-health-systems-users",
		} as SignOptions);
	}

	static generateRefreshToken(userId: string): string {
		return jwt.sign(
			{ sub: userId, type: "refresh" },
			config.JWT_REFRESH_SECRET,
			{
				expiresIn: refreshTokenExpiresIn,
				issuer: "kadacare-health-systems-app",
				audience: "kadacare-health-systems-users",
			} as SignOptions
		);
	}

	static verifyAccessToken(token: string): JwtPayload {
		try {
			return jwt.verify(token, config.JWT_SECRET, {
				issuer: "kadacare-health-systems-app",
				audience: "kadacare-health-systems-users",
			}) as JwtPayload;
		} catch (error) {
			logger.error("JWT verification failed:", error);
			throw new Error("Invalid token");
		}
	}

	static verifyRefreshToken(token: string): { sub: string; type: string } {
		try {
			return jwt.verify(token, config.JWT_REFRESH_SECRET, {
				issuer: "kadacare-health-systems-app",
				audience: "kadacare-health-systems-users",
			}) as { sub: string; type: string };
		} catch (error) {
			logger.error("Refresh token verification failed:", error);
			throw new Error("Invalid refresh token");
		}
	}

	static decodeToken(token: string): JwtPayload | null {
		return jwt.decode(token) as JwtPayload | null;
	}
}
