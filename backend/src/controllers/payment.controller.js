import Invoice from "../model/invoice.model.js";
import Payment from "../model/payment.model.js";
import { summarizePaymentsForInvoice } from "../utils/paymentSummary.js";

const addPayment = async (req, res) => {
    try {
        const { invoiceId, amountPaid, paymentDate, paymentMode } = req.body;

        if (!invoiceId || amountPaid === undefined || !paymentMode) {
            return res.status(400).json({ error: "invoiceId, amountPaid and paymentMode are required" });
        }

        const parsedAmount = Number(amountPaid);
        if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ error: "amountPaid must be a valid number greater than 0" });
        }

        const invoice = await Invoice.findById(invoiceId);
        if (!invoice) {
            return res.status(404).json({ error: "Invoice not found" });
        }

        let parsedPaymentDate;
        if (paymentDate) {
            parsedPaymentDate = new Date(paymentDate);
            if (Number.isNaN(parsedPaymentDate.getTime())) {
                return res.status(400).json({ error: "paymentDate must be a valid date" });
            }
        }

        const savedPayment = await Payment.create({
            invoiceId,
            amountPaid: parsedAmount,
            paymentDate: parsedPaymentDate,
            paymentMode
        });

        const [freshInvoice, payments] = await Promise.all([
            Invoice.findById(invoiceId),
            Payment.find({ invoiceId }).sort({ paymentDate: -1, createdAt: -1 })
        ]);

        if (!freshInvoice) {
            return res.status(404).json({ error: "Invoice not found" });
        }

        const paymentSummary = summarizePaymentsForInvoice(freshInvoice.total, payments);
        freshInvoice.paidAmount = paymentSummary.paidAmount;
        freshInvoice.dueAmount = paymentSummary.dueAmount;
        freshInvoice.status = paymentSummary.status;
        await freshInvoice.save();

        const invoiceWithPayments = {
            ...freshInvoice.toObject(),
            payments
        };

        return res.status(201).json({
            total: paymentSummary.total,
            paid: paymentSummary.paidAmount,
            due: paymentSummary.dueAmount,
            status: paymentSummary.status,
            invoice: invoiceWithPayments,
            payment: savedPayment,
            payments
        });
    } catch (error) {
        console.error("addPayment error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export { addPayment };
