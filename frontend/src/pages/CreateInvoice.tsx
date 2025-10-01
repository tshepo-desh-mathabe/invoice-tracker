import { useEffect, useState } from 'react';
import { Box, Button, TextField, Select, MenuItem, InputLabel, FormControl, Typography, Grid, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Table, TableBody, TableRow, TableCell, TableHead, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, Divider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getPaymentMethods } from '../api/paymentMethodApi';
import { getClients, postClient } from '../api/clientApi';
import { getBanks } from '../api/bankApi';
import { createInvoice, getInvoices } from '../api/invoiceApi';
import { getInvoiceItemsByName } from '../api/invoiceItemApi';
import type { components } from '../api/schema';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks';
import {
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
} from '../features/invoices/invoiceSlice';

type PaymentMethodDto = components['schemas']['PaymentMethodDto'];
type ClientDto = components['schemas']['ClientDto'];
type BankNameDto = components['schemas']['BankNameDto'];
type CreateInvoiceDto = components['schemas']['CreateInvoiceDto'];
type CreateInvoiceItemDto = components['schemas']['CreateInvoiceItemDto'];
type InvoiceItemDto = components['schemas']['InvoiceItemDto'];
type CreateClientDto = components['schemas']['CreateClientDto'];

const statusOptions: CreateInvoiceDto['status'][] = ['PENDING', 'PAID', 'FAILED'];

