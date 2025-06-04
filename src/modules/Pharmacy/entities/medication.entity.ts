import { BaseEntity } from "@/shared/entities/base.entity";
import { Column, Entity } from "typeorm";
import { MedicationStatus } from "@/core/types/pharmacy .types";

@Entity("medications")
export class Medication extends BaseEntity {
	@Column({ unique: true })
	code!: string;

	@Column()
	name!: string;

	@Column()
	genericName!: string;

	@Column({ nullable: true })
	brandName?: string;

	@Column()
	category!: string;

	@Column()
	formulation!: string;

	@Column()
	strength!: string;

	@Column()
	unit!: string;

	@Column({ nullable: true })
	manufacturer?: string;

	@Column({ type: "int", default: 0 })
	reorderLevel!: number;

	@Column({ type: "int", default: 0 })
	stockQuantity!: number;

	@Column({ type: "date", nullable: true })
	expiryDate?: Date;

	@Column({ nullable: true })
	batchNumber?: string;

	@Column()
	location!: string;

	@Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
	price!: number;

	@Column({ default: false })
	isControlled!: boolean;

	@Column({ default: true })
	requiresPrescription!: boolean;

	@Column({
		type: "enum",
		enum: MedicationStatus,
		default: MedicationStatus.ACTIVE,
	})
	status!: MedicationStatus;
}
