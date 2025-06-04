import { Repository } from "typeorm";
import { Medication } from "../entities/medication.entity";
import { AppDataSource } from "@/config/database";
import { MedicationSearchParams } from "../dtos/medication.dto";
import { PaginatedResponseDto } from "@/shared/dto/base.dto";

export class MedicationRepositoty {
	private repository: Repository<Medication>;

	constructor() {
		this.repository = AppDataSource.getRepository(Medication);
	}

	async delete(id: string): Promise<boolean> {
		const result = await this.repository.softDelete({ id });
		return result.affected !== 0;
	}

	async findOneById(id: string): Promise<Medication | null> {
		return await this.repository.findOne({ where: { id } });
	}

	async findOneByCode(code: string): Promise<Medication | null> {
		return await this.repository.findOne({ where: { code } });
	}

	async findByCategory(category: string): Promise<Medication | null> {
		return await this.repository.findOne({ where: { category } });
	}

	async searchMedications(
		searchParams: MedicationSearchParams
	): Promise<PaginatedResponseDto<Medication>> {
		const {
			page = 1,
			limit = 10,
			search,
			code,
			name,
			genericName,
			category,
			formulation,
			strength,
			unit,
			location,
			minPrice,
			maxPrice,
			isControlled,
			requiresPrescription,
			status,
			sortBy = "name",
			sortOrder = "DESC",
		} = searchParams;

		const skip = (page - 1) * limit;
		const query = this.repository.createQueryBuilder("medications");

		if (search) {
			query.andWhere(
				`(
                    medications.name ILIKE :search OR 
                    medications.genericName  ILIKE :search OR 
                    medications.code  ILIKE :search 
                )`,
				{ search: `%${search}%` }
			);
		}

		if (name) {
			query.andWhere("medications.name ILIKE :name", {
				name: `%${name}%`,
			});
		}

		if (genericName) {
			query.andWhere("medications.genericName ILIKE :genericName", {
				genericName: `%${genericName}%`,
			});
		}

		if (code) {
			query.andWhere("medications.code ILIKE :code", {
				code: `%${code}%`,
			});
		}

		if (category) {
			query.andWhere("medications.category ILIKE :category", {
				category: `%${category}%`,
			});
		}

		if (formulation) {
			query.andWhere("medications.formulation ILIKE :formulation", {
				formulation: `%${formulation}%`,
			});
		}

		if (strength) {
			query.andWhere("medications.strength ILIKE :strength", {
				strength: `%${strength}%`,
			});
		}

		if (unit) {
			query.andWhere("medications.unit ILIKE :unit", {
				unit: `%${unit}%`,
			});
		}

		if (minPrice) {
			query.andWhere("medications.price >= :minPrice", {
				minPrice: `%${minPrice}%`,
			});
		}

		if (maxPrice) {
			query.andWhere("medications.price =< :maxPrice", {
				maxPrice: `%${maxPrice}%`,
			});
		}

		if (location) {
			query.andWhere("medications.location ILIKE :location", {
				location: `%${location}%`,
			});
		}

		if (isControlled) {
			query.andWhere("medications.isControlled ILIKE :isControlled", {
				isControlled: `%${isControlled}%`,
			});
		}

		if (requiresPrescription) {
			query.andWhere(
				"medications.requiresPrescription ILIKE :requiresPrescription",
				{
					requiresPrescription: `%${requiresPrescription}%`,
				}
			);
		}

		if (status) {
			query.andWhere("medications.status ILIKE :status", {
				status: `%${status}%`,
			});
		}

		const allowedSortFields = [
			"name",
			"genericName",
			"code",
			"reorderLevel",
			"stockQuantity",
			"expiryDate",
			"batchNumber",
			"price",
		];

		if (allowedSortFields.includes(sortBy)) {
			query.orderBy(`medications.${sortBy}`, sortOrder);
		} else {
			query.orderBy("medications.name", "ASC");
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

	async findLowStockMedications(): Promise<Medication[]> {
		return await this.repository
			.createQueryBuilder("medications")
			.where("medications.stockQuantity <= medications.reorderLevel")
			.andWhere("medications.status = :status", { status: "Active" })
			.getMany();
	}

	async findExpiredMedications() {
		const currentDate = new Date();

		return await this.repository
			.createQueryBuilder("medications")
			.where("medications.expiryDate < :currentDate", { currentDate })
			.andWhere("medications.status = :status", { status: "Active" })
			.andWhere("medications.expiryDate IS NOT NULL")
			.getMany();
	}

	async findExpiringSoonMedications(days: number = 30): Promise<Medication[]> {
		const currentDate = new Date();
		const futureDate = new Date();
		futureDate.setDate(futureDate.getDate() + days);

		return await this.repository
			.createQueryBuilder("medications")
			.where("medications.expiryDate > :currentDate", { currentDate })
			.andWhere("medications.expiryDate <= :futureDate", { futureDate })
			.andWhere("medications.expiryDate IS NOT NULL")
			.andWhere("medications.status = :status", { status: "Active" })
			.getMany();
	}
}
