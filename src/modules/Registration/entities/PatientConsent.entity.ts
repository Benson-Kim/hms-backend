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
import { ConsentStatus } from "@/core/types/patient.types";

@Entity("patient_consents")
export class PatientConsent {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@ManyToOne(() => Patient, (patient) => patient.consents, {
		onDelete: "CASCADE",
	})
	@JoinColumn({ name: "patient_id" })
	patient!: Patient;

	@Column({ name: "patient_id" })
	patientId!: string;

	@Column()
	consentType!: string;

	@Column({ type: "date" })
	consentDate!: Date;

	@Column({ type: "date", nullable: true })
	validUntil?: Date;

	@Column({ nullable: true })
	consentDocument?: string;

	@Column({ nullable: true })
	notes?: string;

	@Column({
		type: "enum",
		enum: ConsentStatus,
		default: ConsentStatus.ACTIVE,
	})
	status!: ConsentStatus;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
