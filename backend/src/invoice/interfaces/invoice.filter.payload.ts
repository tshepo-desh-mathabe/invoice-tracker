export interface FindInvoicesFilter {
  trxnReference?: string;
  untilExpireAt?: Date;
  isFinalState?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'expiresAt';
}