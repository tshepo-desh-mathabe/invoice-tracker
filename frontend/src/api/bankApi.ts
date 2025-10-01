import http from './http';
import type { components } from './schema';

type BankNameDto = components['schemas']['BankNameDto'];
type CreateBankingDetailsDto = components['schemas']['CreateBankingDetailsDto'];

export async function postBanking(dto: CreateBankingDetailsDto): Promise<string> {
    return http<'/api/banking-details', 'post'>('/api/banking-details', {
        method: 'post',
        body: dto,
    });
}

export async function getBanks(): Promise<BankNameDto[]> {
    return http<'/api/banks', 'get'>('/api/banks', {
        method: 'get',
    });
}

export async function searchBanks(name: string): Promise<BankNameDto[]> {
    return http<'/api/banks/search/{name}', 'get'>(`/api/banks/search/${name}` as '/api/banks/search/{name}', {
        method: 'get',
    });
}