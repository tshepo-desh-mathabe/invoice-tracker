import { CreateBankingDetailsDto } from "../dto/create-banking_detail.dto";
import { BankingDetails } from "../entities/banking_detail.entity";

export abstract class IBankingDetailsService {
    /**
     * Creates a new bank account record in the system.
     * @param dto - The data transfer object containing bank account details
     * @returns Saved entity banking detail
     */
    abstract create(dto: CreateBankingDetailsDto): Promise<BankingDetails>;

    /**
     * Finds a bank account by its account number.
     * @param accountNumber - The unique account number to search for
     * @returns The bank account entity (or DTO in implementation)
     * @throws NotFoundException if no account matches the given number
     */
    abstract findByAccountNumber(accountNumber: string): Promise<BankingDetails>;
}
