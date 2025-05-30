import { Entity, Column, OneToMany, Index } from "typeorm";
import { BaseEntity } from "@/shared/entities/base.entity";
import { UserRole } from "@/modules/User/entities/user-role.entity";
import { RolePermission } from "./role-permission.entity";

@Entity("roles")
@Index(["name"], { unique: true })
export class Role extends BaseEntity {
	@Column({ unique: true, length: 100 })
	name!: string;

	@Column({ length: 255, nullable: true })
	description?: string;

	@Column({ default: true })
	isActive!: boolean;

	@Column({ default: false })
	isSystemRole!: boolean;

	@OneToMany(() => UserRole, (userRole) => userRole.role)
	userRoles!: UserRole[];

	@OneToMany(() => RolePermission, (rolePermission) => rolePermission.role, {
		cascade: true,
	})
	rolePermissions!: RolePermission[];

	// Virtual field for permissions (populated via joins)
	permissions?: Array<{
		id: string;
		name: string;
		resource: string;
		action: string;
	}>;
}
