import { Entity, Column, OneToMany, Index } from "typeorm";
import { BaseEntity } from "@/shared/entities/base.entity";
import { RolePermission } from "./role-permission.entity";

@Entity("permissions")
@Index(["resource", "action"], { unique: true })
export class Permission extends BaseEntity {
	@Column({ length: 100 })
	name!: string;

	@Column({ length: 255, nullable: true })
	description?: string;

	@Column({ length: 100 })
	resource!: string;

	@Column({ length: 50 })
	action!: string;

	@Column({ default: true })
	isActive!: boolean;

	@OneToMany(
		() => RolePermission,
		(rolePermission) => rolePermission.permission
	)
	rolePermissions!: RolePermission[];
}
