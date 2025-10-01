import { CreateTransactionDto, TransactionDto } from "../dto/create-transaction.dto";
import { UpdateTransactionDto } from "../dto/update-transaction.dto";
import { Transaction } from "../entities/transaction.entity";

/**
 * Abstract interface defining the contract for transaction-related operations.
 * Any service implementing this interface must provide these methods.
 */
export abstract class ITransactionService {

    /**
     * Create a new transaction.
     * @param dto - Data Transfer Object containing transaction details.
     * @returns A promise that resolves to the generated transaction reference string.
     */
    abstract create(dto: CreateTransactionDto): Promise<string>;

    /**
     * Retrieve a transaction by its unique transaction reference.
     * @param trxnReference - The unique reference string of the transaction.
     * @returns A promise that resolves to the Transaction entity.
     * @throws NotFoundException if the transaction is not found.
     */
    abstract findByReference(trxnReference: string): Promise<Transaction>;

    /**
     * Update an existing transaction using its transaction reference.
     * Only allowed fields should be updated.
     * @param updateData - Partial transaction data containing fields to update.
     * @returns A promise that resolves to the updated Transaction entity.
     * @throws Error if the update fails.
     */
    abstract updateByReference(updateData: UpdateTransactionDto): Promise<Transaction>;
}
