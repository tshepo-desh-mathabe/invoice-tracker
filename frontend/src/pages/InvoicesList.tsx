import { useEffect, useState } from 'react';
import { Box, Button, TextField, Select, MenuItem, InputLabel, FormControl, Typography, Grid, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Table, TableBody, TableRow, TableCell, TableHead, TablePagination, Checkbox, FormControlLabel } from '@mui/material';
import { createInvoice, getInvoices, type FindInvoicesFilter } from '../api/invoiceApi';
import { getPaymentMethods } from '../api/paymentMethodApi';
import type { components } from '../api/schema';
import { useNavigate } from 'react-router-dom';

type InvoiceDto = {
  amount: string | number;
  status: string;
  reason: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  transaction: {
    trxnReference: string;
    amount: string | number;
    status: string;
    isFinalState: boolean;
    createdAt: string;
    updatedAt: string;
    expiresAt: string;
    paymentMethod: string;
  };
  client: {
    fullName: string;
    email: string;
    phoneNumber: string;
    bankingDetails?: { bankName: string };
  };
  items: {
    sku: string;
    name: string;
    description: string;
    quantity: number;
    unitPrice: string | number;
    totalPrice: string | number;
  }[];
};

type PaymentMethodDto = components['schemas']['PaymentMethodDto'];

