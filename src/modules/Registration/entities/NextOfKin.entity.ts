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

@Entity("next_of_kin")
export class NextOfKin {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@ManyToOne(() => Patient, (patient) => patient.nextOfKin, {
		onDelete: "CASCADE",
	})
	@JoinColumn({ name: "patient_id" })
	patient!: Patient;

	@Column({ name: "patient_id" })
	patientId!: string;

	@Column()
	name!: string;

	@Column()
	relationship!: string;

	@Column()
	contactNumber!: string;

	@Column({ nullable: true })
	alternateContactNumber?: string;

	@Column({ nullable: true })
	address?: string;

	@Column({ default: false })
	isPrimaryContact!: boolean;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