export default function CreateInvoice() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const {
        formData,
        items,
        paymentMethods,
        banks,
        searchedClients,
        newClient,
        clientSearchOpen,
        createClientOpen,
        searchFlag,
        searchTerm,
        existingItems,
        itemSearchOpen,
        itemSearchTerm,
    } = useAppSelector((state) => state.invoice);

    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const [errorMessages, setErrorMessages] = useState<string | string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const paymentMethodsData = await getPaymentMethods();
                dispatch(setPaymentMethods(paymentMethodsData));
                const banksData = await getBanks();
                dispatch(setBanks(banksData));
            } catch (error: any) {
                setErrorMessages('Failed to load payment methods or banks. Please try again.');
                setErrorDialogOpen(true);
            }
        };
        fetchData();
    }, [dispatch]);

    const validateField = (value: string | number | undefined) => value === '' || value === undefined || value === 0;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        dispatch(setFormData({ [name]: value }));
    };

    const handleTransactionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        dispatch(setTransactionData({ [name]: value }));
    };

    const handleItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const parsedValue = name === 'quantity' || name === 'unitPrice' ? parseFloat(value) || 0 : value;
        dispatch(updateItem({ index, field: name as keyof CreateInvoiceItemDto, value: parsedValue }));
        if (name === 'quantity' || name === 'unitPrice') {
            const item = items[index];
            const quantity = name === 'quantity' ? parsedValue : item.quantity;
            const unitPrice = name === 'unitPrice' ? parsedValue : item.unitPrice;
            const totalPrice = Number((quantity * unitPrice).toFixed(2));
            dispatch(updateItem({ index, field: 'totalPrice', value: totalPrice }));
        }
    };

    const handleSearchItems = async () => {
        if (!itemSearchTerm) {
            dispatch(setItems([...items, { sku: crypto.randomUUID(), name: '', description: '', quantity: 0, unitPrice: 0, totalPrice: 0 }]));
            return;
        }
        try {
            const results = await getInvoiceItemsByName(itemSearchTerm);
            dispatch(setExistingItems(results));
            dispatch(setItemSearchOpen(true));
        } catch (error: any) {
            setErrorMessages('Failed to search items. Please try again.');
            setErrorDialogOpen(true);
        }
    };

    const addItem = () => {
        handleSearchItems();
    };

    const selectExistingItem = (item: InvoiceItemDto) => {
        dispatch(setItems([...items, {
            sku: item.sku,
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice.toFixed(2)),
            totalPrice: Number((item.quantity * item.unitPrice).toFixed(2))
        }]));
        dispatch(setItemSearchOpen(false));
        dispatch(setItemSearchTerm(''));
        dispatch(setExistingItems([]));
    };

    const createNewItem = () => {
        dispatch(setItems([...items, { sku: crypto.randomUUID(), name: itemSearchTerm, description: '', quantity: 0, unitPrice: 0, totalPrice: 0 }]));
        dispatch(setItemSearchOpen(false));
        dispatch(setItemSearchTerm(''));
        dispatch(setExistingItems([]));
    };

    const removeItem = (index: number) => {
        dispatch(setItems(items.filter((_, i) => i !== index)));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (
            !formData.clientEmail ||
            !formData.status ||
            !formData.transactionDto.paymentMethod ||
            items.length === 0 ||
            items.some((item) =>
                validateField(item.sku) ||
                validateField(item.name) ||
                validateField(item.description) ||
                validateField(item.quantity) ||
                validateField(item.unitPrice) ||
                validateField(item.totalPrice)
            )
        ) {
            setErrorMessages('Please fill all required fields.');
            setErrorDialogOpen(true);
            return;
        }
        try {
            const totalAmount = Number(items.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2));
            const data: CreateInvoiceDto = {
                trxnReference: '',
                clientEmail: formData.clientEmail,
                amount: totalAmount,
                status: formData.status,
                reason: formData.reason,
                itemsDto: items.map(item => ({
                    sku: item.sku,
                    name: item.name,
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: Number(item.unitPrice.toFixed(2)),
                    totalPrice: Number(item.totalPrice.toFixed(2))
                })),
                transactionDto: {
                    trxnReference: '',
                    paymentMethod: formData.transactionDto.paymentMethod,
                    client: formData.clientEmail,
                    status: formData.status,
                    amount: totalAmount
                },
            };
            await createInvoice(data);
            await getInvoices(); // Fetch invoices with no filters
            navigate('/invoice');
        } catch (error: any) {
            const message = Array.isArray(error.message) ? error.message.join(', ') : error.message;
            setErrorMessages(message.includes('Bad Request') ? 'Failed to create invoice. Please check your input and try again.' : `Failed to create invoice: ${message}`);
            setErrorDialogOpen(true);
        }
    };

    const handleSearchClients = async () => {
        if (!searchTerm) {
            setErrorMessages('Please enter a search term.');
            setErrorDialogOpen(true);
            return;
        }
        try {
            const results = await getClients(searchTerm, searchFlag);
            dispatch(setSearchedClients(results));
        } catch (error: any) {
            setErrorMessages('Failed to search clients. Please try again.');
            setErrorDialogOpen(true);
        }
    };

    const selectClient = (client: ClientDto) => {
        dispatch(setFormData({ clientEmail: client.email }));
        dispatch(setTransactionData({ client: client.email }));
        dispatch(setClientSearchOpen(false));
        dispatch(setSearchTerm(''));
        dispatch(setSearchedClients([]));
    };

    const handleCreateClient = async () => {
        if (!newClient.fullName || !newClient.email || !newClient.phoneNumber || !newClient.accountNumber || !newClient.bankName) {
            setErrorMessages('Please fill all required client fields.');
            setErrorDialogOpen(true);
            return;
        }
        try {
            await postClient({ ...newClient, bankName: newClient.bankName || '' });
            dispatch(setFormData({ clientEmail: newClient.email }));
            dispatch(setTransactionData({ client: newClient.email }));
            dispatch(setCreateClientOpen(false));
            dispatch(setClientSearchOpen(false));
            dispatch(setNewClient({ fullName: '', email: '', phoneNumber: '', accountNumber: '', bankName: '' }));
        } catch (error: any) {
            setErrorMessages('Failed to create client. Please try again.');
            setErrorDialogOpen(true);
        }
    };

    const handleNewClientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string } }) => {
        const { name, value } = e.target;
        dispatch(setNewClient({ [name]: value }));
    };

    return (
        <Box sx={{ mt: 3, maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h5" gutterBottom>Create Invoice</Typography>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2} direction="column">
                    <Grid item xs={12}>
                        <TextField
                            id="client-email"
                            label="Client Email"
                            variant="standard"
                            value={formData.clientEmail}
                            error={!formData.clientEmail}
                            helperText={!formData.clientEmail ? 'Client email is required' : ''}
                            fullWidth
                            disabled
                        />
                        <Button variant="outlined" onClick={() => dispatch(setClientSearchOpen(true))} sx={{ mt: 1 }}>
                            Search/Create Client
                        </Button>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl variant="standard" fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                id="status"
                                value={formData.status}
                                onChange={(e) => dispatch(setFormData({ status: e.target.value as CreateInvoiceDto['status'] }))}
                                error={!formData.status}
                                required
                            >
                                {statusOptions.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            id="reason"
                            label="Reason"
                            variant="standard"
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl variant="standard" fullWidth>
                            <InputLabel>Payment Method</InputLabel>
                            <Select
                                id="payment-method"
                                value={formData.transactionDto.paymentMethod}
                                onChange={(e) => dispatch(setTransactionData({ paymentMethod: e.target.value as string }))}
                                error={!formData.transactionDto.paymentMethod}
                                required
                            >
                                {paymentMethods.map((method) => (
                                    <MenuItem key={method.id} value={method.name}>
                                        {method.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>Items</Typography>
                        <TextField
                            id="item-search"
                            label="Search Item Name"
                            variant="standard"
                            value={itemSearchTerm}
                            onChange={(e) => dispatch(setItemSearchTerm(e.target.value))}
                            fullWidth
                            sx={{ mb: 2 }}
                        />
                        <Button variant="outlined" onClick={addItem} startIcon={<AddIcon />}>
                            Add Item
                        </Button>
                        <List>
                            {items.map((item, index) => (
                                <Box key={index}>
                                    {index > 0 && <Divider sx={{ my: 2 }} />}
                                    <ListItem>
                                        <ListItemText>
                                            <Grid container spacing={2} direction="column">
                                                <Grid item xs={12}>
                                                    <TextField
                                                        id={`sku-${index}`}
                                                        label="SKU"
                                                        variant="standard"
                                                        name="sku"
                                                        value={item.sku}
                                                        onChange={(e) => handleItemChange(index, e)}
                                                        error={validateField(item.sku)}
                                                        helperText={validateField(item.sku) ? 'SKU is required' : ''}
                                                        fullWidth
                                                        required
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        id={`name-${index}`}
                                                        label="Name"
                                                        variant="standard"
                                                        name="name"
                                                        value={item.name}
                                                        onChange={(e) => handleItemChange(index, e)}
                                                        error={validateField(item.name)}
                                                        helperText={validateField(item.name) ? 'Name is required' : ''}
                                                        fullWidth
                                                        required
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        id={`description-${index}`}
                                                        label="Description"
                                                        variant="standard"
                                                        name="description"
                                                        value={item.description}
                                                        onChange={(e) => handleItemChange(index, e)}
                                                        error={validateField(item.description)}
                                                        helperText={validateField(item.description) ? 'Description is required' : ''}
                                                        fullWidth
                                                        required
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        id={`quantity-${index}`}
                                                        label="Quantity"
                                                        variant="standard"
                                                        name="quantity"
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemChange(index, e)}
                                                        error={validateField(item.quantity)}
                                                        helperText={validateField(item.quantity) ? 'Quantity is required' : ''}
                                                        fullWidth
                                                        required
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        id={`unit-price-${index}`}
                                                        label="Unit Price"
                                                        variant="standard"
                                                        name="unitPrice"
                                                        type="number"
                                                        value={item.unitPrice.toFixed(2)}
                                                        onChange={(e) => handleItemChange(index, e)}
                                                        error={validateField(item.unitPrice)}
                                                        helperText={validateField(item.unitPrice) ? 'Unit price is required' : ''}
                                                        fullWidth
                                                        required
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        id={`total-price-${index}`}
                                                        label="Total Price"
                                                        variant="standard"
                                                        value={item.totalPrice.toFixed(2)}
                                                        error={validateField(item.totalPrice)}
                                                        helperText={validateField(item.totalPrice) ? 'Total price is required' : ''}
                                                        fullWidth
                                                        disabled
                                                    />
                                                </Grid>
                                            </Grid>
                                        </ListItemText>
                                        <ListItemSecondaryAction>
                                            <IconButton onClick={() => removeItem(index)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                </Box>
                            ))}
                        </List>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            id="total-amount"
                            label="Total Amount"
                            variant="standard"
                            value={items.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}
                            fullWidth
                            disabled
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button variant="outlined" onClick={() => navigate(-1)} sx={{ minWidth: 100 }}>
                                Back
                            </Button>
                            <Button type="submit" variant="contained" color="primary" sx={{ minWidth: 100 }}>
                                Create
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </form>

            <Dialog open={clientSearchOpen} onClose={() => dispatch(setClientSearchOpen(false))}>
                <DialogTitle>Search Client</DialogTitle>
                <DialogContent>
                    <FormControl variant="standard" fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Search By</InputLabel>
                        <Select
                            id="search-by"
                            value={searchFlag}
                            onChange={(e) => dispatch(setSearchFlag(e.target.value as 'EMAIL' | 'PHONE_NUMBER'))}
                        >
                            <MenuItem value="EMAIL">Email</MenuItem>
                            <MenuItem value="PHONE_NUMBER">Phone Number</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        id="search-term"
                        label="Search Term"
                        variant="standard"
                        value={searchTerm}
                        onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                        error={!searchTerm}
                        helperText={!searchTerm ? 'Search term is required' : ''}
                        fullWidth
                        sx={{ mt: 2 }}
                    />
                    <Button variant="contained" onClick={handleSearchClients} sx={{ mt: 2 }}>
                        Search
                    </Button>
                    {searchedClients.length > 0 ? (
                        <Table sx={{ mt: 2 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Full Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Phone Number</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {searchedClients.map((client) => (
                                    <TableRow key={client.id}>
                                        <TableCell>{client.fullName}</TableCell>
                                        <TableCell>{client.email}</TableCell>
                                        <TableCell>{client.phoneNumber}</TableCell>
                                        <TableCell>
                                            <Button onClick={() => selectClient(client)}>Select</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <Typography sx={{ mt: 2 }}>
                            No clients found. <Button onClick={() => dispatch(setCreateClientOpen(true))}>Create New</Button>
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => dispatch(setClientSearchOpen(false))}>Close</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={createClientOpen} onClose={() => dispatch(setCreateClientOpen(false))}>
                <DialogTitle>Create Client</DialogTitle>
                <DialogContent>
                    <TextField
                        id="full-name"
                        label="Full Name"
                        variant="standard"
                        name="fullName"
                        value={newClient.fullName}
                        onChange={handleNewClientChange}
                        error={!newClient.fullName}
                        helperText={!newClient.fullName ? 'Full name is required' : ''}
                        fullWidth
                        sx={{ mt: 2 }}
                        required
                    />
                    <TextField
                        id="email"
                        label="Email"
                        variant="standard"
                        name="email"
                        value={newClient.email}
                        onChange={handleNewClientChange}
                        error={!newClient.email}
                        helperText={!newClient.email ? 'Email is required' : ''}
                        fullWidth
                        sx={{ mt: 2 }}
                        required
                    />
                    <TextField
                        id="phone-number"
                        label="Phone Number"
                        variant="standard"
                        name="phoneNumber"
                        value={newClient.phoneNumber}
                        onChange={handleNewClientChange}
                        error={!newClient.phoneNumber}
                        helperText={!newClient.phoneNumber ? 'Phone number is required' : ''}
                        fullWidth
                        sx={{ mt: 2 }}
                        required
                    />
                    <TextField
                        id="account-number"
                        label="Account Number"
                        variant="standard"
                        name="accountNumber"
                        value={newClient.accountNumber}
                        onChange={handleNewClientChange}
                        error={!newClient.accountNumber}
                        helperText={!newClient.accountNumber ? 'Account number is required' : ''}
                        fullWidth
                        sx={{ mt: 2 }}
                        required
                    />
                    <FormControl variant="standard" fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Bank</InputLabel>
                        <Select
                            id="bank-name"
                            value={newClient.bankName || ''}
                            onChange={(e) => handleNewClientChange({ target: { name: 'bankName', value: e.target.value } })}
                            error={!newClient.bankName}
                            required
                        >
                            {banks.map((bank) => (
                                <MenuItem key={bank.id} value={bank.name}>
                                    {bank.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCreateClient}>Create</Button>
                    <Button onClick={() => dispatch(setCreateClientOpen(false))}>Cancel</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={itemSearchOpen} onClose={() => dispatch(setItemSearchOpen(false))}>
                <DialogTitle>Existing Items</DialogTitle>
                <DialogContent>
                    {existingItems.length > 0 ? (
                        <Table sx={{ mt: 2 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>SKU</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {existingItems.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>{item.description}</TableCell>
                                        <TableCell>{item.sku}</TableCell>
                                        <TableCell>
                                            <Button onClick={() => selectExistingItem(item)}>Select</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <Typography sx={{ mt: 2 }}>
                            No items found. <Button onClick={createNewItem}>Create New</Button>
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => dispatch(setItemSearchOpen(false))}>Cancel</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={errorDialogOpen} onClose={() => setErrorDialogOpen(false)}>
                <DialogTitle>Error</DialogTitle>
                <DialogContent>
                    {Array.isArray(errorMessages) ? (
                        errorMessages.map((msg, index) => (
                            <DialogContentText key={index}>{msg}</DialogContentText>
                        ))
                    ) : (
                        <DialogContentText>{errorMessages}</DialogContentText>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setErrorDialogOpen(false)} variant="contained" color="primary">
                        Okay
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}