import {
	Entity,
	Column,
	OneToMany,
	Index,
	BeforeInsert,
	BeforeUpdate,
} from "typeorm";
import { UserRole } from "./user-role.entity";
import { Exclude } from "class-transformer";
import { BaseEntity } from "@/shared/entities/base.entity";

@Entity("users")
@Index(["email"], { unique: true })
export class User extends BaseEntity {
	@Column({ length: 100 })
	firstName!: string;

	@Column({ length: 100 })
	lastName!: string;

	@Column({ unique: true, length: 255 })
	email!: string;

	@Column({ length: 255 })
	@Exclude()
	password!: string;

	@Column({ length: 20, nullable: true })
	phone?: string;

	@Column({ type: "date", nullable: true })
	dateOfBirth?: Date;

	@Column({ default: true })
	isActive!: boolean;

	@Column({ default: false })
	isEmailVerified!: boolean;

	@Column({ type: "timestamp", nullable: true })
	emailVerifiedAt?: Date;

	@Column({ type: "timestamp", nullable: true })
	lastLoginAt?: Date;

	@Column({ length: 45, nullable: true })
	lastLoginIp?: string;

	@Column({ length: 255, nullable: true })
	@Exclude()
	emailVerificationToken?: string;

	@Column({ type: "timestamp", nullable: true })
	emailVerificationExpiresAt?: Date;

	@Column({ length: 255, nullable: true })
	@Exclude()
	passwordResetToken?: string;

	@Column({ type: "timestamp", nullable: true })
	passwordResetExpiresAt?: Date;

	@OneToMany(() => UserRole, (userRole) => userRole.user, { cascade: true })
	userRoles!: UserRole[];

	// Virtual fields
	fullName?: string;
	roles?: Array<{
		id: string;
		name: string;
		permissions: Array<{
			id: string;
			name: string;
			resource: string;
			action: string;
		}>;
	}>;

	@BeforeInsert()
	@BeforeUpdate()
	private normalizeEmail() {
		if (this.email) {
			this.email = this.email.toLowerCase().trim();
		}
	}

	@BeforeInsert()
	@BeforeUpdate()
	private generateFullName() {
		this.fullName = `${this.firstName} ${this.lastName}`.trim();
	}
}
