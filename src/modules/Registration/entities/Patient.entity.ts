import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	OneToOne,
	OneToMany,
	JoinColumn,
	CreateDateColumn,
	UpdateDateColumn,
	BeforeInsert,
	Index,
} from "typeorm";
import { Address } from "./Address.entity";
import { NextOfKin } from "./NextOfKin.entity";
import { InsuranceDetail } from "./InsuranceDetail.entity";
import { PatientDocument } from "./PatientDocument.entity";
import { PatientConsent } from "./PatientConsent.entity";
import { Gender, PatientStatus } from "@/core/types/patient.types";

@Entity("patients")
@Index(["firstName", "lastName"])
@Index(["mrn"], { unique: true })
@Index(["nationalId"], { unique: true, where: "national_id IS NOT NULL" })
@Index(["email"], { unique: true, where: "email IS NOT NULL" })
@Index(["contactNumber"])
export class Patient {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column({ name: "mrn", unique: true, length: 20 })
	mrn!: string;

	@Column({ name: "national_id", nullable: true, unique: true, length: 50 })
	nationalId?: string;

	@Column({ name: "first_name", length: 100 })
	firstName!: string;

	@Column({ name: "last_name", length: 100 })
	lastName!: string;

	@Column({ name: "middle_name", nullable: true, length: 100 })
	middleName?: string;

	@Column({ name: "date_of_birth", type: "date" })
	dateOfBirth!: Date;

	@Column({
		type: "enum",
		enum: Gender,
	})
	gender!: Gender;

	@Column({ name: "contact_number", length: 20 })
	contactNumber!: string;

	@Column({ name: "alternate_contact_number", nullable: true, length: 20 })
	alternateContactNumber?: string;

	@Column({ nullable: true, unique: true })
	email?: string;

	@OneToOne(() => Address, { cascade: true, eager: true })
	@JoinColumn({ name: "address_id" })
	address!: Address;

	@Column({ name: "address_id" })
	addressId!: string;

	@Column({
		name: "registration_date",
		type: "timestamp",
		default: () => "CURRENT_TIMESTAMP",
	})
	registrationDate!: Date;

	@OneToMany(() => NextOfKin, (nextOfKin) => nextOfKin.patient, {
		cascade: true,
		eager: false,
	})
	nextOfKin!: NextOfKin[];

	@OneToMany(() => InsuranceDetail, (insurance) => insurance.patient, {
		cascade: true,
		eager: false,
	})
	insuranceDetails!: InsuranceDetail[];

	@OneToMany(() => PatientDocument, (document) => document.patient, {
		cascade: false,
		eager: false,
	})
	documents!: PatientDocument[];

	@OneToMany(() => PatientConsent, (consent) => consent.patient, {
		cascade: false,
		eager: false,
	})
	consents!: PatientConsent[];

	@Column({
		type: "enum",
		enum: PatientStatus,
		default: PatientStatus.ACTIVE,
	})
	status!: PatientStatus;

	@Column({ name: "blood_group", nullable: true, length: 10 })
	bloodGroup?: string;

	@Column({ type: "simple-array", nullable: true })
	allergies?: string[];

	@Column({ name: "chronic_conditions", type: "simple-array", nullable: true })
	chronicConditions?: string[];

	@Column({ nullable: true })
	photo?: string;

	@CreateDateColumn({ name: "created_at" })
	createdAt!: Date;

	@UpdateDateColumn({ name: "updated_at" })
	updatedAt!: Date;

	// Virtual properties
	get fullName(): string {
		return this.middleName
			? `${this.firstName} ${this.middleName} ${this.lastName}`
			: `${this.firstName} ${this.lastName}`;
	}

	get age(): number {
		const today = new Date();
		const birthDate = new Date(this.dateOfBirth);
		let age = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();

		if (
			monthDiff < 0 ||
			(monthDiff === 0 && today.getDate() < birthDate.getDate())
		) {
			age--;
		}

		return age;
	}

	@BeforeInsert()
	async generateMRN() {
		if (!this.mrn) {
			// Generate MRN format: MRN-YYYYMMDD-XXXX (where XXXX is a random 4-digit number)
			const date = new Date();
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, "0");
			const day = String(date.getDate()).padStart(2, "0");
			const random = Math.floor(1000 + Math.random() * 9000);

			this.mrn = `MRN-${year}${month}${day}-${random}`;
		}
	}
}
