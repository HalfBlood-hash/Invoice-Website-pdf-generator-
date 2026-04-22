import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import InvoiceDetailsPanel from '../component/InvoiceDetailsPanel.jsx'
import { addPayment, fetchInvoiceById } from '../feature/invoiceSlice.js'
import { generateInvoicePdf } from '../utils/generateInvoicePdf.js'
import { generatePaymentReceiptPdf } from '../utils/generatePaymentReceiptPdf.js'

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

const createDefaultPaymentForm = () => ({
  amountPaid: '',
  paymentMode: 'Cash',
  paymentDate: new Date().toISOString().slice(0, 10)
})

const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0)

function InvoiceDetailsContent({ invoiceId }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const {
    currentInvoice,
    currentInvoicePending,
    currentInvoiceError,
    paymentPending,
    paymentError,
    paymentInvoiceId
  } = useSelector((state) => state.invoice)

  const [paymentForm, setPaymentForm] = useState(createDefaultPaymentForm())

  useEffect(() => {
    if (invoiceId) {
      dispatch(fetchInvoiceById(invoiceId))
    }
  }, [dispatch, invoiceId])

  const invoice = currentInvoice?._id === invoiceId ? currentInvoice : null

  const handlePaymentFieldChange = (_, field, value) => {
    setPaymentForm((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDownloadInvoice = async (invoiceToDownload) => {
    const items = [
      {
        desc: invoiceToDownload.items || 'Item',
        qty: invoiceToDownload.quantity || 1,
        price: invoiceToDownload.price || 0,
        unit: invoiceToDownload.units || ''
      }
    ]

    await generateInvoicePdf({
      customerName: invoiceToDownload.customerName,
      invoiceNumber: invoiceToDownload.invoiceNumber,
      invoiceDate: invoiceToDownload.invoiceDate
        ? new Date(invoiceToDownload.invoiceDate).toISOString().slice(0, 10)
        : '',
      items,
      fileName: `Invoice-${invoiceToDownload.invoiceNumber || 'unknown'}.pdf`
    })
  }

  const handleDownloadReceipt = async (payment) => {
    if (!invoice) {
      toast.error('Invoice details are not available yet.')
      return
    }

    await generatePaymentReceiptPdf({
      invoice,
      payment
    })
  }

  const handleAddPayment = async (event, invoiceToUpdate) => {
    event.preventDefault()

    if (!paymentForm.amountPaid) {
      toast.error('Enter a payment amount first.')
      return
    }

    try {
      const paymentSummary = await dispatch(
        addPayment({
          invoiceId: invoiceToUpdate._id,
          amountPaid: Number(paymentForm.amountPaid),
          paymentDate: paymentForm.paymentDate,
          paymentMode: paymentForm.paymentMode
        })
      ).unwrap()

      setPaymentForm(createDefaultPaymentForm())

      try {
        await generatePaymentReceiptPdf({
          invoice: paymentSummary.invoice,
          payment: paymentSummary.payment
        })
      } catch (receiptError) {
        console.error('Payment receipt generation failed:', receiptError)
        toast.error('Payment saved, but receipt PDF could not be generated.')
        return
      }

      toast.success(
        `Payment saved. Paid ${formatCurrency(paymentSummary.paid)} and due ${formatCurrency(paymentSummary.due)}.`
      )
    } catch (error) {
      toast.error(error || 'Failed to add payment.')
    }
  }

  if (currentInvoicePending && !invoice) {
    return (
      <div className="min-h-screen bg-gray-100 px-4 py-10">
        <div className="mx-auto max-w-6xl rounded-3xl bg-white p-8 text-center shadow-xl">
          <div className="text-lg font-semibold text-slate-800">Loading invoice details...</div>
        </div>
      </div>
    )
  }

  if (currentInvoiceError && !invoice) {
    return (
      <div className="min-h-screen bg-gray-100 px-4 py-10">
        <div className="mx-auto max-w-6xl rounded-3xl bg-white p-8 shadow-xl">
          <button
            type="button"
            onClick={() => navigate('/history')}
            className="mb-4 rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
          >
            Back To History
          </button>
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
            {currentInvoiceError}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-4">
        {paymentError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {paymentError}
          </div>
        ) : null}

        <InvoiceDetailsPanel
          invoice={invoice}
          paymentForm={paymentForm}
          onPaymentFieldChange={handlePaymentFieldChange}
          onAddPayment={handleAddPayment}
          onDownloadInvoice={handleDownloadInvoice}
          onDownloadReceipt={handleDownloadReceipt}
          isSubmittingPayment={paymentPending && paymentInvoiceId === invoiceId}
          onBack={() => navigate('/history')}
        />
      </div>
    </div>
  )
}

export default function InvoiceDetails() {
  const { id } = useParams()

  return <InvoiceDetailsContent key={id} invoiceId={id} />
}
