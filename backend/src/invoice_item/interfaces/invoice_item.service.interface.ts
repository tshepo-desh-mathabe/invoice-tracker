import { CreateInvoiceItemDto, InvoiceItemDto } from "../dto/create-invoice_item.dto";
import { InvoiceItem } from "../entities/invoice_item.entity";

/**
 * Service interface for managing invoice items.
 * Defines contract methods for creating and retrieving invoice items.
 */
export abstract class IInvoiceItemService {

    /**
     * Creates and saves a new invoice item.
     * 
     * @param dto - Data transfer object containing item details.
     * @returns A success message once the item is saved.
     */
    abstract create(dto: CreateInvoiceItemDto): Promise<{ message: string }>;

    /**
     * Creates and saves multiple invoice items in bulk.
     * 
     * @param dtos - Array of data transfer objects containing item details.
     * @returns All saved invoice item entities.
     */
    abstract createBulk(dtos: CreateInvoiceItemDto[]): Promise<InvoiceItem[]>;

    /**
     * Finds an invoice item by its unique SKU.
     * 
     * @param sku - The SKU of the invoice item to retrieve.
     * @returns The invoice item entity if found.
     * @throws NotFoundException if no item exists with the given SKU.
     */
    abstract findBySku(sku: string): Promise<InvoiceItem>;

    /**
     * Finds invoice items by name using a case-insensitive SQL LIKE search.
     * The database ID is excluded from the returned DTOs.
     * 
     * @param name - Partial or full name to search for.
     * @returns A list of matching invoice item DTOs without database IDs.
     * @throws NotFoundException if no matching items are found.
     */
    abstract findByName(name: string): Promise<InvoiceItemDto[]>;
}
