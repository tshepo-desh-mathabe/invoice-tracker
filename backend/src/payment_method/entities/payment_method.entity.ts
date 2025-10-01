import { Transaction } from "src/transaction/entities/transaction.entity";
import { MethodType } from "src/util/constans";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";

@Entity({ name: 'payment_method' })
export class PaymentMethod {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'enum', enum: MethodType, unique: true, nullable: false })
    name: MethodType;

    @OneToMany(() => Transaction, transaction => transaction.paymentMethod)
    transactions: Transaction[];
}
