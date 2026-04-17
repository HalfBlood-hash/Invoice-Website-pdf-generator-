


import express from 'express';
import { createInvoice, getInvoiceNumber, getAllInvoices, getInvoiceById, updateInvoice, deleteInvoice } from '../controllers/invoice.controller.js';
import { verifyJwt } from '../middleware/auth.middleware.js';




const router = express.Router();

// Create a new invoice
router.post('/create', verifyJwt, createInvoice);

// Get all invoices
router.get('/all', verifyJwt, getAllInvoices);

// Get next invoice number
router.get('/invoiceNumber', verifyJwt, getInvoiceNumber);

// Get a single invoice by ID
router.get('/:id', verifyJwt, getInvoiceById);

// Update an invoice
router.put('/:id', verifyJwt, updateInvoice);

// Delete an invoice
router.delete('/:id', verifyJwt, deleteInvoice);

export default router;