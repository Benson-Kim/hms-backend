import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn,
	CreateDateColumn,
	UpdateDateColumn,
} from "typeorm";
import { Patient } from "./Patient.entity";

@Entity("insurance_details")
export class InsuranceDetail {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@ManyToOne(() => Patient, (patient) => patient.insuranceDetails, {
		onDelete: "CASCADE",
	})
	@JoinColumn({ name: "patient_id" })
	patient!: Patient;

	@Column({ name: "patient_id" })
	patientId!: string;

	@Column()
	providerName!: string;

	@Column()
	policyNumber!: string;

	@Column()
	coverageType!: string;

	@Column({ type: "date" })
	validFrom!: Date;

	@Column({ type: "date" })
	validTo!: Date;

	@Column({ default: false })
	isPrimary!: boolean;

	@Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
	coveragePercentage!: number;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
