

import React from 'react'


// src/pdf/generateInvoicePdf.js
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';


export default function GenerateInvoicePdf({
    
customerName,
invoiceNumber,
invoiceDate,     // string e.g. '2026-01-20'
items = [],      // [{ desc, qty, price }]
editable = true, // if false, the form will be flattened
fileName, 

}) {
    
  return (
    <div>GenerateInvoicePdf</div>
  )
}
