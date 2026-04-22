const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0)
const formatDate = (value) => (value ? new Date(value).toLocaleDateString('en-IN') : '')

const getStatusClasses = (status) => {
  switch (status) {
    case 'PAID':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    case 'PARTIAL':
      return 'bg-amber-100 text-amber-700 border-amber-200'
    default:
      return 'bg-rose-100 text-rose-700 border-rose-200'
  }
}

const DetailItem = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
    <div className="mt-1 text-sm font-medium text-slate-800">{value || '-'}</div>
  </div>
)

export default function InvoiceDetailsPanel({
  invoice,
  paymentForm,
  onPaymentFieldChange,
  onAddPayment,
  onDownloadInvoice,
  onDownloadReceipt,
  isSubmittingPayment,
  onBack
}) {
  if (!invoice) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <h2 className="text-lg font-semibold text-slate-800">Select an invoice</h2>
        <p className="mt-2 text-sm text-slate-500">
          Click any invoice from the history list to view full details and manage payments.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="mb-3 rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
            >
              Back To History
            </button>
          ) : null}
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Invoice Details</div>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">{invoice.invoiceNumber}</h2>
          <p className="mt-1 text-sm text-slate-500">{invoice.customerName}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(invoice.status)}`}>
            {invoice.status}
          </span>
          <button
            type="button"
            onClick={() => onDownloadInvoice(invoice)}
            className="rounded-xl border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Download Invoice
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DetailItem label="Invoice Date" value={formatDate(invoice.invoiceDate)} />
        <DetailItem label="Due Date" value={formatDate(invoice.dueDate)} />
        <DetailItem label="Total" value={formatCurrency(invoice.total)} />
        <DetailItem label="Paid Amount" value={formatCurrency(invoice.paidAmount)} />
        <DetailItem label="Due Amount" value={formatCurrency(invoice.dueAmount)} />
        <DetailItem label="Payment Status" value={invoice.status} />
        <DetailItem label="GST" value={`${Number(invoice.gst) || 0}%`} />
        <DetailItem label="Discount" value={`${Number(invoice.discount) || 0}%`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-4 text-sm font-semibold text-slate-700">Invoice Item</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailItem label="Description" value={invoice.items} />
              <DetailItem label="Quantity" value={invoice.quantity} />
              <DetailItem label="Unit" value={invoice.units} />
              <DetailItem label="Unit Price" value={formatCurrency(invoice.price)} />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-4 text-sm font-semibold text-slate-700">Payment History</div>

            {invoice.payments?.length ? (
              <div className="space-y-3">
                {invoice.payments.map((payment, index) => (
                  <div
                    key={payment._id}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Payment {invoice.payments.length - index}
                        </div>
                        <div className="mt-1 text-lg font-semibold text-slate-900">
                          {formatCurrency(payment.amountPaid)}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                        <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">
                          {payment.paymentMode}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">
                          {formatDate(payment.paymentDate || payment.createdAt)}
                        </span>
                      </div>
                    </div>
                    {onDownloadReceipt ? (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => onDownloadReceipt(payment)}
                          className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                        >
                          Re-download Receipt
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-500">
                No payments have been added for this invoice yet.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="mb-1 text-sm font-semibold text-slate-700">Add Payment</div>
          <p className="mb-4 text-sm text-slate-500">
            Save a payment for this invoice and download the payment receipt automatically.
          </p>

          {invoice.status === 'PAID' ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
              This invoice is fully paid. No more payments are needed.
            </div>
          ) : (
            <form className="space-y-4" onSubmit={(event) => onAddPayment(event, invoice)}>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Amount Paid</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentForm.amountPaid}
                  onChange={(event) => onPaymentFieldChange(invoice._id, 'amountPaid', event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-800 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter payment amount"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Payment Mode</label>
                <select
                  value={paymentForm.paymentMode}
                  onChange={(event) => onPaymentFieldChange(invoice._id, 'paymentMode', event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-800 focus:border-blue-500 focus:outline-none"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Card">Card</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Payment Date</label>
                <input
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(event) => onPaymentFieldChange(invoice._id, 'paymentDate', event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Invoice Total</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(invoice.total)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Paid So Far</span>
                  <span className="font-semibold text-emerald-700">{formatCurrency(invoice.paidAmount)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Remaining Due</span>
                  <span className="font-semibold text-rose-700">{formatCurrency(invoice.dueAmount)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingPayment}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isSubmittingPayment ? 'Saving Payment...' : 'Save Payment & Download Receipt'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
