import { MoreThanOrEqual, Repository } from "typeorm";
import { AppDataSource } from "@/config/database";
import { PaginatedResponseDto } from "@/shared/dto/base.dto";
import { Patient } from "../entities";
import { PatientStatus } from "@/core/types/patient.types";
import { PatientSearchParams } from "../dtos";

interface DuplicateSearchParams {
	nationalId?: string;
	email?: string;
	contactNumber?: string;
	firstName?: string;
	lastName?: string;
	dateOfBirth?: Date;
	status?: string;
}

export class PatientRepository extends Repository<Patient> {
	constructor() {
		super(Patient, AppDataSource.manager);
	}

	async findByMRN(mrn: string): Promise<Patient | null> {
		return this.findOne({
			where: { mrn },
			relations: ["address", "nextOfKin", "insuranceDetails"],
		});
	}

	async findByNationalId(nationalId: string): Promise<Patient | null> {
		return this.findOne({
			where: { nationalId },
			relations: ["address", "nextOfKin", "insuranceDetails"],
		});
	}

	async findByEmail(email: string): Promise<Patient | null> {
		return this.findOne({
			where: { email: email.toLowerCase() },
			relations: ["address", "nextOfKin", "insuranceDetails"],
		});
	}

	async findByContactNumber(contactNumber: string): Promise<Patient | null> {
		return this.findOne({
			where: { contactNumber },
			relations: ["address", "nextOfKin", "insuranceDetails"],
		});
	}

	async findByIdWithAllRelations(id: string): Promise<Patient | null> {
		return this.findOne({
			where: { id },
			relations: [
				"address",
				"nextOfKin",
				"insuranceDetails",
				"documents",
				"consents",
			],
		});
	}

	async searchPatients(
		params: PatientSearchParams
	): Promise<PaginatedResponseDto<Patient>> {
		const {
			page = 1,
			limit = 10,
			search,
			firstName,
			lastName,
			mrn,
			nationalId,
			contactNumber,
			email,
			status,
			gender,
			dateOfBirthFrom,
			dateOfBirthTo,
			registrationDateFrom,
			registrationDateTo,
			city,
			county,
			sortBy = "registrationDate",
			sortOrder = "DESC",
		} = params;

		const skip = (page - 1) * limit;

		const query = this.createQueryBuilder("patient")
			.leftJoinAndSelect("patient.address", "address")
			.leftJoinAndSelect("patient.nextOfKin", "nextOfKin")
			.leftJoinAndSelect("patient.insuranceDetails", "insuranceDetails");

		// General search across multiple fields
		if (search) {
			query.andWhere(
				`(
                    patient.firstName ILIKE :search OR 
                    patient.lastName ILIKE :search OR 
                    patient.mrn ILIKE :search OR 
                    patient.nationalId ILIKE :search OR 
                    patient.contactNumber ILIKE :search OR 
                    patient.email ILIKE :search
                )`,
				{ search: `%${search}%` }
			);
		}

		// Specific field searches
		if (firstName) {
			query.andWhere("patient.firstName ILIKE :firstName", {
				firstName: `%${firstName}%`,
			});
		}

		if (lastName) {
			query.andWhere("patient.lastName ILIKE :lastName", {
				lastName: `%${lastName}%`,
			});
		}

		if (mrn) {
			query.andWhere("patient.mrn ILIKE :mrn", { mrn: `%${mrn}%` });
		}

		if (nationalId) {
			query.andWhere("patient.nationalId = :nationalId", { nationalId });
		}

		if (contactNumber) {
			query.andWhere("patient.contactNumber ILIKE :contactNumber", {
				contactNumber: `%${contactNumber}%`,
			});
		}

		if (email) {
			query.andWhere("patient.email ILIKE :email", {
				email: `%${email.toLowerCase()}%`,
			});
		}

		if (status) {
			query.andWhere("patient.status = :status", { status });
		}

		if (gender) {
			query.andWhere("patient.gender = :gender", { gender });
		}

		// Date range filters
		if (dateOfBirthFrom) {
			query.andWhere("patient.dateOfBirth >= :dateOfBirthFrom", {
				dateOfBirthFrom,
			});
		}

		if (dateOfBirthTo) {
			query.andWhere("patient.dateOfBirth <= :dateOfBirthTo", {
				dateOfBirthTo,
			});
		}

		if (registrationDateFrom) {
			query.andWhere("patient.registrationDate >= :registrationDateFrom", {
				registrationDateFrom,
			});
		}

		if (registrationDateTo) {
			query.andWhere("patient.registrationDate <= :registrationDateTo", {
				registrationDateTo,
			});
		}

		// Address-based filters
		if (city) {
			query.andWhere("address.city ILIKE :city", { city: `%${city}%` });
		}

		if (county) {
			query.andWhere("address.county ILIKE :county", {
				county: `%${county}%`,
			});
		}

		// Sorting
		const allowedSortFields = [
			"registrationDate",
			"firstName",
			"lastName",
			"dateOfBirth",
			"mrn",
			"createdAt",
			"updatedAt",
		];

		if (allowedSortFields.includes(sortBy)) {
			query.orderBy(`patient.${sortBy}`, sortOrder);
		} else {
			query.orderBy("patient.registrationDate", "DESC");
		}

		// Add secondary sort by name for consistency
		if (sortBy !== "firstName" && sortBy !== "lastName") {
			query.addOrderBy("patient.firstName", "ASC");
			query.addOrderBy("patient.lastName", "ASC");
		}

		query.skip(skip).take(limit);

		const [data, total] = await query.getManyAndCount();

		return {
			data,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
			hasNext: page < Math.ceil(total / limit),
			hasPrev: page > 1,
		};
	}

