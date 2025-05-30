import bcrypt from "bcryptjs";
import crypto from "crypto";
import { config } from "@/config/constants";

export class EncryptionUtil {
	private static readonly SALT_ROUNDS = 12;
	private static readonly ALGORITHM = "aes-256-gcm";

	static async hashPassword(password: string): Promise<string> {
		return bcrypt.hash(password, this.SALT_ROUNDS);
	}

	static async comparePassword(
		password: string,
		hash: string
	): Promise<boolean> {
		return bcrypt.compare(password, hash);
	}

	static encrypt(text: string): { encrypted: string; iv: string; tag: string } {
		const iv = crypto.randomBytes(16);
		const cipher = crypto.createCipher(this.ALGORITHM, config.ENCRYPTION_KEY);
		cipher.setAAD(Buffer.from("kadacare-health-systems-app"));

		let encrypted = cipher.update(text, "utf8", "hex");
		encrypted += cipher.final("hex");

		const tag = cipher.getAuthTag();

		return {
			encrypted,
			iv: iv.toString("hex"),
			tag: tag.toString("hex"),
		};
	}

	static decrypt(encryptedData: {
		encrypted: string;
		iv: string;
		tag: string;
	}): string {
		const decipher = crypto.createDecipher(
			this.ALGORITHM,
			config.ENCRYPTION_KEY
		);
		decipher.setAAD(Buffer.from("kadacare-health-systems-app"));
		decipher.setAuthTag(Buffer.from(encryptedData.tag, "hex"));

		let decrypted = decipher.update(encryptedData.encrypted, "hex", "utf8");
		decrypted += decipher.final("utf8");

		return decrypted;
	}

	static generateSecureToken(length: number = 32): string {
		return crypto.randomBytes(length).toString("hex");
	}
}
