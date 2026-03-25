import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { saveAs } from "file-saver";

export async function generateInvoicePdf({
  customerName,
  invoiceNumber,
  invoiceDate,
  items = [],
  logoPath = "/vite.svg", // you can change later
  fileName,
}) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
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
  } catch {
    // ignore if logo missing
  }

  /* ================= INVOICE HEADER RIGHT ================= */

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

  /* ================= COMPANY DETAILS LEFT ================= */

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

  /* ================= BILL TO RIGHT ================= */

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

  /* ================= TABLE HEADER ================= */

  let tableY = billBarY - 50;

  const cols = [
    { title: "S.No", width: 40 },
    { title: "Particulars", width: 240 },
    { title: "Qty", width: 60 },
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

  /* ================= TABLE ROWS ================= */

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
      price ? `Rs. ${price.toFixed(2)}` : "",
      amount ? `Rs. ${amount.toFixed(2)}` : "",
    ];

    let colX = margin;

    row.forEach((txt, i) => {
      page.drawText(txt, { x: colX + 4, y: tableY, size: 10, font });
      colX += cols[i].width;
    });

    tableY -= 18;
  });

  /* ================= TOTAL QTY ================= */

/* ================= TOTAL QTY + TOTAL AMOUNT BAR ================= */

/* ================= SUMMARY BLUE BAR ================= */

tableY -= 12; // safe spacing from table above

const barHeight = 18; // smaller professional height
const barY = tableY;

// Draw blue bar
page.drawRectangle({
  x: margin,
  y: barY,
  width: width - margin * 2,
  height: barHeight,
  color: rgb(0.18, 0.44, 0.78),
});

// Common vertical text alignment (center of bar)
const textY = barY + 5;

/* ---- Left: Total Qty label ---- */
page.drawText("Total Qty", {
  x: margin + 6,
  y: textY,
  size: 10,
  font: bold,
  color: rgb(1, 1, 1),
});

/* ---- Middle: Qty number (under Qty column) ---- */
const qtyX = margin + 40 + 240 + 6;

page.drawText(String(totalQty), {
  x: qtyX,
  y: textY,
  size: 10,
  font: bold,
  color: rgb(1, 1, 1),
});

/* ---- Right: Total Amount (same horizontal line) ---- */
const amountX = width - margin - 110;

page.drawText(`Rs. ${subtotal.toFixed(2)}`, {
  x: amountX,
  y: textY,
  size: 10,
  font: bold,
  color: rgb(1, 1, 1),
});

/* ===== Move cursor safely below bar to avoid overlap ===== */
tableY = barY - 25;


/* ================= SAME LINE: AMOUNT WORDS (LEFT) + TOTAL (RIGHT) ================= */

const baseY = tableY;
const rightText = `TOTAL AMOUNT  Rs. ${subtotal.toFixed(2)}`;

// ---- FIXED RIGHT POSITION ----
const rightTextWidth = bold.widthOfTextAtSize(rightText, 11);
const rightX = width - margin - rightTextWidth;

// Draw RIGHT text first (fixed anchor)
page.drawText(rightText, {
  x: rightX,
  y: baseY,
  size: 11,
  font: bold,
});


// ---- LEFT TEXT WITH SAFE WRAP ----
const leftText = `Amount (in words): Rupees ${numberToWords(subtotal)} Only`;
const maxLeftWidth = rightX - margin - 10;
const lineHeight = 12;

// split text based on actual font width
function wrapLeftText(text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";

  words.forEach((word) => {
    const test = line + word + " ";
    const w = font.widthOfTextAtSize(test, 10);

    if (w > maxWidth && line !== "") {
      lines.push(line.trim());
      line = word + " ";
    } else {
      line = test;
    }
  });

  if (line) lines.push(line.trim());
  return lines;
}

const lines = wrapLeftText(leftText, maxLeftWidth);

// draw wrapped left lines
lines.forEach((ln, i) => {
  page.drawText(ln, {
    x: margin,
    y: baseY - i * lineHeight,
    size: 10,
    font,
  });
});

// move cursor below the taller block
tableY = baseY - lines.length * lineHeight - 15;

  /* ================= TERMS ================= */


/* ================= TERMS ================= */

const termsY = tableY - 10;

page.drawText("Terms / Declaration", {
  x: margin,
  y: termsY,
  size: 11,
  font: bold,
});

page.drawText("Terms and conditions here ...", {
  x: margin,
  y: termsY - 16,
  size: 10,
  font,
});

  /* ================= FOOTER ================= */

  page.drawText("For, Ecoliving Property And Developer Pvt Ltd", {
    x: width - 260,
    y: 80,
    size: 10,
    font,
  });

  /* ================= SAVE ================= */

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });

  if (!fileName) {
    const safeCustomer = (customerName || "Customer").replace(/[^a-z0-9]/gi, "_");
    const datePart = invoiceDate || new Date().toISOString().slice(0, 10);
    fileName = `Invoice_${invoiceNumber || "NA"}_${safeCustomer}_${datePart}.pdf`;
  }

  saveAs(blob, fileName);
}

/* ================= NUMBER TO WORDS ================= */

function numberToWords(num) {
  if (!num) return "Zero";

  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six",
    "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
    "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];

  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  if (num < 20) return a[num];
  if (num < 100) return b[Math.floor(num / 10)] + " " + a[num % 10];
  if (num < 1000)
    return a[Math.floor(num / 100)] + " Hundred " + numberToWords(num % 100);

  if (num < 100000)
    return numberToWords(Math.floor(num / 1000)) + " Thousand " + numberToWords(num % 1000);

  if (num < 10000000)
    return numberToWords(Math.floor(num / 100000)) + " Lakh " + numberToWords(num % 100000);

  return numberToWords(Math.floor(num / 10000000)) + " Crore " + numberToWords(num % 10000000);
}
