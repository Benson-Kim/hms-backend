export enum MedicationStatus {
	ACTIVE = "Active",
	INACTIVE = "Inactive",
	OUT_OF_STOCK = "Out of Stock",
}

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
	status: MedicationStatus;
	createdAt: Date;
	updatedAt?: Date;
}
