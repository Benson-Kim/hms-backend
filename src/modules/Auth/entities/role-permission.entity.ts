import { Entity, ManyToOne, JoinColumn, PrimaryColumn } from "typeorm";
import { BaseEntity } from "@/shared/entities/base.entity";
import { Role } from "./role.entity";
import { Permission } from "./permission.entity";

@Entity("role_permissions")
export class RolePermission extends BaseEntity {
	@PrimaryColumn()
	roleId!: string;

	@PrimaryColumn()
	permissionId!: string;

	@ManyToOne(() => Role, (role) => role.rolePermissions, {
		onDelete: "CASCADE",
	})
	@JoinColumn({ name: "roleId" })
	role!: Role;

	@ManyToOne(() => Permission, (permission) => permission.rolePermissions, {
		onDelete: "CASCADE",
	})
	@JoinColumn({ name: "permissionId" })
	permission!: Permission;
}
