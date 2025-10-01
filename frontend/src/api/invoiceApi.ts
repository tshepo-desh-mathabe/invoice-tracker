import http from './http';
import type { components } from './schema';

// Type aliases for clarity
type CreateInvoiceBody = components['schemas']['CreateInvoiceDto'];
type InvoiceListResponse = { invoices: components['schemas']['InvoiceDto'][]; total: number };

// Filter interface for invoice queries
export interface FindInvoicesFilter {
    trxnReference?: string;
    untilCreateAt?: Date;
    untilExpireAt?: Date;
    isFinalState?: boolean;
    paymentMethod?: string;
    page?: number;
    limit?: number;
}

// Create a new invoice
export async function createInvoice(data: CreateInvoiceBody, flag: boolean = false): Promise<components['schemas']['InvoiceDto']> {
    return http<'/api/invoice', 'post'>(`/api/invoice?flag=&${flag}`, {
        method: 'post',
        body: data,
    });
}

// Fetch invoices with optional filters and pagination
export async function getInvoices(filter: FindInvoicesFilter = {}): Promise<InvoiceListResponse> {
    const params: Record<string, string> = {};
    if (filter.trxnReference) params.trxnReference = filter.trxnReference;
    if (filter.untilCreateAt) params.untilCreateAt = filter.untilCreateAt.toISOString();
    if (filter.untilExpireAt) params.untilExpireAt = filter.untilExpireAt.toISOString();
    if (filter.isFinalState !== undefined) params.isFinalState = filter.isFinalState.toString();
    if (filter.paymentMethod) params.paymentMethod = filter.paymentMethod;
    if (filter.page !== undefined) params.page = filter.page.toString();
    if (filter.limit !== undefined) params.limit = filter.limit.toString();

    return http<'/api/invoice', 'get'>('/api/invoice', {
        method: 'get',
        params,
    });
}