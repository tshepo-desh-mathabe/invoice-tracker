import { CreateBankNameDto, BankNameDto } from "../dto/create-bank_name.dto";
import { BankName } from "../entities/bank_name.entity";

export abstract class IBankNameService {
    /**
     * Creates a new bank entry.
     * @param dto - Data transfer object containing bank name and branch code.
     * @returns A string message confirming creation.
     */
    abstract create(dto: CreateBankNameDto): Promise<string>;

    /**
     * Retrieves all banks.
     * @returns An array of BankNameDto objects with ID hidden.
     */
    abstract findAll(): Promise<BankNameDto[]>;

    /**
     * Searches for banks by name using SQL ILIKE for case-insensitive matching.
     * @param name - Partial or full bank name to search for.
     * @returns An array of BankNameDto objects, with database IDs hidden.
     */
    abstract findByName(name: string): Promise<BankNameDto[]>;

    /**
     * Retrieves a bank entity by exact name.
     * @param name - Name of the bank.
     * @returns BankName entity including the database ID.
     */
    abstract getByName(name: string): Promise<BankName>;
}
