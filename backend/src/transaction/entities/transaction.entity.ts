import { Client } from "src/client/entities/client.entity";
import { Invoice } from "src/invoice/entities/invoice.entity";
import { PaymentMethod } from "src/payment_method/entities/payment_method.entity";
import { TransactionStatus } from "src/util/constans";
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, OneToMany, Index } from "typeorm";

@Entity({ name: 'transaction' })
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ name: 'trxn_reference', unique: true })
    trxnReference: string;

    @ManyToOne(() => Client)
    @JoinColumn({ name: 'client_id' })
    client: Client;

    @Column({
        type: 'decimal',
        precision: 9,
        scale: 2,
        nullable: false
    })
    amount: number;

    @ManyToOne(() => PaymentMethod)
    @JoinColumn({ name: 'payment_method_id' })
    paymentMethod: PaymentMethod;

    @OneToMany(() => Invoice, (invoice) => invoice)
    @JoinColumn({ name: 'invoice_id' })
    invoices: Invoice[];

    @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING, nullable: false })
    status: TransactionStatus;

    @Column({ name: 'is_final_state', default: false })
    isFinalState: boolean;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', nullable: false })
    createdAt: Date;

    @Column({ name: 'updatedAt', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', nullable: false })
    updatedAt: Date;

    @Column({ name: 'expiresAt', type: 'timestamp', nullable: false })
    expiresAt: Date;
}
