import { MedicationStatus } from "@/core/types/pharmacy .types";
import { Medication } from "../entities/medication.entity";
import {
	CreateMedicationDto,
	MedicationResponseDto,
	MedicationSearchParams,
	UpdateMedicationDto,
} from "../dtos/medication.dto";
import { MedicationRepositoty } from "../repositories/medication.repository";
import { AppDataSource } from "@/config/database";
import { logger } from "@/core/utils/logger.util";
import { QueryFailedError } from "typeorm";
import { ValidationError } from "@/core/middleware/error.middleware";

export class MedicationService {
	private medicationRepository: MedicationRepositoty;

	constructor() {
		this.medicationRepository = new MedicationRepositoty();
	}

	async createMedication(
		medicationData: CreateMedicationDto
	): Promise<Medication> {
		const queryRunner = AppDataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			const medication = queryRunner.manager.create(Medication, {
				code: medicationData.code,
				name: medicationData.name,
				genericName: medicationData.genericName,
				brandName: medicationData.brandName,
				category: medicationData.category,
				formulation: medicationData.formulation,
				strength: medicationData.strength,
				unit: medicationData.unit,
				manufacturer: medicationData.manufacturer,
				reorderLevel: medicationData.reorderLevel,
				stockQuantity: medicationData.stockQuantity,
				expiryDate: medicationData.expiryDate
					? new Date(medicationData.expiryDate)
					: undefined,
				batchNumber: medicationData.batchNumber,
				location: medicationData.location,
				price: medicationData.price,
				isControlled: medicationData.isControlled,
				requiresPrescription: medicationData.requiresPrescription,
				status: medicationData.status as MedicationStatus,
			});

			const savedMedication = await queryRunner.manager.save(medication);

			await queryRunner.commitTransaction();

			logger.info("medication added successfully:", {
				medicationId: savedMedication.id,
				code: savedMedication.code,
				name: savedMedication.name,
			});

			return this.getMedicationById(savedMedication.id);
		} catch (error) {
			await queryRunner.rollbackTransaction();
			if (
				error instanceof QueryFailedError &&
				"code" in error &&
				error.code === "23505"
			) {
				throw new ValidationError(
					"A medication with this code already exists."
				);
			}
			throw error;
		} finally {
			await queryRunner.release();
		}
	}

	async updateMedication(
		id: string,
		medicationData: UpdateMedicationDto
	): Promise<Medication> {
		const queryRunner = AppDataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			const existingMedication = await this.getMedicationById(id);
			if (!existingMedication) {
				throw new Error(`Medication with ID ${id} not found`);
			}

			const cleanMedicationData = Object.fromEntries(
				Object.entries(medicationData).filter(
					([, value]) => value !== undefined
				)
			);

			const updatedMedication = {
				...existingMedication,
				...cleanMedicationData,
				expiryDate: medicationData.expiryDate
					? new Date(medicationData.expiryDate)
					: existingMedication.expiryDate,
			};

			const savedMedication = await queryRunner.manager.save(
				Medication,
				updatedMedication
			);
			await queryRunner.commitTransaction();

			logger.info(
				`Medication with ID ${savedMedication.id} updated successfully`
			);
			return savedMedication;
		} catch (error) {
			await queryRunner.rollbackTransaction();
			logger.error(`Error updating medication with ID ${id}:`, error);
			if (
				error instanceof QueryFailedError &&
				"code" in error &&
				error.code === "23505"
			) {
				throw new ValidationError(
					"A medication with this code already exists."
				);
			}
			throw error;
		} finally {
			await queryRunner.release();
		}
	}

	async deleteMedication(id: string): Promise<void> {
		const queryRunner = AppDataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			const medication = await this.getMedicationById(id);
			if (!medication) {
				throw new Error(`Medication with ID ${id} not found`);
			}

			await this.medicationRepository.delete(id);
			await queryRunner.commitTransaction();

			logger.info(`Medication with ID ${id} deleted successfully`);
		} catch (error) {
			await queryRunner.rollbackTransaction();
			logger.error(`Error deleting medication with ID ${id}:`, error);
			throw error;
		} finally {
			await queryRunner.release();
		}
	}

	async getAllMedications(
		searchParams: MedicationSearchParams
	): Promise<Medication[]> {
		const result = await this.medicationRepository.searchMedications(
			searchParams
		);
		return result.data;
	}

	async getMedicationById(id: string): Promise<Medication> {
		const medication = await this.medicationRepository.findOneById(id);
		if (!medication) {
			throw new Error(`Medication with ID ${id} not found`);
		}
		return medication;
	}

	async getMedicationByCode(code: string): Promise<Medication | null> {
		const medication = await this.medicationRepository.findOneByCode(code);
		if (!medication) {
			logger.warn(`Medication with code ${code} not found`);
			return null;
		}
		return medication;
	}

	async getLowStockMedications(): Promise<MedicationResponseDto[]> {
		const medications =
			await this.medicationRepository.findLowStockMedications();
		if (!medications || medications.length === 0) {
			logger.info("No low stock medications found");
			return [];
		}

		return medications.map((medication: MedicationResponseDto) => ({
			id: medication.id,
			code: medication.code,
			name: medication.name,
			genericName: medication.genericName,
			brandName: medication.brandName,
			category: medication.category,
			formulation: medication.formulation,
			strength: medication.strength,
			unit: medication.unit,
			manufacturer: medication.manufacturer,
			reorderLevel: medication.reorderLevel,
			stockQuantity: medication.stockQuantity,
			expiryDate: medication.expiryDate,
			batchNumber: medication.batchNumber,
			location: medication.location,
			price: medication.price,
			isControlled: medication.isControlled,
			requiresPrescription: medication.requiresPrescription,
			status: medication.status as MedicationStatus,
			createdAt: medication.createdAt,
			updatedAt: medication.updatedAt,
		}));
	}

	async getMedicationsByCategory(
		category: string
	): Promise<MedicationResponseDto[]> {
		const medications = await this.medicationRepository.findByCategory(
			category
		);
		if (!medications || !Array.isArray(medications)) {
			logger.info(`No medications found for category: ${category}`);
			return [];
		}

		return medications.map((medication: MedicationResponseDto) => ({
			id: medication.id,
			code: medication.code,
			name: medication.name,
			genericName: medication.genericName,
			brandName: medication.brandName,
			category: medication.category,
			formulation: medication.formulation,
			strength: medication.strength,
			unit: medication.unit,
			manufacturer: medication.manufacturer,
			reorderLevel: medication.reorderLevel,
			stockQuantity: medication.stockQuantity,
			expiryDate: medication.expiryDate,
			batchNumber: medication.batchNumber,
			location: medication.location,
			price: medication.price,
			isControlled: medication.isControlled,
			requiresPrescription: medication.requiresPrescription,
			status: medication.status as MedicationStatus,
			createdAt: medication.createdAt,
			updatedAt: medication.updatedAt,
		}));
	}

	async getExpiredMedications(): Promise<MedicationResponseDto[]> {
		const medications =
			await this.medicationRepository.findExpiredMedications();
		if (!medications || medications.length === 0) {
			logger.info("No expired medications found");
			return [];
		}

		return medications.map((medication: MedicationResponseDto) => ({
			id: medication.id,
			code: medication.code,
			name: medication.name,
			genericName: medication.genericName,
			brandName: medication.brandName,
			category: medication.category,
			formulation: medication.formulation,
			strength: medication.strength,
			unit: medication.unit,
			manufacturer: medication.manufacturer,
			reorderLevel: medication.reorderLevel,
			stockQuantity: medication.stockQuantity,
			expiryDate: medication.expiryDate,
			batchNumber: medication.batchNumber,
			location: medication.location,
			price: medication.price,
			isControlled: medication.isControlled,
			requiresPrescription: medication.requiresPrescription,
			status: medication.status as MedicationStatus,
			createdAt: medication.createdAt,
			updatedAt: medication.updatedAt,
		}));
	}

	async getExpiringSoonMedications(
		days: number = 30
	): Promise<MedicationResponseDto[]> {
		const medications =
			await this.medicationRepository.findExpiringSoonMedications(days);
		if (!medications || medications.length === 0) {
			logger.info(`No medications expiring within ${days} days found`);
			return [];
		}

		return medications.map((medication: MedicationResponseDto) => ({
			id: medication.id,
			code: medication.code,
			name: medication.name,
			genericName: medication.genericName,
			brandName: medication.brandName,
			category: medication.category,
			formulation: medication.formulation,
			strength: medication.strength,
			unit: medication.unit,
			manufacturer: medication.manufacturer,
			reorderLevel: medication.reorderLevel,
			stockQuantity: medication.stockQuantity,
			expiryDate: medication.expiryDate,
			batchNumber: medication.batchNumber,
			location: medication.location,
			price: medication.price,
			isControlled: medication.isControlled,
			requiresPrescription: medication.requiresPrescription,
			status: medication.status as MedicationStatus,
			createdAt: medication.createdAt,
			updatedAt: medication.updatedAt,
		}));
	}
}
