import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { getInvoices } from '../../api/invoiceApi';
import type { components } from '../../api/schema';
import type { InvoiceFilter } from '../../api/invoiceApi';

type PaymentMethodDto = components['schemas']['PaymentMethodDto'];
type ClientDto = components['schemas']['ClientDto'];
type BankNameDto = components['schemas']['BankNameDto'];
type CreateInvoiceDto = components['schemas']['CreateInvoiceDto'];
type CreateTransactionDto = components['schemas']['CreateTransactionDto'];
type CreateInvoiceItemDto = components['schemas']['CreateInvoiceItemDto'];
type CreateClientDto = components['schemas']['CreateClientDto'];
type InvoiceItemDto = components['schemas']['InvoiceItemDto'];
type InvoiceDto = components['schemas']['InvoiceDto'];

interface InvoiceState {
  formData: CreateInvoiceDto;
  items: CreateInvoiceItemDto[];
  paymentMethods: PaymentMethodDto[];
  banks: BankNameDto[];
  searchedClients: ClientDto[];
  newClient: CreateClientDto & { bankName?: string };
  clientSearchOpen: boolean;
  createClientOpen: boolean;
  searchFlag: 'EMAIL' | 'PHONE_NUMBER';
  searchTerm: string;
  existingItems: InvoiceItemDto[];
  itemSearchOpen: boolean;
  itemSearchTerm: string;
  invoices: InvoiceDto[];
  total: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  sortBy: keyof InvoiceDto | 'clientName';
  sortOrder: 'asc' | 'desc';
}

const initialState: InvoiceState = {
  formData: {
    clientEmail: '',
    amount: 0,
    status: 'PENDING',
    reason: '',
    itemsDto: [],
    transactionDto: {
      trxnReference: '',
      client: '',
      amount: 0,
      paymentMethod: '',
      status: 'PENDING',
      updatedAt: new Date().toISOString(),
      expiresAt: new Date().toISOString(),
    },
  },
  items: [],
  paymentMethods: [],
  banks: [],
  searchedClients: [],
  newClient: {
    fullName: '',
    email: '',
    phoneNumber: '',
    accountNumber: '',
    bankName: '',
  },
  clientSearchOpen: false,
  createClientOpen: false,
  searchFlag: 'EMAIL',
  searchTerm: '',
  existingItems: [],
  itemSearchOpen: false,
  itemSearchTerm: '',
  invoices: [],
  total: 0,
  status: 'idle',
  error: null,
  sortBy: 'id',
  sortOrder: 'asc',
};

export const fetchInvoices = createAsyncThunk(
  'invoice/fetchInvoices',
  async (filter: InvoiceFilter, { rejectWithValue }) => {
    try {
      const response = await getInvoices(filter);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch invoices');
    }
  }
);

const invoiceSlice = createSlice({
  name: 'invoice',
  initialState,
  reducers: {
    setFormData: (state, action: PayloadAction<Partial<CreateInvoiceDto>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    setTransactionData: (state, action: PayloadAction<Partial<CreateTransactionDto>>) => {
      state.formData.transactionDto = { ...state.formData.transactionDto, ...action.payload };
    },
    setItems: (state, action: PayloadAction<CreateInvoiceItemDto[]>) => {
      state.items = action.payload;
      const totalAmount = action.payload.reduce((sum, item) => sum + item.totalPrice, 0);
      state.formData.amount = totalAmount;
      state.formData.transactionDto.amount = totalAmount;
    },
    updateItem: (
      state,
      action: PayloadAction<{ index: number; field: keyof CreateInvoiceItemDto; value: string | number }>,
    ) => {
      const { index, field, value } = action.payload;
      state.items[index] = { ...state.items[index], [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        state.items[index].totalPrice = state.items[index].quantity * state.items[index].unitPrice;
      }
      const totalAmount = state.items.reduce((sum, item) => sum + item.totalPrice, 0);
      state.formData.amount = totalAmount;
      state.formData.transactionDto.amount = totalAmount;
    },
    setPaymentMethods: (state, action: PayloadAction<PaymentMethodDto[]>) => {
      state.paymentMethods = action.payload;
    },
    setBanks: (state, action: PayloadAction<BankNameDto[]>) => {
      state.banks = action.payload;
    },
    setSearchedClients: (state, action: PayloadAction<ClientDto[]>) => {
      state.searchedClients = action.payload;
    },
    setNewClient: (state, action: PayloadAction<Partial<CreateClientDto & { bankName?: string }>>) => {
      state.newClient = { ...state.newClient, ...action.payload };
    },
    setClientSearchOpen: (state, action: PayloadAction<boolean>) => {
      state.clientSearchOpen = action.payload;
    },
    setCreateClientOpen: (state, action: PayloadAction<boolean>) => {
      state.createClientOpen = action.payload;
    },
    setSearchFlag: (state, action: PayloadAction<'EMAIL' | 'PHONE_NUMBER'>) => {
      state.searchFlag = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setExistingItems: (state, action: PayloadAction<InvoiceItemDto[]>) => {
      state.existingItems = action.payload;
    },
    setItemSearchOpen: (state, action: PayloadAction<boolean>) => {
      state.itemSearchOpen = action.payload;
    },
    setItemSearchTerm: (state, action: PayloadAction<string>) => {
      state.itemSearchTerm = action.payload;
    },
    setSort: (state, action: PayloadAction<{ sortBy: keyof InvoiceDto | 'clientName'; sortOrder: 'asc' | 'desc' }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action: PayloadAction<{ content: InvoiceDto[]; total: number }>) => {
        state.status = 'succeeded';
        state.invoices = action.payload.content;
        state.total = action.payload.total;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const {
  setFormData,
  setTransactionData,
  setItems,
  updateItem,
  setPaymentMethods,
  setBanks,
  setSearchedClients,
  setNewClient,
  setClientSearchOpen,
  setCreateClientOpen,
  setSearchFlag,
  setSearchTerm,
  setExistingItems,
  setItemSearchOpen,
  setItemSearchTerm,
  setSort,
} = invoiceSlice.actions;

export const selectInvoices = (state: { invoice: InvoiceState }) => state.invoice.invoices;
export const selectTotal = (state: { invoice: InvoiceState }) => state.invoice.total;
export const selectStatus = (state: { invoice: InvoiceState }) => state.invoice.status;
export const selectSortBy = (state: { invoice: InvoiceState }) => state.invoice.sortBy;
export const selectSortOrder = (state: { invoice: InvoiceState }) => state.invoice.sortOrder;

export default invoiceSlice.reducer;