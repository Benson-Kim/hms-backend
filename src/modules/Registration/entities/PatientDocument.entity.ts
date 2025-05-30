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

@Entity("patient_documents")
export class PatientDocument {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@ManyToOne(() => Patient, (patient) => patient.documents, {
		onDelete: "CASCADE",
	})
	@JoinColumn({ name: "patient_id" })
	patient!: Patient;

	@Column({ name: "patient_id" })
	patientId!: string;

	@Column()
	documentType!: string;

	@Column()
	documentName!: string;

	@Column()
	filePath!: string;

	@Column({ type: "date" })
	uploadDate!: Date;

	@Column({ nullable: true })
	notes?: string;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
