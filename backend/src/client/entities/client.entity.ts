import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Invoice } from '../../invoice/entities/invoice.entity';
import { BankingDetails } from 'src/banking_details/entities/banking_detail.entity';

@Entity({ name: 'client' })
export class Client {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({ name: 'full_name', nullable: false, length: 100 })
    fullName: string;

    @Index('idx_client_email', { unique: true })
    @Column({ name: 'email', nullable: false, unique: true, length: 100 })
    email: string;

    @Index('idx_client_phone_number', { unique: true })
    @Column({ name: 'phone_number', nullable: false, unique: true, length: 20 })
    phoneNumber: string;
    
    @OneToMany(() => Invoice, (i) => i.transaction)
    invoices: Promise<Invoice[]>;
    
    @ManyToOne(() => BankingDetails)
    @JoinColumn({ name: 'bank_account_id' })
    bankingDetails: BankingDetails;
}
