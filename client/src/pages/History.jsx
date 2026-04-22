import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchInvoices } from '../feature/invoiceSlice.js'

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0)
const formatDate = (value) => (value ? new Date(value).toLocaleDateString('en-IN') : '')

const getStatusClasses = (status) => {
  if (status === 'PAID') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  if (status === 'PARTIAL') {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }

  return 'border-rose-200 bg-rose-50 text-rose-700'
}

export default function History() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { invoices, invoicesPending, invoicesError } = useSelector((state) => state.invoice)

  const [searchName, setSearchName] = useState('')
  const [invoiceDateFrom, setInvoiceDateFrom] = useState('')
  const [invoiceDateTo, setInvoiceDateTo] = useState('')
  const [dueDateFrom, setDueDateFrom] = useState('')
  const [dueDateTo, setDueDateTo] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')

  useEffect(() => {
    dispatch(fetchInvoices())
  }, [dispatch])

  const filteredInvoices = useMemo(() => {
    return (invoices || []).filter((invoice) => {
      const nameMatch = invoice.customerName?.toLowerCase().includes(searchName.toLowerCase().trim())
      const invoiceDateValue = invoice.invoiceDate ? new Date(invoice.invoiceDate) : null
      const dueDateValue = invoice.dueDate ? new Date(invoice.dueDate) : null
      const minAmountValue = minAmount ? parseFloat(minAmount) : null
      const maxAmountValue = maxAmount ? parseFloat(maxAmount) : null

      const invoiceDateFromMatch = invoiceDateFrom ? invoiceDateValue && invoiceDateValue >= new Date(invoiceDateFrom) : true
      const invoiceDateToMatch = invoiceDateTo ? invoiceDateValue && invoiceDateValue <= new Date(invoiceDateTo) : true
      const dueDateFromMatch = dueDateFrom ? dueDateValue && dueDateValue >= new Date(dueDateFrom) : true
      const dueDateToMatch = dueDateTo ? dueDateValue && dueDateValue <= new Date(dueDateTo) : true
      const minAmountMatch = minAmountValue !== null ? invoice.total >= minAmountValue : true
      const maxAmountMatch = maxAmountValue !== null ? invoice.total <= maxAmountValue : true

      return (
        nameMatch &&
        invoiceDateFromMatch &&
        invoiceDateToMatch &&
        dueDateFromMatch &&
        dueDateToMatch &&
        minAmountMatch &&
        maxAmountMatch
      )
    })
  }, [invoices, searchName, invoiceDateFrom, invoiceDateTo, dueDateFrom, dueDateTo, minAmount, maxAmount])

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-xl">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Invoice History</h1>
              <p className="text-sm text-gray-500">
                Open any invoice in its own page to view full details, payment options, and receipt downloads.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Showing <span className="font-semibold text-slate-800">{filteredInvoices.length}</span> invoices
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Search by customer name</label>
              <input
                type="text"
                value={searchName}
                onChange={(event) => setSearchName(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="Search name..."
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Invoice date from</label>
              <input
                type="date"
                value={invoiceDateFrom}
                onChange={(event) => setInvoiceDateFrom(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Invoice date to</label>
              <input
                type="date"
                value={invoiceDateTo}
                onChange={(event) => setInvoiceDateTo(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Due date from</label>
              <input
                type="date"
                value={dueDateFrom}
                onChange={(event) => setDueDateFrom(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Due date to</label>
              <input
                type="date"
                value={dueDateTo}
                onChange={(event) => setDueDateTo(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Min amount</label>
                <input
                  type="number"
                  value={minAmount}
                  onChange={(event) => setMinAmount(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Max amount</label>
                <input
                  type="number"
                  value={maxAmount}
                  onChange={(event) => setMaxAmount(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          </div>

          {invoicesPending && <div className="mt-4 text-sm text-gray-600">Loading invoices...</div>}
          {invoicesError && <div className="mt-4 text-sm text-red-600">{invoicesError}</div>}
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Invoices</h2>
            <span className="text-sm text-slate-500">{filteredInvoices.length} records</span>
          </div>

          {!invoicesPending && filteredInvoices.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              No invoices match the current filters.
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredInvoices.map((invoice) => (
                <button
                  key={invoice._id}
                  type="button"
                  onClick={() => navigate(`/history/${invoice._id}`)}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-5 text-left transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold text-slate-900">{invoice.invoiceNumber}</div>
                      <div className="mt-1 text-sm text-slate-500">{invoice.customerName}</div>
                    </div>
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 px-3 py-3">
                      <div className="text-xs uppercase tracking-wide text-slate-500">Invoice Date</div>
                      <div className="mt-1 text-sm font-medium text-slate-800">{formatDate(invoice.invoiceDate)}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-3 py-3">
                      <div className="text-xs uppercase tracking-wide text-slate-500">Due Date</div>
                      <div className="mt-1 text-sm font-medium text-slate-800">{formatDate(invoice.dueDate)}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-3 py-3">
                      <div className="text-xs uppercase tracking-wide text-slate-500">Total</div>
                      <div className="mt-1 text-sm font-medium text-slate-800">{formatCurrency(invoice.total)}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-3 py-3">
                      <div className="text-xs uppercase tracking-wide text-slate-500">Due</div>
                      <div className="mt-1 text-sm font-medium text-slate-800">{formatCurrency(invoice.dueAmount)}</div>
                    </div>
                  </div>

                  <div className="mt-4 text-sm font-medium text-blue-600">
                    Open Invoice Details
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
