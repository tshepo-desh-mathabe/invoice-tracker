import { Type } from 'class-transformer';
import { Client } from 'src/client/entities/client.entity';
import { InvoiceItem } from 'src/invoice_item/entities/invoice_item.entity';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { TransactionStatus } from 'src/util/constans';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

@Entity({ name: 'invoice' })
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Transaction)
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({
    type: 'decimal',
    precision: 9,
    scale: 2,
    nullable: false,
  })
  amount: number;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true })
  @Type(() => InvoiceItem) // helps class-transformer know the type
  items: InvoiceItem[];

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @Column({ nullable: true, length: 150 })
  reason: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date;
}
