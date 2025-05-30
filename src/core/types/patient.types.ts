// Patient
export enum PatientStatus {
	ACTIVE = "Active",
	INACTIVE = "Inactive",
	DECEASED = "Deceased",
}

export enum Gender {
	MALE = "Male",
	FEMALE = "Female",
	OTHER = "Other",
}

export interface Patient {
	id: string;
	mrn: string; // Medical Record Number
	nationalId?: string;
	firstName: string;
	lastName: string;
	middleName?: string;
	dateOfBirth: Date;
	gender: Gender;
	contactNumber: string;
	alternateContactNumber?: string;
	email?: string;
	address: Address;
	registrationDate: Date;
	nextOfKin: NextOfKin[];
	insuranceDetails: InsuranceDetail[];
	status: PatientStatus;
	bloodGroup?: string;
	allergies?: string[];
	chronicConditions?: string[];
	photo?: string;
	createdAt: Date;
	updatedAt: Date;
}

// Address
export interface Address {
	id: string;
	streetAddress: string;
	city: string;
	county: string;
	postalCode: string;
	country: string;
	createdAt: Date;
	updatedAt: Date;
}

// Next of Kin
export interface NextOfKin {
	id: string;
	patientId: string;
	name: string;
	relationship: string;
	contactNumber: string;
	alternateContactNumber?: string;
	address?: string;
	isPrimaryContact: boolean;
	createdAt: Date;
	updatedAt: Date;
}

// Insurance Details
export interface InsuranceDetail {
	id: string;
	patientId: string;
	providerName: string;
	policyNumber: string;
	coverageType: string;
	validFrom: Date;
	validTo: Date;
	isPrimary: boolean;
	coveragePercentage: number;
	createdAt: Date;
	updatedAt: Date;
}

// Patient Document
export interface PatientDocument {
	id: string;
	patientId: string;
	documentType: string;
	documentName: string;
	filePath: string;
	uploadDate: Date;
	notes?: string;
	createdAt: Date;
	updatedAt: Date;
}

// Patient Consent
export interface PatientConsent {
	id: string;
	patientId: string;
	consentType: string;
	consentDate: Date;
	validUntil?: Date;
	consentDocument?: string;
	notes?: string;
	status: ConsentStatus;
	createdAt: Date;
	updatedAt: Date;
}

export enum ConsentStatus {
	ACTIVE = "Active",
	REVOKED = "Revoked",
	EXPIRED = "Expired",
}
