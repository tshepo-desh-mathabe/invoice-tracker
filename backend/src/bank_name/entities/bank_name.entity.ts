import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: 'bank_name' })
export class BankName {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false, length: 50, unique: true })
    name: string;

    @Column({ name: 'branch_code', nullable: false, length: 10 })
    branchCode: string;
}
