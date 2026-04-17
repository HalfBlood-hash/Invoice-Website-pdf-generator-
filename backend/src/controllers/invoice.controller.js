

import Invoice from "../model/invoice.model.js";

import generateNextInvoiceNumber from "../utils/generateNextInvoiceNumber.js";

const createInvoice = async (req, res) => {
    console.log("createInvoice: Received data", req.body);
    try {
        const invoiceData = req.body;
        if (!invoiceData.invoiceNumber) {
            invoiceData.invoiceNumber = await generateNextInvoiceNumber();
        }
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
        res.status(200).json(invoices);
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
        res.status(200).json(invoice);
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
        const updateData = req.body;
        const updatedInvoice = await Invoice.findByIdAndUpdate(invoiceId, updateData, { new: true });
        if (!updatedInvoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }           

        res.status(200).json(updatedInvoice);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export { createInvoice, getAllInvoices, getInvoiceById, updateInvoice, deleteInvoice, getInvoiceNumber };