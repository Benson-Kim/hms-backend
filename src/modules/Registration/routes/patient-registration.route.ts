import { Router } from "express";
import { authMiddleware } from "@/core/middleware/auth.middleware";
import { requirePermission } from "@/core/middleware/rbac.middleware";
import {
	validateBody,
	validateQuery,
	validateParams,
} from "@/core/middleware/validation.middleware";
import { PatientController } from "../controllers/patient-registration.controller";
import {
	ConsentDto,
	documentIdDto,
	DocumentUploadDto,
	InsuranceDetailDto,
	PatientCreateDto,
	PatientIdDto,
	PatientSearchParams,
	PatientUpdateDto,
} from "../dtos";

const router = Router();
const patientController = new PatientController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Patient Registration and Management Routes
router.post(
	"/register",
	requirePermission("PATIENT", "CREATE"),
	validateBody(PatientCreateDto),
	patientController.registerNewPatient
);

router.put(
	"/:patientId",
	requirePermission("PATIENT", "UPDATE"),
	validateParams(PatientIdDto),
	validateBody(PatientUpdateDto),
	patientController.updatePatientInfo
);

router.patch(
	"/:patientId/deactivate",
	requirePermission("PATIENT", "UPDATE"),
	validateParams(PatientIdDto),
	patientController.deactivatePatient
);

router.patch(
	"/:patientId/activate",
	requirePermission("PATIENT", "UPDATE"),
	validateParams(PatientIdDto),
	patientController.activatePatient
);

router.patch(
	"/:patientId/deceased",
	requirePermission("PATIENT", "UPDATE"),
	validateParams(PatientIdDto),
	patientController.markPatientDeceased
);

// Patient Retrieval Routes
router.get(
	"/search",
	requirePermission("PATIENT", "VIEW"),
	validateQuery(PatientSearchParams),
	patientController.searchPatients
);

router.get(
	"/:patientId",
	requirePermission("PATIENT", "VIEW"),
	validateParams(PatientIdDto),
	patientController.getPatientById
);

router.get(
	"/mrn/:mrn",
	requirePermission("PATIENT", "VIEW"),
	patientController.getPatientByMRN
);

// Filtered Patient Retrieval Routes
router.get(
	"/status/:status",
	requirePermission("PATIENT", "VIEW"),
	patientController.getPatientsByStatus
);

router.get(
	"/gender/:gender",
	requirePermission("PATIENT", "VIEW"),
	patientController.getPatientsByGender
);

router.get(
	"/location/filter",
	requirePermission("PATIENT", "VIEW"),
	patientController.getPatientsByLocation
);

router.get(
	"/date-range/filter",
	requirePermission("PATIENT", "VIEW"),
	patientController.getPatientsByDateRange
);

// Insurance Verification Routes
router.post(
	"/insurance/verify",
	requirePermission("PATIENT", "VIEW"),
	validateBody(InsuranceDetailDto),
	patientController.verifyInsurance
);

// Document Management Routes
router.post(
	"/:patientId/documents",
	requirePermission("PATIENT", "UPDATE"),
	validateParams(PatientIdDto),
	validateBody(DocumentUploadDto),
	patientController.uploadPatientDocument
);

router.get(
	"/:patientId/documents",
	requirePermission("PATIENT", "VIEW"),
	validateParams(PatientIdDto),
	patientController.listPatientDocuments
);

router.get(
	"/documents/:documentId",
	requirePermission("PATIENT", "VIEW"),
	validateParams(documentIdDto),
	patientController.getPatientDocument
);

// Consent Management Routes
router.post(
	"/:patientId/consents",
	requirePermission("PATIENT", "UPDATE"),
	validateParams(PatientIdDto),
	validateBody(ConsentDto),
	patientController.recordPatientConsent
);

// Bulk Operations Routes
router.patch(
	"/bulk/update",
	requirePermission("PATIENT", "UPDATE"),
	patientController.bulkUpdatePatients
);

// Statistics and Reporting Routes
router.get(
	"/reports/statistics",
	requirePermission("PATIENT", "VIEW"),
	patientController.getPatientStatistics
);

router.get(
	"/reports/export",
	requirePermission("PATIENT", "VIEW"),
	validateQuery(PatientSearchParams),
	patientController.exportPatients
);

export { router as patientRegistrationRoutes };
