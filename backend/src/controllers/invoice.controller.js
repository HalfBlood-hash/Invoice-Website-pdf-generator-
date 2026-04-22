

import Invoice from "../model/invoice.model.js";
import Payment from "../model/payment.model.js";

import generateNextInvoiceNumber from "../utils/generateNextInvoiceNumber.js";
import { calculateInvoicePaymentSummary } from "../utils/paymentSummary.js";

const attachPaymentsToInvoices = async (invoiceDocs) => {
    const invoices = invoiceDocs.map((invoice) => {
        return typeof invoice.toObject === "function" ? invoice.toObject() : invoice;
    });

    if (!invoices.length) {
        return [];
    }

    const invoiceIds = invoices.map((invoice) => invoice._id);
    const payments = await Payment.find({ invoiceId: { $in: invoiceIds } })
        .sort({ paymentDate: -1, createdAt: -1 })
        .lean();

    const paymentsByInvoiceId = payments.reduce((groupedPayments, payment) => {
        const invoiceId = String(payment.invoiceId);
        if (!groupedPayments[invoiceId]) {
            groupedPayments[invoiceId] = [];
        }

        groupedPayments[invoiceId].push(payment);
        return groupedPayments;
    }, {});

    return invoices.map((invoice) => ({
        ...invoice,
        payments: paymentsByInvoiceId[String(invoice._id)] || []
    }));
};

const createInvoice = async (req, res) => {
    // console.log("createInvoice: Received data", req.body);
    try {
        const invoiceData = req.body;
        if (!invoiceData.invoiceNumber) {
            invoiceData.invoiceNumber = await generateNextInvoiceNumber();
        }
        const paymentSummary = calculateInvoicePaymentSummary(invoiceData.total, 0);
        invoiceData.total = paymentSummary.total;
        invoiceData.paidAmount = paymentSummary.paidAmount;
        invoiceData.dueAmount = paymentSummary.dueAmount;
        invoiceData.status = paymentSummary.status;
        const newInvoice = new Invoice(invoiceData);
        const savedInvoice = await newInvoice.save();
        res.status(201).json(savedInvoice);
    } catch (error) {
        console.error('createInvoice error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getInvoiceNumber = async (req,res) => {
    try {
        const invoiceNumber = await generateNextInvoiceNumber();
        res.status(200).json({ invoiceNumber });
    } catch (error) {
        console.error('getInvoiceNumber error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getAllInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find();  
        const invoicesWithPayments = await attachPaymentsToInvoices(invoices);
        res.status(200).json(invoicesWithPayments);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getInvoiceById = async (req, res) => {
    try {
        const invoiceId = req.params.id;
        const invoice = await   
        Invoice.findById(invoiceId);
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }   
        const [invoiceWithPayments] = await attachPaymentsToInvoices([invoice]);
        res.status(200).json(invoiceWithPayments);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const deleteInvoice = async (req, res) => {
    try {
        const invoiceId = req.params.id;
        const deletedInvoice = await Invoice.findByIdAndDelete(invoiceId);
        if (!deletedInvoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }   
        res.status(200).json({ message: 'Invoice deleted successfully' });  
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



const updateInvoice = async (req, res) => {
    try {
        const invoiceId = req.params.id;
        const updateData = { ...req.body };
        const currentInvoice = await Invoice.findById(invoiceId);
        if (!currentInvoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        if (updateData.total !== undefined) {
            const paymentSummary = calculateInvoicePaymentSummary(updateData.total, currentInvoice.paidAmount);
            updateData.total = paymentSummary.total;
            updateData.paidAmount = paymentSummary.paidAmount;
            updateData.dueAmount = paymentSummary.dueAmount;
            updateData.status = paymentSummary.status;
        } else {
            delete updateData.paidAmount;
            delete updateData.dueAmount;
            delete updateData.status;
        }

        const updatedInvoice = await Invoice.findByIdAndUpdate(
            invoiceId,
            updateData,
            { new: true, runValidators: true }
        );
        if (!updatedInvoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }           

        res.status(200).json(updatedInvoice);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export { createInvoice, getAllInvoices, getInvoiceById, updateInvoice, deleteInvoice, getInvoiceNumber };
