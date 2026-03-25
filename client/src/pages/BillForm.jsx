
// src/components/BillForm.jsx
import React, { useState, useEffect } from 'react';
import { generateInvoicePdf } from "../utils/generateInvoicePdf.js";

const emptyItem = { desc: '', qty: '', price: '' };

export default function BillForm() {
  const [customerName, setCustomerName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [editable, setEditable] = useState(true); // keep fields editable in PDF
  const [fileName, setFileName] = useState('');   // override name if provided

  // Load from localStorage (optional)
  useEffect(() => {
    const saved = localStorage.getItem('billForm');
    if (saved) {
      const parsed = JSON.parse(saved);
      setCustomerName(parsed.customerName || '');
      setInvoiceNumber(parsed.invoiceNumber || '');
      setInvoiceDate(parsed.invoiceDate || new Date().toISOString().slice(0,10));
      setItems(parsed.items && parsed.items.length ? parsed.items : [{ ...emptyItem }]);
      setEditable(parsed.editable ?? true);
    }
  }, []);

  const addItem = () => setItems([...items, { ...emptyItem }]);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx, field, value) => {
    setItems(items.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  };

  const onSave = async (e) => {
    e.preventDefault();

    const data = { customerName, invoiceNumber, invoiceDate, items, editable };
    // Save to localStorage
    localStorage.setItem('billForm', JSON.stringify(data));

    // Generate file name if user provided one, else let generator create it
    const name = fileName && fileName.trim().length > 0 ? fileName.trim() : undefined;

    // Generate PDF
    await generateInvoicePdf({ ...data, fileName: name });

    alert('Saved and PDF downloaded!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Invoice / Bill Generator</h2>

      <form onSubmit={onSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
              className="input input-bordered w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice #</label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={e => setInvoiceNumber(e.target.value)}
              placeholder="e.g., INV-1001"
              className="input input-bordered w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={invoiceDate}
              onChange={e => setInvoiceDate(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Items</h3>
          <div className="space-y-2">
            {items.map((it, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                <input
                  type="text"
                  placeholder="Description"
                  value={it.desc}
                  onChange={(e) => updateItem(idx, 'desc', e.target.value)}
                  className="input input-bordered"
                  required
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={it.qty}
                  onChange={(e) => updateItem(idx, 'qty', e.target.value)}
                  className="input input-bordered"
                  min="1"
                  required
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={it.price}
                  onChange={(e) => updateItem(idx, 'price', e.target.value)}
                  className="input input-bordered"
                  min="0"
                  step="0.01"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  disabled={items.length === 1}
                  className="btn btn-error btn-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addItem} className="btn btn-primary btn-sm mt-2">+ Add Item</button>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="editable"
            checked={editable}
            onChange={e => setEditable(e.target.checked)}
            className="checkbox"
          />
          <label htmlFor="editable" className="text-sm text-gray-700">
            Keep fields editable in PDF (uncheck to flatten)
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Custom PDF File Name (optional)</label>
          <input
            type="text"
            placeholder="Invoice_Custom_Name.pdf"
            value={fileName}
            onChange={e => setFileName(e.target.value)}
            className="input input-bordered w-full max-w-md"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave empty to auto-generate like: <code>Invoice_INV-1001_John_2026-01-20.pdf</code>
          </p>
        </div>

        <div className="text-center">
          <button type="submit" className="btn btn-success btn-lg">Save & Download PDF</button>
        </div>
      </form>
    </div>
  );
}
