

import Invoice from "../model/invoice.model.js";


const generateNextInvoiceNumber = async () => {
    const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
    if (!lastInvoice || !lastInvoice.invoiceNumber) {
        return 'INV-1001';
    }

    const match = lastInvoice.invoiceNumber.match(/(\d+)$/);
    const nextNumber = match ? parseInt(match[1], 10) + 1 : 1001;
    return `INV-${nextNumber}`;
};

export default generateNextInvoiceNumber;