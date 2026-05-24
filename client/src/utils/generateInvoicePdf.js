import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { saveAs } from "file-saver";

const wrapText = (text, font, fontSize, maxWidth) => {
  const rawLines = String(text || "").split(/\r?\n/);
  const wrappedLines = [];

  rawLines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) {
      wrappedLines.push("");
      return;
    }

    const words = line.split(/\s+/);
    let currentLine = words[0] || "";

    for (let index = 1; index < words.length; index += 1) {
      const candidateLine = `${currentLine} ${words[index]}`;

      if (font.widthOfTextAtSize(candidateLine, fontSize) <= maxWidth) {
        currentLine = candidateLine;
      } else {
        wrappedLines.push(currentLine);
        currentLine = words[index];
      }
    }

    wrappedLines.push(currentLine);
  });

  return wrappedLines.length ? wrappedLines : [""];
};

export async function generateInvoicePdf({
  customerName,
  invoiceNumber,
  invoiceDate,
  items = [],
  amountPaid = 0,
  dueAmount = 0,
  paymentStatus = "DUE",
  logoPath = "/vite.svg",
  fileName,
}) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 40;

  try {
    const logoBytes = await fetch(logoPath).then((response) => response.arrayBuffer());
    const logoImage = await pdfDoc.embedPng(logoBytes);

    page.drawImage(logoImage, {
      x: margin,
      y: height - 90,
      width: 120,
      height: 60,
    });
  } catch {}

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

  let yLeft = height - 110;

  const companyLines = [
    "Ecoliving Property And Developer Pvt Ltd",
    "C/O Munna Kumar Gupta",
    "Near Sumitra College Dumraon",
    "Dist - Buxar (Bihar)",
    "Contact: 9304636550",
    "Email: ecolivingproperty@gmail.com",
  ];

  companyLines.forEach((line, index) => {
    page.drawText(line, {
      x: margin,
      y: yLeft,
      size: index === 0 ? 12 : 10,
      font: index === 0 ? bold : font,
    });
    yLeft -= 14;
  });

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

  let tableY = billBarY - 50;

  const cols = [
    { title: "S.No", width: 40 },
    { title: "Particulars", width: 200 },
    { title: "Qty", width: 50 },
    { title: "Unit", width: 60 },
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

  cols.forEach((column) => {
    page.drawText(column.title, {
      x: x + 4,
      y: tableY,
      size: 10,
      font: bold,
      color: rgb(1, 1, 1),
    });
    x += column.width;
  });

  tableY -= 20;
  let subtotal = 0;
  let totalQty = 0;

  items.forEach((item, index) => {
    const qty = Number(item.qty) || 0;
    const price = Number(item.price) || 0;
    const amount = qty * price;
    const particularsLines = wrapText(item.desc || "", font, 10, cols[1].width - 8);
    const rowHeight = Math.max(18, particularsLines.length * 12);

    subtotal += amount;
    totalQty += qty;

    const row = [
      String(index + 1),
      particularsLines,
      qty ? String(qty) : "",
      item.unit || "",
      price ? `Rs. ${price.toFixed(2)}` : "",
      amount ? `Rs. ${amount.toFixed(2)}` : "",
    ];

    let colX = margin;

    row.forEach((cellValue, columnIndex) => {
      if (Array.isArray(cellValue)) {
        cellValue.forEach((line, lineIndex) => {
          page.drawText(line, {
            x: colX + 4,
            y: tableY - lineIndex * 12,
            size: 10,
            font,
          });
        });
      } else {
        page.drawText(cellValue, {
          x: colX + 4,
          y: tableY,
          size: 10,
          font,
        });
      }

      colX += cols[columnIndex].width;
    });

    tableY -= rowHeight;
  });

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

  if (Number(amountPaid) > 0) {
    const paymentSummaryX = width - margin - 170;
    tableY -= 24;

    page.drawText(`Advance Paid: Rs. ${Number(amountPaid).toFixed(2)}`, {
      x: paymentSummaryX,
      y: tableY,
      size: 10,
      font: bold,
    });

    page.drawText(`Balance Due: Rs. ${Number(dueAmount || 0).toFixed(2)}`, {
      x: paymentSummaryX,
      y: tableY - 14,
      size: 10,
      font,
    });

    page.drawText(`Status: ${paymentStatus || "DUE"}`, {
      x: paymentSummaryX,
      y: tableY - 28,
      size: 10,
      font,
    });
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });

  if (!fileName) {
    fileName = `Invoice_${invoiceNumber}.pdf`;
  }

  saveAs(blob, fileName);
}
