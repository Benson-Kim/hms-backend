import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
} from "typeorm";

@Entity("addresses")
export class Address {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column()
	streetAddress!: string;

	@Column()
	city!: string;

	@Column()
	county!: string;

	@Column()
	postalCode!: string;

	@Column({ default: "Kenya" })
	country!: string;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
