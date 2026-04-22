import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { saveAs } from "file-saver";

const formatCurrency = (value) => {
  const amount = Number(value) || 0;
  return `Rs. ${amount.toFixed(2)}`;
};

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleDateString("en-IN");
};

export async function generatePaymentReceiptPdf({
  invoice,
  payment,
  fileName,
}) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 40;
  const primary = rgb(0.16, 0.36, 0.66);
  const light = rgb(0.95, 0.97, 1);

  page.drawRectangle({
    x: 0,
    y: height - 120,
    width,
    height: 120,
    color: primary,
  });

  page.drawText("PAYMENT RECEIPT", {
    x: margin,
    y: height - 55,
    size: 24,
    font: bold,
    color: rgb(1, 1, 1),
  });

  page.drawText(`Invoice: ${invoice?.invoiceNumber || ""}`, {
    x: margin,
    y: height - 82,
    size: 12,
    font,
    color: rgb(1, 1, 1),
  });

  page.drawText(`Receipt Date: ${formatDate(payment?.paymentDate || payment?.createdAt)}`, {
    x: width - 190,
    y: height - 55,
    size: 11,
    font,
    color: rgb(1, 1, 1),
  });

  page.drawText(`Receipt Ref: ${(payment?._id || "").slice(-8).toUpperCase()}`, {
    x: width - 190,
    y: height - 75,
    size: 11,
    font,
    color: rgb(1, 1, 1),
  });

  const companyLines = [
    "Ecoliving Property And Developer Pvt Ltd",
    "Near Sumitra College Dumraon",
    "Dist - Buxar (Bihar)",
    "Contact: 9304636550",
    "Email: ecolivingproperty@gmail.com",
  ];

  let companyY = height - 165;
  companyLines.forEach((line, index) => {
    page.drawText(line, {
      x: margin,
      y: companyY,
      size: index === 0 ? 12 : 10,
      font: index === 0 ? bold : font,
    });
    companyY -= 15;
  });

  page.drawRectangle({
    x: width / 2,
    y: height - 255,
    width: width / 2 - margin,
    height: 110,
    color: light,
    borderColor: rgb(0.82, 0.87, 0.94),
    borderWidth: 1,
  });

  const customerDetails = [
    ["Customer", invoice?.customerName || ""],
    ["Invoice Date", formatDate(invoice?.invoiceDate)],
    ["Payment Mode", payment?.paymentMode || ""],
    ["Payment Date", formatDate(payment?.paymentDate || payment?.createdAt)],
  ];

  let customerY = height - 170;
  customerDetails.forEach(([label, value]) => {
    page.drawText(`${label}:`, {
      x: width / 2 + 16,
      y: customerY,
      size: 10,
      font: bold,
      color: rgb(0.32, 0.37, 0.44),
    });

    page.drawText(value, {
      x: width / 2 + 100,
      y: customerY,
      size: 10,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });

    customerY -= 22;
  });

  const paymentRows = [
    ["Invoice Total", formatCurrency(invoice?.total)],
    ["Current Payment", formatCurrency(payment?.amountPaid)],
    ["Total Paid", formatCurrency(invoice?.paidAmount)],
    ["Amount Due", formatCurrency(invoice?.dueAmount)],
    ["Status", invoice?.status || "DUE"],
  ];

  let sectionY = height - 320;
  page.drawText("Payment Summary", {
    x: margin,
    y: sectionY,
    size: 14,
    font: bold,
    color: primary,
  });

  sectionY -= 24;
  paymentRows.forEach(([label, value], index) => {
    if (index % 2 === 0) {
      page.drawRectangle({
        x: margin,
        y: sectionY - 8,
        width: width - margin * 2,
        height: 24,
        color: light,
      });
    }

    page.drawText(label, {
      x: margin + 12,
      y: sectionY,
      size: 11,
      font: bold,
    });

    page.drawText(value, {
      x: width - 180,
      y: sectionY,
      size: 11,
      font,
    });

    sectionY -= 28;
  });

  page.drawRectangle({
    x: margin,
    y: sectionY - 8,
    width: width - margin * 2,
    height: 54,
    color: rgb(0.98, 0.99, 1),
    borderColor: rgb(0.82, 0.87, 0.94),
    borderWidth: 1,
  });

  page.drawText("Received with thanks.", {
    x: margin + 12,
    y: sectionY + 20,
    size: 12,
    font: bold,
    color: primary,
  });

  page.drawText("This receipt confirms the payment recorded against the invoice above.", {
    x: margin + 12,
    y: sectionY + 4,
    size: 10,
    font,
    color: rgb(0.32, 0.37, 0.44),
  });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });

  const receiptFileName =
    fileName ||
    `Payment_Receipt_${invoice?.invoiceNumber || "invoice"}_${(payment?._id || "payment").slice(-6)}.pdf`;

  saveAs(blob, receiptFileName);
}
