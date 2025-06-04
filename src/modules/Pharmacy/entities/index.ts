// Medication
export interface Medication {
	id: string;
	code: string;
	name: string;
	genericName: string;
	brandName?: string;
	category: string;
	formulation: string;
	strength: string;
	unit: string;
	manufacturer?: string;
	reorderLevel: number;
	stockQuantity: number;
	expiryDate?: Date;
	batchNumber?: string;
	location: string;
	price: number;
	isControlled: boolean;
	requiresPrescription: boolean;
	status: "Active" | "Inactive" | "Out of Stock";
	createdAt: Date;
	updatedAt: Date;
}

// MedicationInventoryTransaction
export interface MedicationInventoryTransaction {
	id: string;
	medicationId: string;
	transactionType:
		| "Purchase"
		| "Dispense"
		| "Return"
		| "Adjustment"
		| "Expired"
		| "Transfer";
	quantity: number;
	batchNumber: string;
	expiryDate: Date;
	unitPrice?: number;
	totalPrice?: number;
	referenceNumber?: string;
	fromLocation?: string;
	toLocation?: string;
	performedById: string;
	transactionDate: Date;
	notes?: string;
	createdAt: Date;
	updatedAt: Date;
}

// Prescription
export interface Prescription {
	id: string;
	patientId: string;
	prescriberId: string;
	prescriptionDate: Date;
	encounterType: "Outpatient" | "Inpatient" | "Emergency";
	encounterId: string;
	status:
		| "Pending"
		| "Verified"
		| "Dispensed"
		| "Partially Dispensed"
		| "Cancelled";
	validUntil?: Date;
	notes?: string;
	createdAt: Date;
	updatedAt: Date;
}

// PrescriptionItem
export interface PrescriptionItem {
	id: string;
	prescriptionId: string;
	medicationId: string;
	dosage: string;
	frequency: string;
	route: string;
	duration: string;
	quantity: number;
	instructions: string;
	refills?: number;
	remainingRefills?: number;
	dispenseStatus: "Pending" | "Dispensed" | "Partially Dispensed";
	dispensedQuantity?: number;
	dispensedDate?: Date;
	dispensedById?: string;
}

// MedicationDispense
export interface MedicationDispense {
	id: string;
	prescriptionItemId: string;
	patientId: string;
	medicationId: string;
	quantity: number;
	batchNumber: string;
	expiryDate: Date;
	dispensedById: string;
	dispensedDate: Date;
	paymentStatus: "Pending" | "Paid" | "Exempted" | "Insurance";
	insuranceClaimId?: string;
	notes?: string;
	createdAt: Date;
	updatedAt: Date;
}

// DrugInteraction
export interface DrugInteraction {
	id: string;
	medicationId1: string;
	medicationId2: string;
	interactionType: "Contraindication" | "Major" | "Moderate" | "Minor";
	description: string;
	recommendation: string;
	reference?: string;
	status: "Active" | "Inactive";
	createdAt: Date;
	updatedAt: Date;
}

// AdverseDrugReaction
export interface AdverseDrugReaction {
	id: string;
	patientId: string;
	medicationId: string;
	reportedById: string;
	reportDate: Date;
	reactionDescription: string;
	severity: "Mild" | "Moderate" | "Severe" | "Fatal";
	outcome: string;
	actionTaken: string;
	reportedToAuthorities: boolean;
	reportReference?: string;
	createdAt: Date;
	updatedAt: Date;
}

// PharmacistIntervention
export interface PharmacistIntervention {
	id: string;
	patientId: string;
	prescriptionId?: string;
	medicationId?: string;
	pharmacistId: string;
	interventionDate: Date;
	interventionType:
		| "Dosage Adjustment"
		| "Drug Interaction"
		| "Therapeutic Substitution"
		| "Formulary Compliance"
		| "Other";
	description: string;
	recommendation: string;
	outcome: string;
	status: "Recommended" | "Accepted" | "Rejected" | "Pending";
	createdAt: Date;
	updatedAt: Date;
}

// MedicationCompounding
export interface MedicationCompounding {
	id: string;
	name: string;
	formula: string;
	preparationInstructions: string;
	ingredients: CompoundIngredient[];
	preparedById: string;
	preparationDate: Date;
	expiryDate: Date;
	batchNumber: string;
	quantity: number;
	unit: string;
	prescriptionItemId?: string;
	patientId?: string;
	status: "Prepared" | "Dispensed" | "Expired";
	qualityCheckedById?: string;
	createdAt: Date;
	updatedAt: Date;
}

// CompoundIngredient
export interface CompoundIngredient {
	medicationId: string;
	quantity: number;
	unit: string;
}

// ControlledSubstanceLog
export interface ControlledSubstanceLog {
	id: string;
	medicationId: string;
	transactionType:
		| "Received"
		| "Dispensed"
		| "Wasted"
		| "Returned"
		| "Adjusted";
	quantity: number;
	batchNumber: string;
	prescriptionId?: string;
	patientId?: string;
	performedById: string;
	witnessedById?: string;
	transactionDate: Date;
	reason: string;
	remainingBalance: number;
	createdAt: Date;
	updatedAt: Date;
}

// PharmacySupplier
export interface PharmacySupplier {
	id: string;
	name: string;
	contactPerson: string;
	phoneNumber: string;
	email: string;
	address: string;
	licenseNumber?: string;
	paymentTerms?: string;
	status: "Active" | "Inactive";
	createdAt: Date;
	updatedAt: Date;
}

// MedicationPurchaseOrder
export interface MedicationPurchaseOrder {
	id: string;
	supplierId: string;
	orderDate: Date;
	requiredDeliveryDate?: Date;
	status:
		| "Draft"
		| "Submitted"
		| "Approved"
		| "Received"
		| "Partially Received"
		| "Cancelled";
	approvedById?: string;
	approvalDate?: Date;
	totalAmount: number;
	paymentStatus: "Pending" | "Partial" | "Paid";
	notes?: string;
	createdAt: Date;
	updatedAt: Date;
}

// PurchaseOrderItem
export interface PurchaseOrderItem {
	id: string;
	purchaseOrderId: string;
	medicationId: string;
	quantity: number;
	unitPrice: number;
	totalPrice: number;
	receivedQuantity?: number;
	status: "Pending" | "Received" | "Partially Received" | "Cancelled";
	createdAt: Date;
	updatedAt: Date;
}
