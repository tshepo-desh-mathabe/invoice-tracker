import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Typography, Table, TableBody, TableRow, TableCell, TableHead } from '@mui/material'
import { getInvoices } from '../api/invoiceApi'
import type { components } from '../api/schema'
import type { FindInvoicesFilter } from '../api/invoiceApi'

type Invoice = components['schemas']['InvoiceDto']

export default function InvoiceDetail() {
    const { trxnReference } = useParams<{ trxnReference: string }>()
    const [invoice, setInvoice] = useState<Invoice | null>(null)

    useEffect(() => {
        if (trxnReference) {
            const filter: FindInvoicesFilter = { trxnReference }
            getInvoices(filter).then((response) => {
                if (response.invoices.length > 0) {
                    setInvoice(response.invoices[0])
                }
            }).catch((error) => {
                console.error('Error fetching invoice:', error)
            })
        }
    }, [trxnReference])

    if (!invoice) {
        return <Typography>Loading invoice details...</Typography>
    }

    return (
        <Box sx={{ mt: 3 }}>
            <Typography variant="h5">Invoice Detail: {invoice.trxnReference}</Typography>
            <Table sx={{ mt: 2 }}>
                <TableBody>
                    <TableRow>
                        <TableCell><strong>ID</strong></TableCell>
                        <TableCell>{invoice.id}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell><strong>Client</strong></TableCell>
                        <TableCell>{invoice.clientDto.fullName} ({invoice.clientDto.email})</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell><strong>Amount</strong></TableCell>
                        <TableCell>{invoice.amount}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell>{invoice.status}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell><strong>Reason</strong></TableCell>
                        <TableCell>{invoice.reason || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell><strong>Created At</strong></TableCell>
                        <TableCell>{new Date(invoice.createdAt).toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell><strong>Updated At</strong></TableCell>
                        <TableCell>{new Date(invoice.updatedAt).toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell><strong>Expires At</strong></TableCell>
                        <TableCell>{new Date(invoice.expiresAt).toLocaleString()}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <Typography variant="h6" sx={{ mt: 2 }}>Invoice Items</Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>SKU</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Unit Price</TableCell>
                        <TableCell>Total Price</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {invoice.itemsDto.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>{item.sku}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.description}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.unitPrice}</TableCell>
                            <TableCell>{item.totalPrice}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Box>
    )
}