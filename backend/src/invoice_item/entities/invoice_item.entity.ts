import { Exclude } from 'class-transformer';
import { Invoice } from 'src/invoice/entities/invoice.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';

@Index('idx_invoice_item_name', ['name'])
@Entity({ name: 'invoice_items' })
export class InvoiceItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('idx_invoice_item_sku', { unique: true })
  @Column({ name: 'sku', nullable: false, unique: true })
  sku: string;

  @Column({ name: 'name', nullable: false })
  name: string;

  @Column({ name: 'description', nullable: false })
  description: string;

  @Column({ nullable: false })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 9, scale: 2, nullable: false })
  unitPrice: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 9, scale: 2, nullable: false })
  totalPrice: number;

  @ManyToOne(() => Invoice, (invoice) => invoice.items)
  @Exclude({ toPlainOnly: true }) // prevent circular reference
  invoice: Invoice;
}
