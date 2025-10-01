import { CreateInvoiceDto, InvoiceDto } from "../dto/create-invoice.dto";
import { FindInvoicesFilter } from "./invoice.filter.payload";

// Abstract class defining the contract for the InvoiceService
export abstract class IInvoiceService {

    /**
     * Creates a new invoice with associated transaction and invoice items
     * @param dto - The data transfer object containing invoice details, including transaction and items
     * @param flag - Determine if we should update or not
     * @returns A Promise resolving to the created InvoiceDto
     */
    abstract create(dto: CreateInvoiceDto, flag: boolean): Promise<InvoiceDto>;

    /**
     *  Retrieves an invoice by its associated transaction reference
     * @param trxnReference - The unique transaction reference string
     * @returns A Promise resolving to the InvoiceDto, or throws NotFoundException if not found
     */
    abstract findByTransactionReference(trxnReference: string): Promise<InvoiceDto>;

    /** Retrieves a paginated list of invoices with optional filtering by transaction reference,
     * creation date range, expiration date range, transaction final state, and payment method
     * @param filter - Optional filter parameters including pagination (page, limit)
     * @returns A Promise resolving to an object containing an array of InvoiceDto and the total count
     * */
    abstract findInvoices(filter: FindInvoicesFilter): Promise<{ invoices: InvoiceDto[]; total: number }>;
}