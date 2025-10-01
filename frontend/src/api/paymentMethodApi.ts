import http from './http';
import type { components } from './schema';

type PaymentMethodDto = components['schemas']['PaymentMethodDto'];

export async function getPaymentMethods(): Promise<PaymentMethodDto[]> {
    return http<'/api/payment-method', 'get'>('/api/payment-method', {
        method: 'get'
    });
}