import { Address } from "../entities/Address.entity";
import { NextOfKin } from "../entities/NextOfKin.entity";
import { InsuranceDetail } from "../entities/InsuranceDetail.entity";
import { PatientDocument } from "../entities/PatientDocument.entity";
import { PatientConsent } from "../entities/PatientConsent.entity";
import {
	NotFoundError,
	ConflictError,
} from "@/core/middleware/error.middleware";
import { AppDataSource } from "@/config/database";
import { logger } from "@/core/utils/logger.util";

import { EntityManager, Repository, MoreThanOrEqual } from "typeorm";
import {
	NextOfKinDto,
	PatientCreateDto,
	PatientUpdateDto,
	DocumentUploadDto,
	ConsentDto,
	PatientSearchParams,
	InsuranceDetailDto,
	VerificationResult,
	PatientStatisticsDto,
	MonthlyRegistrationDto,
} from "../dtos/patient-registration.dto";
import { PatientRepository } from "../repository/patient-registration.repo";
import {
	Patient,
	ConsentStatus,
	PatientStatus,
	Gender,
} from "@/core/types/patient.types";

export class PatientService {
	private patientRepository: PatientRepository;
	private addressRepository: Repository<Address>;
	private nextOfKinRepository: Repository<NextOfKin>;
	private insuranceRepository: Repository<InsuranceDetail>;
	private documentRepository: Repository<PatientDocument>;
	private consentRepository: Repository<PatientConsent>;

	constructor() {
		this.patientRepository = new PatientRepository();
		this.addressRepository = AppDataSource.getRepository(Address);
		this.nextOfKinRepository = AppDataSource.getRepository(NextOfKin);
		this.insuranceRepository = AppDataSource.getRepository(InsuranceDetail);
		this.documentRepository = AppDataSource.getRepository(PatientDocument);
		this.consentRepository = AppDataSource.getRepository(PatientConsent);
	}

