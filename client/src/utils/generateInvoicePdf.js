import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { saveAs } from "file-saver";

export async function generateInvoicePdf({
  customerName,
  invoiceNumber,
  invoiceDate,
  items = [],
  logoPath = "/vite.svg",
  fileName,
}) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 40;

  /* ================= LOGO ================= */
  try {
    const logoBytes = await fetch(logoPath).then((r) => r.arrayBuffer());
    const logoImage = await pdfDoc.embedPng(logoBytes);

    page.drawImage(logoImage, {
      x: margin,
      y: height - 90,
      width: 120,
      height: 60,
    });
  } catch {}

  /* ================= HEADER ================= */

  page.drawText(`INVOICE ${invoiceNumber || ""}`, {
    x: width - margin - 180,
    y: height - margin,
    size: 14,
    font: bold,
  });

  page.drawText(`Date: ${invoiceDate || ""}`, {
    x: width - margin - 180,
    y: height - margin - 16,
    size: 10,
    font,
  });

  /* ================= COMPANY ================= */

  let yLeft = height - 110;

  const companyLines = [
    "Ecoliving Property And Developer Pvt Ltd",
    "C/O Munna Kumar Gupta",
    "Near Sumitra College Dumraon",
    "Dist - Buxar (Bihar)",
    "Contact: 9304636550",
    "Email: ecolivingproperty@gmail.com",
  ];

  companyLines.forEach((line, i) => {
    page.drawText(line, {
      x: margin,
      y: yLeft,
      size: i === 0 ? 12 : 10,
      font: i === 0 ? bold : font,
    });
    yLeft -= 14;
  });

  /* ================= BILL TO ================= */

  const billBarY = height - 150;

  page.drawRectangle({
    x: width / 2,
    y: billBarY,
    width: width / 2 - margin,
    height: 18,
    color: rgb(0.18, 0.44, 0.78),
  });

  page.drawText("Bill To :", {
    x: width / 2 + 8,
    y: billBarY + 5,
    size: 10,
    font: bold,
    color: rgb(1, 1, 1),
  });

  page.drawText(customerName || "", {
    x: width / 2,
    y: billBarY - 14,
    size: 11,
    font: bold,
  });

  /* ================= TABLE ================= */

  let tableY = billBarY - 50;

  const cols = [
    { title: "S.No", width: 40 },
    { title: "Particulars", width: 200 },
    { title: "Qty", width: 50 },
    { title: "Unit", width: 60 }, // ✅ NEW
    { title: "Unit Price", width: 80 },
    { title: "Amount", width: 80 },
  ];

  page.drawRectangle({
    x: margin,
    y: tableY - 4,
    width: width - margin * 2,
    height: 18,
    color: rgb(0.18, 0.44, 0.78),
  });

  let x = margin;

  cols.forEach((c) => {
    page.drawText(c.title, {
      x: x + 4,
      y: tableY,
      size: 10,
      font: bold,
      color: rgb(1, 1, 1),
    });
    x += c.width;
  });

  /* ================= ROWS ================= */

  tableY -= 20;
  let subtotal = 0;
  let totalQty = 0;

  items.forEach((it, index) => {
    const qty = Number(it.qty) || 0;
    const price = Number(it.price) || 0;
    const amount = qty * price;

    subtotal += amount;
    totalQty += qty;

    const row = [
      String(index + 1),
      it.desc || "",
      qty ? String(qty) : "",
      it.unit || "", // ✅ UNIT
      price ? `Rs. ${price.toFixed(2)}` : "",
      amount ? `Rs. ${amount.toFixed(2)}` : "",
    ];

    let colX = margin;

    row.forEach((txt, i) => {
      page.drawText(txt, {
        x: colX + 4,
        y: tableY,
        size: 10,
        font,
      });
      colX += cols[i].width;
    });

    tableY -= 18;
  });

  /* ================= TOTAL BAR ================= */

  tableY -= 10;

  page.drawRectangle({
    x: margin,
    y: tableY,
    width: width - margin * 2,
    height: 18,
    color: rgb(0.18, 0.44, 0.78),
  });

  page.drawText("Total Qty", {
    x: margin + 6,
    y: tableY + 5,
    size: 10,
    font: bold,
    color: rgb(1, 1, 1),
  });

  const qtyX = margin + 40 + 200 + 6;

  page.drawText(String(totalQty), {
    x: qtyX,
    y: tableY + 5,
    size: 10,
    font: bold,
    color: rgb(1, 1, 1),
  });

  const amountX = width - margin - 110;

  page.drawText(`Rs. ${subtotal.toFixed(2)}`, {
    x: amountX,
    y: tableY + 5,
    size: 10,
    font: bold,
    color: rgb(1, 1, 1),
  });

  /* ================= SAVE ================= */

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });

  if (!fileName) {
    fileName = `Invoice_${invoiceNumber}.pdf`;
  }

  saveAs(blob, fileName);
}