import { Request, Response } from "express";
import { asyncHandler } from "@/core/middleware/error.middleware";
import { MedicationService } from "../services/medication.service";
import { ResponseUtil } from "@/core/utils/response.util";
import {
	CreateMedicationDto,
	MedicationSearchParams,
	UpdateMedicationDto,
} from "../dtos/medication.dto";

export class MedicationController {
	private medicationService: MedicationService;

	constructor() {
		this.medicationService = new MedicationService();
	}

	createMedication = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const medicationData: CreateMedicationDto = req.body;
			const medication = await this.medicationService.createMedication(
				medicationData
			);
			ResponseUtil.success(
				res,
				medication,
				"Medication created successfully",
				201
			);
		}
	);

	updateMedication = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const { id } = req.params;
			const medicationData: UpdateMedicationDto = req.body;
			const medication = await this.medicationService.updateMedication(
				id,
				medicationData
			);

			ResponseUtil.success(
				res,
				medication,
				"Medication updated successfully",
				200
			);
		}
	);

	deleteMedication = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const { id } = req.params;
			await this.medicationService.deleteMedication(id);
			ResponseUtil.success(res, null, "Medication deleted successfully", 200);
		}
	);
	getAllMedications = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const searchParams: MedicationSearchParams = req.query;

			const medications = await this.medicationService.getAllMedications(
				searchParams
			);
			ResponseUtil.success(
				res,
				medications,
				"Medications retrieved successfully",
				200
			);
		}
	);
	getMedicationById = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const { id } = req.params;
			const medication = await this.medicationService.getMedicationById(id);

			ResponseUtil.success(
				res,
				medication,
				"Medication retrieved successfully",
				200
			);
		}
	);
	getMedicationByCode = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const { code } = req.params;
			const medication = await this.medicationService.getMedicationByCode(code);

			ResponseUtil.success(
				res,
				medication,
				"Medication retrieved successfully",
				200
			);
		}
	);

	getMedicationsByCategory = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const { category } = req.params;
			const medications = await this.medicationService.getMedicationsByCategory(
				category
			);
			ResponseUtil.success(
				res,
				medications,
				"Medications retrieved successfully",
				200
			);
		}
	);

	getLowStockMedications = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const medications = await this.medicationService.getLowStockMedications();
			ResponseUtil.success(
				res,
				medications,
				"Medications retrieved successfully",
				200
			);
		}
	);

	getExpiredMedications = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const medications = await this.medicationService.getExpiredMedications();
			ResponseUtil.success(
				res,
				medications,
				"Expired medications retrieved successfully",
				200
			);
		}
	);
	getExpiringSoonMedications = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const medications =
				await this.medicationService.getExpiringSoonMedications();
			ResponseUtil.success(
				res,
				medications,
				"Expiring soon medications retrieved successfully",
				200
			);
		}
	);
}