	async registerNewPatient(patientData: PatientCreateDto): Promise<Patient> {
		const queryRunner = AppDataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			// Check for duplicates
			await this.checkForDuplicates(patientData);

			// Create address
			const address = this.addressRepository.create({
				streetAddress: patientData.address.streetAddress,
				city: patientData.address.city,
				county: patientData.address.county,
				postalCode: patientData.address.postalCode,
				country: patientData.address.country || "Kenya",
			});

			const savedAddress = await queryRunner.manager.save(address);

			// Create patient
			const patient = this.patientRepository.create({
				nationalId: patientData.nationalId,
				firstName: patientData.firstName,
				lastName: patientData.lastName,
				middleName: patientData.middleName,
				dateOfBirth: new Date(patientData.dateOfBirth),
				gender: patientData.gender as Gender,
				contactNumber: patientData.contactNumber,
				alternateContactNumber: patientData.alternateContactNumber,
				email: patientData.email?.toLowerCase(),
				address: savedAddress,
				bloodGroup: patientData.bloodGroup,
				allergies: patientData.allergies,
				chronicConditions: patientData.chronicConditions,
				photo: patientData.photo,
				status: PatientStatus.ACTIVE,
				registrationDate: new Date(),
			});

			const savedPatient = await queryRunner.manager.save(patient);

			// Create next of kin records
			if (patientData.nextOfKin && patientData.nextOfKin.length > 0) {
				await this.createNextOfKinRecords(
					savedPatient.id,
					patientData.nextOfKin,
					queryRunner.manager
				);
			}

			// Create insurance details
			if (
				patientData.insuranceDetails &&
				patientData.insuranceDetails.length > 0
			) {
				await this.createInsuranceRecords(
					savedPatient.id,
					patientData.insuranceDetails,
					queryRunner.manager
				);
			}

			await queryRunner.commitTransaction();

			logger.info("Patient registered successfully:", {
				patientId: savedPatient.id,
				mrn: savedPatient.mrn,
				name: savedPatient.fullName,
			});

			// Return patient with all relations
			return this.getPatientById(savedPatient.id);
		} catch (error) {
			await queryRunner.rollbackTransaction();
			throw error;
		} finally {
			await queryRunner.release();
		}
	}

	async updatePatientInfo(
		id: string,
		patientData: PatientUpdateDto
	): Promise<Patient> {
		const queryRunner = AppDataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			const patient = await this.patientRepository.findByIdWithAllRelations(id);
			if (!patient) {
				throw new NotFoundError("Patient not found");
			}

			// Update patient basic information
			Object.assign(patient, {
				nationalId: patientData.nationalId ?? patient.nationalId,
				firstName: patientData.firstName ?? patient.firstName,
				lastName: patientData.lastName ?? patient.lastName,
				middleName: patientData.middleName ?? patient.middleName,
				dateOfBirth: patientData.dateOfBirth
					? new Date(patientData.dateOfBirth)
					: patient.dateOfBirth,
				gender: patientData.gender ?? patient.gender,
				contactNumber: patientData.contactNumber ?? patient.contactNumber,
				alternateContactNumber:
					patientData.alternateContactNumber ?? patient.alternateContactNumber,
				email: patientData.email?.toLowerCase() ?? patient.email,
				bloodGroup: patientData.bloodGroup ?? patient.bloodGroup,
				allergies: patientData.allergies ?? patient.allergies,
				chronicConditions:
					patientData.chronicConditions ?? patient.chronicConditions,
				photo: patientData.photo ?? patient.photo,
				status: patientData.status ?? patient.status,
			});

			// Update address if provided
			if (patientData.address) {
				Object.assign(patient.address, {
					streetAddress:
						patientData.address.streetAddress ?? patient.address.streetAddress,
					city: patientData.address.city ?? patient.address.city,
					county: patientData.address.county ?? patient.address.county,
					postalCode:
						patientData.address.postalCode ?? patient.address.postalCode,
					country: patientData.address.country ?? patient.address.country,
				});
				await queryRunner.manager.save(patient.address);
			}

			const updatedPatient = await queryRunner.manager.save(patient);

			// Update next of kin if provided
			if (patientData.nextOfKin) {
				await this.updateNextOfKinRecords(
					id,
					patientData.nextOfKin,
					queryRunner.manager
				);
			}

			// Update insurance details if provided
			if (patientData.insuranceDetails) {
				await this.updateInsuranceRecords(
					id,
					patientData.insuranceDetails,
					queryRunner.manager
				);
			}

			await queryRunner.commitTransaction();

			logger.info("Patient updated successfully:", {
				patientId: id,
				mrn: updatedPatient.mrn,
			});

			return this.getPatientById(id);
		} catch (error) {
			await queryRunner.rollbackTransaction();
			throw error;
		} finally {
			await queryRunner.release();
		}
	}

	async deactivatePatient(id: string): Promise<Patient> {
		const patient = await this.patientRepository.findOne({ where: { id } });
		if (!patient) {
			throw new NotFoundError("Patient not found");
		}

		patient.status = PatientStatus.INACTIVE;
		const updatedPatient = await this.patientRepository.save(patient);

		logger.info("Patient deactivated:", {
			patientId: id,
			mrn: patient.mrn,
		});

		return updatedPatient;
	}

	async verifyInsurance(
		insuranceDetails: InsuranceDetailDto
	): Promise<VerificationResult> {
		try {
			// Mock insurance verification - in real implementation,
			// this would call external insurance provider APIs
			await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

			// Mock verification logic
			const isValidProvider = this.isValidInsuranceProvider(
				insuranceDetails.providerName
			);
			const isPolicyActive = this.isPolicyActive(
				insuranceDetails.validFrom,
				insuranceDetails.validTo
			);

			const isValid = isValidProvider && isPolicyActive;

			return {
				isValid,
				message: isValid
					? "Insurance verification successful"
					: "Insurance verification failed",
				verificationId: `VER-${Date.now()}-${Math.random()
					.toString(36)
					.substr(2, 9)}`,
				details: isValid
					? {
							providerName: insuranceDetails.providerName,
							policyNumber: insuranceDetails.policyNumber,
							coverageType: insuranceDetails.coverageType,
							coveragePercentage: insuranceDetails.coveragePercentage || 0,
							validFrom: new Date(insuranceDetails.validFrom),
							validTo: new Date(insuranceDetails.validTo),
							beneficiaryName: "Policy Holder", // Mock data
							status: "Active",
					  }
					: undefined,
			};
		} catch (error) {
			logger.error("Insurance verification failed:", error);

			return {
				isValid: false,
				message: "Insurance verification service unavailable",
			};
		}
	}

	async searchPatients(searchParams: PatientSearchParams): Promise<Patient[]> {
		const result = await this.patientRepository.searchPatients(searchParams);
		return result.data;
	}

	async getPatientById(id: string): Promise<Patient> {
		const patient = await this.patientRepository.findByIdWithAllRelations(id);
		if (!patient) {
			throw new NotFoundError("Patient not found");
		}
		return patient;
	}

	async getPatientByMRN(mrn: string): Promise<Patient> {
		const patient = await this.patientRepository.findByMRN(mrn);
		if (!patient) {
			throw new NotFoundError("Patient not found");
		}
		return patient;
	}

	async uploadPatientDocument(
		patientId: string,
		document: DocumentUploadDto
	): Promise<PatientDocument> {
		// Verify patient exists
		const patient = await this.patientRepository.findOne({
			where: { id: patientId },
		});
		if (!patient) {
			throw new NotFoundError("Patient not found");
		}

		const patientDocument = this.documentRepository.create({
			patientId,
			documentType: document.documentType,
			documentName: document.documentName,
			filePath: document.filePath,
			uploadDate: new Date(),
			notes: document.notes,
		});

		const savedDocument = await this.documentRepository.save(patientDocument);

		logger.info("Patient document uploaded:", {
			patientId,
			documentId: savedDocument.id,
			documentType: document.documentType,
		});

		return savedDocument;
	}

	async recordPatientConsent(
		patientId: string,
		consentData: ConsentDto
	): Promise<PatientConsent> {
		// Verify patient exists
		const patient = await this.patientRepository.findOne({
			where: { id: patientId },
		});
		if (!patient) {
			throw new NotFoundError("Patient not found");
		}

		const consent = this.consentRepository.create({
			patientId,
			consentType: consentData.consentType,
			consentDate: new Date(consentData.consentDate),
			validUntil: consentData.validUntil
				? new Date(consentData.validUntil)
				: undefined,
			consentDocument: consentData.consentDocument,
			notes: consentData.notes,
			status: ConsentStatus.ACTIVE,
		});

		const savedConsent = await this.consentRepository.save(consent);

		logger.info("Patient consent recorded:", {
			patientId,
			consentId: savedConsent.id,
			consentType: consentData.consentType,
		});

		return savedConsent;
	}

	async listPatientDocuments(patientId: string): Promise<PatientDocument[]> {
		// Verify patient exists
		const patient = await this.patientRepository.findOne({
			where: { id: patientId },
		});
		if (!patient) {
			throw new NotFoundError("Patient not found");
		}

		return this.documentRepository.find({
			where: { patientId },
			order: { uploadDate: "DESC" },
		});
	}

	async getPatientDocument(documentId: string): Promise<PatientDocument> {
		const document = await this.documentRepository.findOne({
			where: { id: documentId },
			relations: ["patient"],
		});
		if (!document) {
			throw new NotFoundError("Document not found");
		}
		return document;
	}

	// Private helper methods
	private async checkForDuplicates(
		patientData: PatientCreateDto
	): Promise<void> {
		const duplicates = await this.patientRepository.findDuplicateCandidates({
			nationalId: patientData.nationalId,
			email: patientData.email,
			contactNumber: patientData.contactNumber,
			firstName: patientData.firstName,
			lastName: patientData.lastName,
			dateOfBirth: new Date(patientData.dateOfBirth),
		});

		if (duplicates.length > 0) {
			const duplicate = duplicates[0];
			let message = "A patient with similar information already exists";

			if (duplicate.nationalId === patientData.nationalId) {
				message = "A patient with this National ID already exists";
			} else if (duplicate.email === patientData.email?.toLowerCase()) {
				message = "A patient with this email already exists";
			} else if (duplicate.contactNumber === patientData.contactNumber) {
				message = "A patient with this contact number already exists";
			}

			throw new ConflictError(message);
		}
	}

	private async createNextOfKinRecords(
		patientId: string,
		nextOfKinData: NextOfKinDto[],
		manager: EntityManager
	): Promise<void> {
		const nextOfKinRecords = nextOfKinData.map((nok) => ({
			patientId,
			name: nok.name,
			relationship: nok.relationship,
			contactNumber: nok.contactNumber,
			alternateContactNumber: nok.alternateContactNumber,
			address: nok.address,
			isPrimaryContact: nok.isPrimaryContact || false,
		}));

		await manager.save(NextOfKin, nextOfKinRecords);
	}

	private async createInsuranceRecords(
		patientId: string,
		insuranceData: InsuranceDetailDto[],
		manager: EntityManager
	): Promise<void> {
		const insuranceRecords = insuranceData.map((ins) => ({
			patientId,
			providerName: ins.providerName,
			policyNumber: ins.policyNumber,
			coverageType: ins.coverageType,
			validFrom: new Date(ins.validFrom),
			validTo: new Date(ins.validTo),
			isPrimary: ins.isPrimary || false,
			coveragePercentage: ins.coveragePercentage || 0,
		}));

		await manager.save(InsuranceDetail, insuranceRecords);
	}

	private async updateNextOfKinRecords(
		patientId: string,
		nextOfKinData: NextOfKinDto[],
		manager: EntityManager
	): Promise<void> {
		// Remove existing records
		await manager.delete(NextOfKin, { patientId });

		// Create new records
		if (nextOfKinData.length > 0) {
			await this.createNextOfKinRecords(patientId, nextOfKinData, manager);
		}
	}

	private async updateInsuranceRecords(
		patientId: string,
		insuranceData: InsuranceDetailDto[],
		manager: EntityManager
	): Promise<void> {
		// Remove existing records
		await manager.delete(InsuranceDetail, { patientId });

		// Create new records
		if (insuranceData.length > 0) {
			await this.createInsuranceRecords(patientId, insuranceData, manager);
		}
	}

	private isValidInsuranceProvider(providerName: string): boolean {
		// Mock validation - in real implementation, check against approved providers
		const validProviders = [
			"NHIF",
			"AAR",
			"Jubilee",
			"CIC",
			"Madison",
			"Britam",
			"Resolution",
			"Heritage",
			"Pioneer",
			"Kenindia",
		];
		return validProviders.some((provider) =>
			providerName.toLowerCase().includes(provider.toLowerCase())
		);
	}

	private isPolicyActive(validFrom: string, validTo: string): boolean {
		const now = new Date();
		const fromDate = new Date(validFrom);
		const toDate = new Date(validTo);

		return now >= fromDate && now <= toDate;
	}

	async getPatientStatistics(): Promise<PatientStatisticsDto> {
		try {
			// Get total patient count
			const totalPatients = await this.patientRepository.count();

			// Get patients by status
			const activePatients = await this.patientRepository.count({
				where: { status: PatientStatus.ACTIVE },
			});
			const inactivePatients = await this.patientRepository.count({
				where: { status: PatientStatus.INACTIVE },
			});
			const deceasedPatients = await this.patientRepository.count({
				where: { status: PatientStatus.DECEASED },
			});

			// Get patients by gender
			const malePatients = await this.patientRepository.count({
				where: { gender: Gender.MALE },
			});
			const femalePatients = await this.patientRepository.count({
				where: { gender: Gender.FEMALE },
			});
			const otherGenderPatients = await this.patientRepository.count({
				where: { gender: Gender.OTHER },
			});

			// Get registration trends (last 12 months)
			const currentDate = new Date();
			const oneYearAgo = new Date();
			oneYearAgo.setFullYear(currentDate.getFullYear() - 1);

			const recentRegistrations = await this.patientRepository.count({
				where: {
					registrationDate: MoreThanOrEqual(oneYearAgo),
				},
			});

			// Get registrations this month
			const currentMonth = new Date(
				currentDate.getFullYear(),
				currentDate.getMonth(),
				1
			);
			const thisMonthRegistrations = await this.patientRepository.count({
				where: {
					registrationDate: MoreThanOrEqual(currentMonth),
				},
			});

			const monthlyBreakdownRaw = await this.patientRepository
				.createQueryBuilder("patient")
				.select("EXTRACT(YEAR FROM patient.registrationDate)", "year")
				.addSelect("EXTRACT(MONTH FROM patient.registrationDate)", "month")
				.addSelect("COUNT(*)", "count")
				.where("patient.registrationDate >= :oneYearAgo", { oneYearAgo })
				.groupBy("EXTRACT(YEAR FROM patient.registrationDate)")
				.addGroupBy("EXTRACT(MONTH FROM patient.registrationDate)")
				.orderBy("year", "ASC")
				.addOrderBy("month", "ASC")
				.getRawMany();

			const monthNames = [
				"January",
				"February",
				"March",
				"April",
				"May",
				"June",
				"July",
				"August",
				"September",
				"October",
				"November",
				"December",
			];

			const monthlyBreakdown: MonthlyRegistrationDto[] =
				monthlyBreakdownRaw.map((row) => ({
					month: `${row.year}-${String(row.month).padStart(2, "0")}`,
					monthName: monthNames[parseInt(row.month) - 1],
					year: parseInt(row.year),
					count: parseInt(row.count),
				}));

			const completeMonthlyBreakdown = this.fillMissingMonths(
				monthlyBreakdown,
				oneYearAgo,
				currentDate
			);

			// const currentYear = currentDate.getFullYear();
			const childrenCount = await this.patientRepository
				.createQueryBuilder("patient")
				.where("EXTRACT(YEAR FROM AGE(patient.dateOfBirth)) < 18")
				.getCount();

			const adultsCount = await this.patientRepository
				.createQueryBuilder("patient")
				.where("EXTRACT(YEAR FROM AGE(patient.dateOfBirth)) BETWEEN 18 AND 64")
				.getCount();

			const seniorsCount = await this.patientRepository
				.createQueryBuilder("patient")
				.where("EXTRACT(YEAR FROM AGE(patient.dateOfBirth)) >= 65")
				.getCount();

			// Get top counties
			const countyStats = await AppDataSource.createQueryBuilder()
				.select("address.county", "county")
				.addSelect("COUNT(*)", "count")
				.from("patients", "patient")
				.innerJoin("addresses", "address", "patient.addressId = address.id")
				.groupBy("address.county")
				.orderBy("COUNT(*)", "DESC")
				.limit(10)
				.getRawMany();

			// Get insurance coverage stats
			const patientsWithInsurance = await this.patientRepository
				.createQueryBuilder("patient")
				.innerJoin("patient.insuranceDetails", "insurance")
				.getCount();

			const patientsWithoutInsurance = totalPatients - patientsWithInsurance;

			// Get top insurance providers
			const insuranceProviderStats = await this.insuranceRepository
				.createQueryBuilder("insurance")
				.select("insurance.providerName", "provider")
				.addSelect("COUNT(DISTINCT insurance.patientId)", "patientCount")
				.groupBy("insurance.providerName")
				.orderBy("COUNT(DISTINCT insurance.patientId)", "DESC")
				.limit(10)
				.getRawMany();

			// Calculate average age
			const avgAgeResult = await this.patientRepository
				.createQueryBuilder("patient")
				.select("AVG(EXTRACT(YEAR FROM AGE(patient.dateOfBirth)))", "avgAge")
				.getRawOne();

			const averageAge = Math.round(parseFloat(avgAgeResult?.avgAge || "0"));

			return {
				overview: {
					totalPatients,
					activePatients,
					inactivePatients,
					deceasedPatients,
					recentRegistrations,
					thisMonthRegistrations,
					averageAge,
				},
				demographics: {
					gender: {
						male: malePatients,
						female: femalePatients,
						other: otherGenderPatients,
					},
					ageGroups: {
						children: childrenCount, // 0-17
						adults: adultsCount, // 18-64
						seniors: seniorsCount, // 65+
					},
					topCounties: countyStats.map((stat) => ({
						county: stat.county,
						count: parseInt(stat.count),
					})),
				},
				insurance: {
					covered: patientsWithInsurance,
					uncovered: patientsWithoutInsurance,
					coveragePercentage:
						totalPatients > 0
							? Math.round((patientsWithInsurance / totalPatients) * 100)
							: 0,
					topProviders: insuranceProviderStats.map((stat) => ({
						provider: stat.provider,
						patientCount: parseInt(stat.patientCount),
					})),
				},
				registrationTrends: {
					lastTwelveMonths: recentRegistrations,
					currentMonth: thisMonthRegistrations,
					monthlyBreakdown: completeMonthlyBreakdown,
				},
			};
		} catch (error) {
			logger.error("Error fetching patient statistics:", error);
			throw new Error("Failed to fetch patient statistics");
		}
	}

	private fillMissingMonths(
		monthlyData: MonthlyRegistrationDto[],
		startDate: Date,
		endDate: Date
	): MonthlyRegistrationDto[] {
		const monthNames = [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December",
		];

		const result: MonthlyRegistrationDto[] = [];
		const current = new Date(startDate);

		// Create a map for existing data for quick lookup
		const dataMap = new Map<string, number>();
		monthlyData.forEach((item) => {
			dataMap.set(item.month, item.count);
		});

		while (current <= endDate) {
			const year = current.getFullYear();
			const month = current.getMonth() + 1;
			const monthKey = `${year}-${String(month).padStart(2, "0")}`;

			result.push({
				month: monthKey,
				monthName: monthNames[month - 1],
				year: year,
				count: dataMap.get(monthKey) || 0,
			});

			// Move to next month
			current.setMonth(current.getMonth() + 1);
		}

		return result;
	}
}
