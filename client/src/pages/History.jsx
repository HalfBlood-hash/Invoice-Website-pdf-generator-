import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchInvoices } from '../feature/invoiceSlice.js'
import { generateInvoicePdf } from '../utils/generateInvoicePdf.js'

export default function History() {
  const dispatch = useDispatch()
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

  const downloadInvoicePdf = async (invoice) => {
    const items = [
      {
        desc: invoice.items || 'Item',
        qty: invoice.quantity || 1,
        price: invoice.price || 0
      }
    ]

    await generateInvoicePdf({
      customerName: invoice.customerName,
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate ? new Date(invoice.invoiceDate).toISOString().slice(0, 10) : '',
      items,
      fileName: `Invoice-${invoice.invoiceNumber || 'unknown'}.pdf`
    })
  }

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
      <div className="mx-auto max-w-7xl bg-white rounded-3xl shadow-xl p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Invoice History</h1>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search by customer name</label>
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="Search name..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice date from</label>
            <input
              type="date"
              value={invoiceDateFrom}
              onChange={(e) => setInvoiceDateFrom(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice date to</label>
            <input
              type="date"
              value={invoiceDateTo}
              onChange={(e) => setInvoiceDateTo(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due date from</label>
            <input
              type="date"
              value={dueDateFrom}
              onChange={(e) => setDueDateFrom(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due date to</label>
            <input
              type="date"
              value={dueDateTo}
              onChange={(e) => setDueDateTo(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min amount</label>
              <input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max amount</label>
              <input
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="0"
                min="0"
              />
            </div>
          </div>
        </div>

        {invoicesPending && <div className="text-sm text-gray-600 mb-4">Loading invoices...</div>}
        {invoicesError && <div className="text-sm text-red-600 mb-4">{invoicesError}</div>}

        {!invoicesPending && filteredInvoices.length === 0 && (
          <div className="text-gray-600">No invoices match the filter criteria.</div>
        )}

        {filteredInvoices.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice._id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{invoice.invoiceNumber}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{invoice.customerName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : ''}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : ''}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">{invoice.total ? `₹ ${invoice.total}` : ''}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <button
                        type="button"
                        onClick={() => downloadInvoicePdf(invoice)}
                        className="inline-flex items-center rounded-md border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
