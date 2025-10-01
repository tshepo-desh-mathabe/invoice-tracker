import { BankName } from "src/bank_name/entities/bank_name.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, Index, ManyToOne } from "typeorm";

@Entity({ name: 'bank_account' })
export class BankingDetails {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ name: 'account_number', nullable: false, unique: true, length: 50 })
    accountNumber: string;
    
    @ManyToOne(() => BankName, { eager: false })
    @JoinColumn({ name: 'bank_name_id' })
    bankName: BankName;
}
