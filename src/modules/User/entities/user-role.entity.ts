import { Entity, ManyToOne, JoinColumn, PrimaryColumn } from "typeorm";
import { BaseEntity } from "@/shared/entities/base.entity";
import { User } from "./user.entity";
import { Role } from "@/modules/Auth/entities/role.entity";

@Entity("user_roles")
export class UserRole extends BaseEntity {
	@PrimaryColumn()
	userId!: string;

	@PrimaryColumn()
	roleId!: string;

	@ManyToOne(() => User, (user) => user.userRoles, { onDelete: "CASCADE" })
	@JoinColumn({ name: "userId" })
	user!: User;

	@ManyToOne(() => Role, (role) => role.userRoles, { onDelete: "CASCADE" })
	@JoinColumn({ name: "roleId" })
	role!: Role;
}
