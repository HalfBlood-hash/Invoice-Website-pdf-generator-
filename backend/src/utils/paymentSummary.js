const roundCurrency = (value) => {
    const numericValue = Number(value) || 0;
    return Math.round(numericValue * 100) / 100;
};

const calculateInvoicePaymentSummary = (invoiceTotal, totalPaid = 0) => {
    const total = roundCurrency(invoiceTotal);
    const paidAmount = roundCurrency(totalPaid);
    const dueAmount = roundCurrency(Math.max(total - paidAmount, 0));

    let status = "DUE";
    if (dueAmount === 0 && paidAmount > 0) {
        status = "PAID";
    } else if (paidAmount > 0) {
        status = "PARTIAL";
    }

    return {
        total,
        paidAmount,
        dueAmount,
        status
    };
};

const summarizePaymentsForInvoice = (invoiceTotal, payments = []) => {
    const totalPaid = payments.reduce((sum, payment) => {
        return sum + (Number(payment?.amountPaid) || 0);
    }, 0);

    return calculateInvoicePaymentSummary(invoiceTotal, totalPaid);
};

export { calculateInvoicePaymentSummary, summarizePaymentsForInvoice };
