import { NextFunction, Request, Response } from "express";
import { ResponseUtil } from "@/core/utils/response.util";
import { asyncHandler } from "@/core/middleware/error.middleware";
import { PatientService } from "../services/patient-registration.service";
import {
	PatientCreateDto,
	PatientUpdateDto,
	DocumentUploadDto,
	ConsentDto,
	PatientSearchParams,
	InsuranceDetailDto,
} from "../dtos/patient-registration.dto";
import { logger } from "@/core/utils/logger.util";
import { Gender, PatientStatus } from "@/core/types/patient.types";

export class PatientController {
	private patientService: PatientService;

	constructor() {
		this.patientService = new PatientService();
	}

	registerNewPatient = asyncHandler(
		async (req: Request, res: Response, next: NextFunction): Promise<void> => {
			try {
				const patientData: PatientCreateDto = req.body;
				const patient = await this.patientService.registerNewPatient(
					patientData
				);
				ResponseUtil.success(
					res,
					patient,
					"Patient registered successfully",
					201
				);
			} catch (error) {
				logger.error("Registration failed", {
					error: error instanceof Error ? error.message : "Unknown error",
				});
				ResponseUtil.error(res, "Registration failed", 500);
				next(error);
			}
		}
	);

	updatePatientInfo = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const { id } = req.params;
			const patientData: PatientUpdateDto = req.body;
			const patient = await this.patientService.updatePatientInfo(
				id,
				patientData
			);
			ResponseUtil.success(res, patient, "Patient updated successfully");
		}
	);

	deactivatePatient = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const { id } = req.params;
			const patient = await this.patientService.deactivatePatient(id);
			ResponseUtil.success(res, patient, "Patient deactivated successfully");
		}
	);

	verifyInsurance = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const insuranceDetails: InsuranceDetailDto = req.body;
			const result = await this.patientService.verifyInsurance(
				insuranceDetails
			);
			ResponseUtil.success(
				res,
				result,
				result.isValid
					? "Insurance verification successful"
					: "Insurance verification failed"
			);
		}
	);

	searchPatients = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const searchParams: PatientSearchParams = req.query;
			const patients = await this.patientService.searchPatients(searchParams);
			ResponseUtil.success(res, patients, "Patients retrieved successfully");
		}
	);

	getPatientById = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const { id } = req.params;
			const patient = await this.patientService.getPatientById(id);
			ResponseUtil.success(res, patient, "Patient retrieved successfully");
		}
	);

	getPatientByMRN = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const { mrn } = req.params;
			const patient = await this.patientService.getPatientByMRN(mrn);
			ResponseUtil.success(res, patient, "Patient retrieved successfully");
		}
	);

	uploadPatientDocument = asyncHandler(
		async (req: Request, res: Response, next: NextFunction): Promise<void> => {
			try {
				const { patientId } = req.params;
				const document: DocumentUploadDto = req.body;
				const patientDocument = await this.patientService.uploadPatientDocument(
					patientId,
					document
				);
				ResponseUtil.success(
					res,
					patientDocument,
					"Document uploaded successfully",
					201
				);
			} catch (error) {
				logger.error("Document upload failed", {
					error: error instanceof Error ? error.message : "Unknown error",
				});
				ResponseUtil.error(res, "Document upload failed", 500);
				next(error);
			}
		}
	);

	recordPatientConsent = asyncHandler(
		async (req: Request, res: Response, next: NextFunction): Promise<void> => {
			try {
				const { patientId } = req.params;
				const consentData: ConsentDto = req.body;
				const consent = await this.patientService.recordPatientConsent(
					patientId,
					consentData
				);
				ResponseUtil.success(
					res,
					consent,
					"Patient consent recorded successfully",
					201
				);
			} catch (error) {
				logger.error("Failed to record patient consent", {
					error: error instanceof Error ? error.message : "Unknown error",
				});
				ResponseUtil.error(res, "Failed to record patient consent", 500);
				next(error);
			}
		}
	);

	listPatientDocuments = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const { patientId } = req.params;
			const documents = await this.patientService.listPatientDocuments(
				patientId
			);
			ResponseUtil.success(
				res,
				documents,
				"Patient documents retrieved successfully"
			);
		}
	);

	getPatientDocument = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const { documentId } = req.params;
			const document = await this.patientService.getPatientDocument(documentId);
			ResponseUtil.success(res, document, "Document retrieved successfully");
		}
	);

	// Additional endpoints for enhanced functionality
	getPatientsByStatus = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const { status } = req.params;
			const searchParams: PatientSearchParams = {
				...req.query,
				status: status as PatientStatus,
			};
			const patients = await this.patientService.searchPatients(searchParams);
			ResponseUtil.success(
				res,
				patients,
				`${status} patients retrieved successfully`
			);
		}
	);

	getPatientsByDateRange = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const { startDate, endDate } = req.query;
			const searchParams: PatientSearchParams = {
				...req.query,
				registrationDateFrom: startDate as string,
				registrationDateTo: endDate as string,
			};
			const patients = await this.patientService.searchPatients(searchParams);
			ResponseUtil.success(res, patients, "Patients retrieved successfully");
		}
	);

	getPatientsByGender = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const { gender } = req.params;
			const searchParams: PatientSearchParams = {
				...req.query,
				gender: gender as Gender,
			};
			const patients = await this.patientService.searchPatients(searchParams);
			ResponseUtil.success(
				res,
				patients,
				`${gender} patients retrieved successfully`
			);
		}
	);

	getPatientsByLocation = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const { city, county } = req.query;
			const searchParams: PatientSearchParams = {
				...req.query,
				city: city as string,
				county: county as string,
			};
			const patients = await this.patientService.searchPatients(searchParams);
			ResponseUtil.success(res, patients, "Patients retrieved successfully");
		}
	);

	activatePatient = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const { id } = req.params;
			const patient = await this.patientService.updatePatientInfo(id, {
				status: PatientStatus.ACTIVE,
			});
			ResponseUtil.success(res, patient, "Patient activated successfully");
		}
	);

	markPatientDeceased = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const { id } = req.params;
			const patient = await this.patientService.updatePatientInfo(id, {
				status: PatientStatus.DECEASED,
			});
			ResponseUtil.success(res, patient, "Patient status updated to deceased");
		}
	);

	// Bulk operations
	bulkUpdatePatients = asyncHandler(
		async (req: Request, res: Response, next: NextFunction): Promise<void> => {
			const { patientIds, updateData } = req.body;
			const results: Array<{
				patientId: string;
				success: boolean;
				patient?: PatientUpdateDto;
				error?: string;
			}> = [];

			for (const patientId of patientIds) {
				try {
					const patient = await this.patientService.updatePatientInfo(
						patientId,
						updateData
					);
					const patientDto = {
						...patient,
						dateOfBirth: patient.dateOfBirth.toISOString().split("T")[0],
						insuranceDetails: patient.insuranceDetails.map((insurance) => ({
							...insurance,
							validFrom: insurance.validFrom.toISOString().split("T")[0],
							validTo: insurance.validTo.toISOString().split("T")[0],
						})),
					};
					results.push({ patientId, success: true, patient: patientDto });
				} catch (error) {
					const message =
						error instanceof Error ? error.message : "Unknown error";
					results.push({ patientId, success: false, error: message });

					logger.error("Bulk update failed for patient", {
						patientId,
						error: message,
					});
					next(error);
				}
			}

			const hasFailures = results.some((r) => !r.success);

			if (hasFailures) {
				ResponseUtil.success(
					res,
					results,
					"Bulk update completed with some errors",
					207 // Multi-Status (WebDAV) — appropriate for partial success
				);
			} else {
				ResponseUtil.success(
					res,
					results,
					"Bulk update completed successfully"
				);
			}
		}
	);

	// Patient statistics and reports
	getPatientStatistics = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			try {
				const stats = await this.patientService.getPatientStatistics();
				ResponseUtil.success(
					res,
					stats,
					"Patient statistics retrieved successfully"
				);
			} catch (error) {
				logger.error("Error fetching patient statistics:", error);
				ResponseUtil.error(res, "Failed to retrieve patient statistics", 500);
			}
		}
	);

	exportPatients = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const searchParams: PatientSearchParams = req.query;
			const patients = await this.patientService.searchPatients(searchParams);

			// Set headers for CSV download
			res.setHeader("Content-Type", "text/csv");
			res.setHeader(
				"Content-Disposition",
				'attachment; filename="patients.csv"'
			);

			// Convert to CSV format (simplified)
			const csvHeader =
				"MRN,First Name,Last Name,Gender,Date of Birth,Contact Number,Email,Status\n";
			const csvData = patients
				.map(
					(patient) =>
						`${patient.mrn},${patient.firstName},${patient.lastName},${
							patient.gender
						},${patient.dateOfBirth},${patient.contactNumber},${
							patient.email || ""
						},${patient.status}`
				)
				.join("\n");

			res.send(csvHeader + csvData);
		}
	);
}
