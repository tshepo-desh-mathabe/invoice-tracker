import { Routes, Route } from 'react-router-dom'
import { Container } from '@mui/material'
import InvoicesList from './pages/InvoicesList'
import InvoiceDetail from './pages/InvoiceDetail'
import CreateInvoice from './pages/CreateInvoice'
// import CreateInvoice from './components/InvoiceForm'

function App() {
  return (
    <Container maxWidth="lg">
      <Routes>
        <Route path="/" element={<InvoicesList />} />
        <Route path="/invoice" element={<InvoicesList />} />
        <Route path="/invoice/:trxnReference" element={<InvoiceDetail />} />
        <Route path="/create-invoice" element={<CreateInvoice />} />
      </Routes>
    </Container>
  )
}

export default App