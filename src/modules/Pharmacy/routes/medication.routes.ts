import { Router } from "express";
import { MedicationController } from "../controllers/medication.controller";
import { requirePermission } from "@/core/middleware/rbac.middleware";
import {
	validateBody,
	validateParams,
	validateQuery,
} from "@/core/middleware/validation.middleware";
import {
	CreateMedicationDto,
	MedicationIdto,
	MedicationSearchParams,
	UpdateMedicationDto,
} from "../dtos/medication.dto";
import { authMiddleware } from "@/core/middleware/auth.middleware";

const router = Router();
const medicationController = new MedicationController();

router.use(authMiddleware);

// POST route
router.post(
	"/",
	requirePermission("MEDICATION", "CREATE_MEDICATION"),
	validateBody(CreateMedicationDto),
	medicationController.createMedication
);

// PUT route
router.put(
	"/:id",
	requirePermission("MEDICATION", "UPDATE_MEDICATION"),
	validateBody(UpdateMedicationDto),
	validateParams(MedicationIdto),
	medicationController.updateMedication
);

// DELETE route
router.delete(
	"/:id",
	requirePermission("MEDICATION", "DELETE_MEDICATION"),
	validateParams(MedicationIdto),
	medicationController.deleteMedication
);

// GET routes
router.get(
	"/search",
	requirePermission("MEDICATION", "VIEW_MEDICATION"),
	validateQuery(MedicationSearchParams),
	medicationController.getAllMedications
);

router.get(
	"/expired",
	requirePermission("MEDICATION", "VIEW_MEDICATION"),
	medicationController.getExpiredMedications
);

router.get(
	"/expiring",
	requirePermission("MEDICATION", "VIEW_MEDICATION"),
	medicationController.getExpiringSoonMedications
);

router.get(
	"/low-stock",
	requirePermission("MEDICATION", "VIEW_MEDICATION"),
	medicationController.getLowStockMedications
);

router.get(
	"/code/:code",
	requirePermission("MEDICATION", "VIEW_MEDICATION"),
	medicationController.getMedicationByCode
);

router.get(
	"/category/:category",
	requirePermission("MEDICATION", "VIEW_MEDICATION"),
	medicationController.getMedicationsByCategory
);

router.get(
	"/:id",
	requirePermission("MEDICATION", "VIEW_MEDICATION"),
	validateParams(MedicationIdto),
	medicationController.getMedicationById
);

export { router as medicationRoutes };