	async getPatientStatistics(): Promise<{
		total: number;
		active: number;
		inactive: number;
		deceased: number;
		registeredThisMonth: number;
		registeredThisYear: number;
		averageAge: number;
		genderDistribution: { male: number; female: number; other: number };
	}> {
		const total = await this.count();
		const active = await this.count({
			where: { status: PatientStatus.ACTIVE },
		});
		const inactive = await this.count({
			where: { status: PatientStatus.INACTIVE },
		});
		const deceased = await this.count({
			where: { status: PatientStatus.DECEASED },
		});

		const now = new Date();
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const startOfYear = new Date(now.getFullYear(), 0, 1);

		const registeredThisMonth = await this.count({
			where: {
				registrationDate: MoreThanOrEqual(startOfMonth),
			},
		});

		const registeredThisYear = await this.count({
			where: {
				registrationDate: MoreThanOrEqual(startOfYear),
			},
		});

		// Calculate average age
		const ageQuery = await this.createQueryBuilder("patient")
			.select("AVG(EXTRACT(YEAR FROM AGE(patient.dateOfBirth)))", "avgAge")
			.where("patient.status = :status", { status: PatientStatus.ACTIVE })
			.getRawOne();

		const averageAge = parseFloat(ageQuery.avgAge) || 0;

		// Gender distribution
		const genderQuery = await this.createQueryBuilder("patient")
			.select("patient.gender", "gender")
			.addSelect("COUNT(*)", "count")
			.where("patient.status = :status", { status: PatientStatus.ACTIVE })
			.groupBy("patient.gender")
			.getRawMany();

		const genderDistribution = {
			male: 0,
			female: 0,
			other: 0,
		};

		genderQuery.forEach((row) => {
			const count = parseInt(row.count);
			switch (row.gender) {
				case "Male":
					genderDistribution.male = count;
					break;
				case "Female":
					genderDistribution.female = count;
					break;
				case "Other":
					genderDistribution.other = count;
					break;
			}
		});

		return {
			total,
			active,
			inactive,
			deceased,
			registeredThisMonth,
			registeredThisYear,
			averageAge: Math.round(averageAge * 10) / 10, // Round to 1 decimal place
			genderDistribution,
		};
	}

	async findDuplicateCandidates(patient: Partial<Patient>): Promise<Patient[]> {
		const query = this.createQueryBuilder("patient").leftJoinAndSelect(
			"patient.address",
			"address"
		);

		const conditions: string[] = [];
		const parameters: DuplicateSearchParams = {};

		// Check for exact matches on key identifiers
		if (patient.nationalId) {
			conditions.push("patient.nationalId = :nationalId");
			parameters.nationalId = patient.nationalId;
		}

		if (patient.email) {
			conditions.push("patient.email = :email");
			parameters.email = patient.email.toLowerCase();
		}

		if (patient.contactNumber) {
			conditions.push("patient.contactNumber = :contactNumber");
			parameters.contactNumber = patient.contactNumber;
		}

		// Check for potential duplicates based on name and date of birth
		if (patient.firstName && patient.lastName && patient.dateOfBirth) {
			conditions.push(`(
                patient.firstName ILIKE :firstName AND 
                patient.lastName ILIKE :lastName AND 
                patient.dateOfBirth = :dateOfBirth
            )`);
			parameters.firstName = patient.firstName;
			parameters.lastName = patient.lastName;
			parameters.dateOfBirth = patient.dateOfBirth;
		}

		if (conditions.length === 0) {
			return [];
		}

		query.where(`(${conditions.join(" OR ")})`, parameters);
		query.andWhere("patient.status != :status", {
			status: PatientStatus.DECEASED,
		});

		return query.getMany();
	}
}