export default function InvoiceList() {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState<InvoiceDto[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [filter, setFilter] = useState<FindInvoicesFilter>({
        page: 0,
        limit: 10,
        untilExpireAt: new Date(),
    });
    const [sortBy, setSortBy] = useState<'createdAt' | 'expiresAt'>('expiresAt');
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDto[]>([]);
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const [errorMessages, setErrorMessages] = useState<string | string[]>([]);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDto | null>(null);
    const [editedStatus, setEditedStatus] = useState<string>('');
    const [editedPaymentMethod, setEditedPaymentMethod] = useState<string>('');
    const [amountDialogOpen, setAmountDialogOpen] = useState(false);
    const [amountToPay, setAmountToPay] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const paymentMethodsData = await getPaymentMethods();
                setPaymentMethods(paymentMethodsData);
                const invoiceData = await getInvoices(filter);
                const sortedInvoices = [...invoiceData.invoices].sort((a, b) => {
                    const dateA = new Date(sortBy === 'createdAt' ? a.createdAt : a.expiresAt);
                    const dateB = new Date(sortBy === 'createdAt' ? b.createdAt : b.expiresAt);
                    return dateB.getTime() - dateA.getTime();
                });
                setInvoices(sortedInvoices);
                setTotal(invoiceData.total);
            } catch (error: any) {
                const message = Array.isArray(error.message) ? error.message.join(', ') : error.message;
                setErrorMessages(message.includes('Bad Request') ? 'Failed to load invoices. Please check your filters and try again.' : `Failed to load invoices: ${message}`);
                setErrorDialogOpen(true);
            }
        };
        fetchData();
    }, [filter, sortBy]);

    const handleFilterChange = (name: keyof FindInvoicesFilter, value: any) => {
        setFilter((prev) => ({ ...prev, [name]: value, page: 0 }));
    };

    const handleDateChange = (name: keyof FindInvoicesFilter, value: Date | null) => {
        setFilter((prev) => ({
            ...prev,
            [name]: value || undefined,
            page: 0,
        }));
    };

    const handlePageChange = (_event: unknown, newPage: number) => {
        setFilter((prev) => ({ ...prev, page: newPage }));
    };

    const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilter((prev) => ({ ...prev, limit: parseInt(event.target.value), page: 0 }));
    };

    const handleViewDetails = (invoice: InvoiceDto) => {
        setSelectedInvoice(invoice);
        setEditedStatus(invoice.status);
        setEditedPaymentMethod(invoice.transaction.paymentMethod);
        setDetailsDialogOpen(true);
    };

    const handleClearFilters = () => {
        setFilter({ page: 0, limit: 10, untilExpireAt: new Date() });
        setSortBy('expiresAt');
    };

    const handleCreateInvoice = () => {
        navigate('/create-invoice');
    };

    const handleSaveChanges = async () => {
        if (selectedInvoice && (editedStatus !== selectedInvoice.status || editedPaymentMethod !== selectedInvoice.transaction.paymentMethod)) {
            setAmountDialogOpen(true);
        } else {
            setDetailsDialogOpen(false);
        }
    };

    const handleAmountSubmit = async () => {
        if (!selectedInvoice) return;
        try {
            let updatedAmount = typeof selectedInvoice.amount === 'string' ? parseFloat(selectedInvoice.amount) : selectedInvoice.amount;
            if (editedPaymentMethod === 'CREDIT' && amountToPay) {
                const amount = parseFloat(amountToPay);
                if (!isNaN(amount) && amount >= 0) {
                    updatedAmount = updatedAmount - amount;
                }
            }

            
            const dataToBeSent = {
                trxnReference: selectedInvoice.transaction.trxnReference,
                clientEmail: selectedInvoice.client.email,
                amount: updatedAmount,
                status: editedStatus,
                reason: selectedInvoice.reason,
                itemsDto: selectedInvoice.items.map((item) => ({
                    sku: item.sku,
                    name: item.name,
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) : item.unitPrice,
                    totalPrice: typeof item.totalPrice === 'string' ? parseFloat(item.totalPrice) : item.totalPrice,
                })),
                transactionDto: {
                    trxnReference: selectedInvoice.transaction.trxnReference,
                    client: selectedInvoice.client.email,
                    amount: updatedAmount,
                    paymentMethod: 'EFT',
                    status: editedStatus,
                },
            }
            const updatedInvoice = await createInvoice(dataToBeSent,);
            setInvoices((prev) =>
                prev.map((inv) =>
                    inv.transaction.trxnReference === updatedInvoice.transaction.trxnReference ? updatedInvoice : inv
                )
            );
            setAmountDialogOpen(false);
            setDetailsDialogOpen(false);
            setAmountToPay('');
        } catch (error: any) {
            const message = Array.isArray(error.message) ? error.message.join(', ') : error.message;
            setErrorMessages(`Failed to update invoice: ${message}`);
            setErrorDialogOpen(true);
        }
    };

    const  handleDownloadPDF = () => {
        console.log('----', invoices);
        
        if (!invoices || invoices.length === 0) {
            alert("No invoices available to download.");
            return;
        }

        // Build a simple HTML table string
        const html = `
            <html>
              <head>
                <title>Invoices</title>
                <style>
                  body { font-family: Arial, sans-serif; padding: 20px; }
                  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                  th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                  th { background-color: #f4f4f4; }
                </style>
              </head>
              <body>
                <h2>Invoice Report</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Trxn Reference</th>
                      <th>Client Email</th>
                      <th>Client Phone Number</th>
                      <th>Trxn Amount</th>
                      <th>Status</th>
                      <th>Trxn Create</th>
                      <th>Trxn Expires</th>
                      <th>Trxn In Final State</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${invoices.map((inv: any) => `
                      <tr>
                        <td>${inv.transaction.trxnReference}</td>
                        <td>${inv.client.email}</td>
                        <td>${inv.client.phoneNumber}</td>
                        <td>${(typeof inv.amount === "string" ? parseFloat(inv.amount) : inv.amount).toFixed(2)}</td>
                        <td>${inv.status}</td>
                        <td>${inv.transaction.createdAt}</td>
                        <td>${inv.transaction.expiresAt}</td>
                        <td>${inv.transaction.isFinalState}</td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              </body>
            </html>
        `;

        // Open new window and trigger print-to-PDF
        const win = window.open("", "_blank");
        if (win) {
            win.document.write(html);
            win.document.close();
            win.print();
        }
    };

    return (
        <Box sx={{ mt: 3, maxWidth: 1200, mx: 'auto' }}>
            <Typography variant="h5" gutterBottom>Invoices</Typography>
            <Box sx={{ mb: 3 }}>
                <Button variant="contained" onClick={handleCreateInvoice} sx={{ mr: 2, mb: 2 }}>
                    Create Invoice
                </Button>
                <Button variant="contained" onClick={handleDownloadPDF} sx={{ mb: 2 }}>
                    Download PDF
                </Button>
                <Typography variant="h6" gutterBottom>Filter Invoices</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            label="Transaction Reference"
                            variant="outlined"
                            value={filter.trxnReference || ''}
                            onChange={(e) => handleFilterChange('trxnReference', e.target.value)}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={filter.isFinalState || false}
                                    onChange={(e) => handleFilterChange('isFinalState', e.target.checked)}
                                />
                            }
                            label="Final State"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel>Sort By</InputLabel>
                            <Select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'createdAt' | 'expiresAt')}
                                label="Sort By"
                            >
                                <MenuItem value="createdAt">Latest Created</MenuItem>
                                <MenuItem value="expiresAt">Latest Expired</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <Button variant="outlined" onClick={handleClearFilters}>
                            Clear Filters
                        </Button>
                    </Grid>
                </Grid>
            </Box>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Transaction Reference</TableCell>
                        <TableCell>Client Email</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Created At</TableCell>
                        <TableCell>Expires At</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {invoices.map((invoice) => (
                        <TableRow key={invoice.transaction.trxnReference}>
                            <TableCell>{invoice.transaction.trxnReference}</TableCell>
                            <TableCell>{invoice.client.email}</TableCell>
                            <TableCell>{(typeof invoice.amount === 'string' ? parseFloat(invoice.amount) : invoice.amount).toFixed(2)}</TableCell>
                            <TableCell>{invoice.status}</TableCell>
                            <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>{new Date(invoice.expiresAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                                <Button variant="contained" onClick={() => handleViewDetails(invoice)}>
                                    View Details
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={total}
                rowsPerPage={filter.limit || 10}
                page={filter.page || 0}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
            />
            <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Invoice Details</DialogTitle>
                <br/>
                <DialogContent>
                    {selectedInvoice && (
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Client Full Name"
                                    value={selectedInvoice.client.fullName}
                                    fullWidth
                                    InputProps={{ readOnly: true }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Client Email"
                                    value={selectedInvoice.client.email}
                                    fullWidth
                                    InputProps={{ readOnly: true }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Client Phone Number"
                                    value={selectedInvoice.client.phoneNumber || ''}
                                    fullWidth
                                    InputProps={{ readOnly: true }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Invoice Expiry"
                                    value={new Date(selectedInvoice.expiresAt).toLocaleString()}
                                    fullWidth
                                    InputProps={{ readOnly: true }}
                                    variant="outlined"
                                />
                            </Grid>
                    
                            <Grid item xs={12}>
                                <TextField
                                    label="Amount"
                                    value={(typeof selectedInvoice.amount === 'string' ? parseFloat(selectedInvoice.amount) : selectedInvoice.amount).toFixed(2)}
                                    fullWidth
                                    InputProps={{ readOnly: true }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Reason"
                                    value={selectedInvoice.reason || ''}
                                    fullWidth
                                    InputProps={{ readOnly: true }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Created At"
                                    value={new Date(selectedInvoice.createdAt).toLocaleString()}
                                    fullWidth
                                    InputProps={{ readOnly: true }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Updated At"
                                    value={new Date(selectedInvoice.updatedAt).toLocaleString()}
                                    fullWidth
                                    InputProps={{ readOnly: true }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Transaction Reference"
                                    value={selectedInvoice.transaction.trxnReference}
                                    fullWidth
                                    InputProps={{ readOnly: true }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Final State"
                                    value={selectedInvoice.transaction.isFinalState ? 'Yes' : 'No'}
                                    fullWidth
                                    InputProps={{ readOnly: true }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={editedStatus}
                                        onChange={(e) => setEditedStatus(e.target.value)}
                                        label="Status"
                                    >
                                        <MenuItem value="PENDING">PENDING</MenuItem>
                                        <MenuItem value="PAID">PAID</MenuItem>
                                        <MenuItem value="FAILED">FAILED</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel>Transaction Type</InputLabel>
                                    <Select
                                        value={editedPaymentMethod}
                                        onChange={(e) => setEditedPaymentMethod(e.target.value)}
                                        label="Transaction Type"
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
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>SKU</TableCell>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Description</TableCell>
                                            <TableCell>Total Price</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {selectedInvoice.items.map((item) => (
                                            <TableRow key={item.sku}>
                                                <TableCell>{item.sku}</TableCell>
                                                <TableCell>{item.name}</TableCell>
                                                <TableCell>{item.description}</TableCell>
                                                <TableCell>
                                                    {(typeof item.totalPrice === 'string' ? parseFloat(item.totalPrice) : item.totalPrice).toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Total Price"
                                    value={selectedInvoice.items
                                        .reduce(
                                            (sum, item) =>
                                                sum + (typeof item.totalPrice === 'string' ? parseFloat(item.totalPrice) : item.totalPrice),
                                            0
                                        )
                                        .toFixed(2)}
                                    fullWidth
                                    InputProps={{ readOnly: true }}
                                    variant="outlined"
                                />
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
                    <Button onClick={handleSaveChanges} variant="contained" color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={amountDialogOpen} onClose={() => setAmountDialogOpen(false)}>
                <DialogTitle>Enter Amount to Pay</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Amount to Pay"
                        type="number"
                        value={amountToPay}
                        onChange={(e) => setAmountToPay(e.target.value)}
                        fullWidth
                        variant="outlined"
                        inputProps={{ min: 0 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAmountDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAmountSubmit} variant="contained" color="primary">
                        Submit
                    </Button>
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