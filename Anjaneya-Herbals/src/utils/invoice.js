const money = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const text = (value, fallback = '-') => value == null || value === '' ? fallback : String(value);
const longDate = (value) => new Date(value || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const invoiceEnv = import.meta.env || {};
const seller = {
  name: invoiceEnv.VITE_FIRM_NAME || 'Anjaneya Herbals',
  address: invoiceEnv.VITE_FIRM_ADDRESS || 'D. No. 11-62-91, Canal Road, Kaleswara Rao Market, Tarapet, Vijayawada, Andhra Pradesh 520001',
  email: invoiceEnv.VITE_FIRM_EMAIL || 'medamkowsik2004@gmail.com',
  phone: invoiceEnv.VITE_FIRM_PHONE || '',
  gstin: invoiceEnv.VITE_FIRM_GSTIN || '',
};

const addressLines = (order) => {
  const address = order.shippingAddress || {};
  return [
    order.customerName || [address.firstName, address.lastName].filter(Boolean).join(' '),
    address.addressLine1 || address.address,
    address.addressLine2,
    [address.city, address.state, address.pincode].filter(Boolean).join(', '),
    address.phone || order.customerPhone,
    address.email || order.customerEmail,
  ].filter(Boolean);
};

export const calculateInvoiceTotals = (order) => {
  const items = order.items || [];
  const subtotal = items.reduce((sum, item) => sum + Number(item.subtotal ?? Number(item.priceAtPurchase || 0) * Number(item.quantity || 1)), 0);
  const shipping = Number(order.shippingCharges || 0);
  const cod = Number(order.codCharges || 0);
  const tax = Number(order.taxAmount || 0);
  const discount = Number(order.discountAmount || 0);
  const total = Number(order.totalAmount || Math.max(0, subtotal + shipping + cod + tax - discount));
  return { subtotal, shipping, cod, tax, discount, total };
};

export async function createInvoicePdf(order) {
  const [{ jsPDF }, autoTableModule] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const autoTable = autoTableModule.default;
  const document = new jsPDF({ unit: 'mm', format: 'a4' });
  const items = order.items || [];
  const { subtotal, shipping, cod, tax, discount, total } = calculateInvoiceTotals(order);
  const invoiceNumber = `AH-${new Date(order.createdAt || Date.now()).getFullYear()}-${String(order.id).padStart(6, '0')}`;

  document.setFillColor(31, 79, 61);
  document.rect(0, 0, 210, 37, 'F');
  document.setTextColor(255, 255, 255);
  document.setFont('helvetica', 'bold');
  document.setFontSize(22);
  document.text(seller.name, 14, 16);
  document.setFontSize(9);
  document.setFont('helvetica', 'normal');
  document.text('Pure | Traditional | Natural', 14, 23);
  document.setFontSize(17);
  document.setFont('helvetica', 'bold');
  document.text('TAX INVOICE', 196, 16, { align: 'right' });
  document.setFontSize(9);
  document.setFont('helvetica', 'normal');
  document.text(invoiceNumber, 196, 23, { align: 'right' });

  document.setTextColor(35, 35, 35);
  document.setFontSize(9);
  document.setFont('helvetica', 'bold');
  document.text('SOLD BY', 14, 48);
  document.text('BILL & SHIP TO', 112, 48);
  document.setFont('helvetica', 'normal');
  const sellerLines = [seller.name, seller.address, seller.phone, seller.email, seller.gstin && `GSTIN: ${seller.gstin}`].filter(Boolean);
  document.text(sellerLines, 14, 54, { maxWidth: 82, lineHeightFactor: 1.35 });
  document.text(addressLines(order), 112, 54, { maxWidth: 84, lineHeightFactor: 1.35 });

  autoTable(document, {
    startY: 82,
    tableWidth: 178,
    head: [['#', 'Item', 'Qty', 'Unit price', 'Amount']],
    body: items.map((item, index) => [index + 1, text(item.productName, 'Product'), Number(item.quantity || 1), money(item.priceAtPurchase), money(item.subtotal ?? Number(item.priceAtPurchase || 0) * Number(item.quantity || 1))]),
    theme: 'grid',
    headStyles: { fillColor: [31, 79, 61], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 3, overflow: 'linebreak' },
    columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 82 }, 2: { cellWidth: 16, halign: 'center' }, 3: { cellWidth: 35, halign: 'right' }, 4: { cellWidth: 35, halign: 'right' } },
  });

  const summaryY = document.lastAutoTable.finalY + 7;
  autoTable(document, {
    startY: summaryY,
    tableWidth: 83.8,
    margin: { left: 112 },
    body: [
      ['Items subtotal', money(subtotal)],
      ['Delivery charge', money(shipping)],
      ['COD / handling charge', money(cod)],
      ['Tax (GST)', money(tax)],
      ['Discount', `- ${money(discount)}`],
      ['Grand total', money(total)],
    ],
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2, lineColor: [210, 218, 210] },
    columnStyles: { 0: { cellWidth: 48 }, 1: { cellWidth: 35.8, halign: 'right', fontStyle: 'bold' } },
    didParseCell: (data) => { if (data.row.index === 5) { data.cell.styles.fillColor = [235, 244, 235]; data.cell.styles.fontSize = 11; data.cell.styles.textColor = [31, 79, 61]; } },
  });

  const detailY = Math.max(document.lastAutoTable.finalY + 12, summaryY + 52);
  document.setFontSize(9);
  document.setFont('helvetica', 'bold');
  document.text('ORDER & PAYMENT DETAILS', 14, detailY);
  document.setFont('helvetica', 'normal');
  document.text([
    `Order: #${order.id}`,
    `Invoice date: ${longDate(order.createdAt)}`,
    `Order status: ${text(order.status, 'Pending')}`,
    `Payment method: ${text(order.payment?.method || order.paymentMethod || order.paymentStatus, 'COD')}`,
    `Payment status: ${text(order.paymentStatus, 'Pending')}`,
    order.paymentId ? `Payment reference: ${order.paymentId}` : '',
  ].filter(Boolean), 14, detailY + 6, { lineHeightFactor: 1.5 });

  document.setDrawColor(210, 218, 210);
  document.line(14, 277, 196, 277);
  document.setFontSize(8);
  document.setTextColor(90, 90, 90);
  document.text('Thank you for choosing Anjaneya Herbals.', 14, 283);
  document.text('Page 1 of 1', 105, 283, { align: 'center' });
  document.text('Computer-generated invoice', 196, 283, { align: 'right' });
  return document;
}

export async function downloadInvoicePdf(order) {
  const document = await createInvoicePdf(order);
  document.save(`Anjaneya-Herbals-Invoice-${order.id}.pdf`);
}
