import http from './http';
import type { components } from './schema';

type ClientDto = components['schemas']['ClientDto'];
type CreateClientDto = components['schemas']['CreateClientDto'];

export async function getClients(term: string, flag: 'EMAIL' | 'PHONE_NUMBER'): Promise<ClientDto[]> {
  return http<'/api/client', 'get'>(`/api/client?term=${term}&flag=${flag}`, {
    method: 'get',
  });
}

export async function postClient(dto: CreateClientDto): Promise<void> {
  return http<'/api/client', 'post' >('/api/client', {
    method: 'post',
    body: dto,
  });
}
