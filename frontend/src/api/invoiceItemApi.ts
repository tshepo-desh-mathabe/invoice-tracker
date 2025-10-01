import http from './http';
import type { components } from './schema';

type CreateInvoiceItemDto = components['schemas']['CreateInvoiceItemDto'];
type InvoiceItemDto = components['schemas']['InvoiceItemDto'];


export async function createInvoiceItem(dto: CreateInvoiceItemDto): Promise<void> {
    return http<'/api/invoice-item', 'post'>('/api/invoice-item', {
        method: 'post',
        body: dto,
    });
}

export async function getInvoiceItemsByName(name: string): Promise<InvoiceItemDto[]> {
    return http<'/api/invoice-item/name/{name}', 'get'>(`/api/invoice-item/name/${name}` as '/api/invoice-item/name/{name}', {
        method: 'get',
    });

    
}