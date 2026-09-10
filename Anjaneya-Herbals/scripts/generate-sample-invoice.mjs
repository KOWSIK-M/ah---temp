import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createInvoicePdf } from '../src/utils/invoice.js';

const order = {
  id: 42,
  createdAt: '2026-09-10T10:00:00Z',
  status: 'CONFIRMED',
  paymentStatus: 'PAID',
  paymentMethod: 'UPI',
  paymentId: 'pay_sample_anjaneya_42',
  customerName: 'Sample Customer',
  customerEmail: 'customer@example.com',
  customerPhone: '+91 98765 43210',
  shippingAddress: {
    firstName: 'Sample',
    lastName: 'Customer',
    addressLine1: '24 Herbal Gardens, M.G. Road',
    city: 'Vijayawada',
    state: 'Andhra Pradesh',
    pincode: '520001',
  },
  items: [
    { productName: 'Black Raisins - 1 kg', priceAtPurchase: 1400, quantity: 1, subtotal: 1400 },
    { productName: 'Pistachio - Premium Quality', priceAtPurchase: 1199, quantity: 2, subtotal: 2398 },
  ],
  shippingCharges: 40,
  codCharges: 0,
  taxAmount: 190,
  discountAmount: 200,
  totalAmount: 3828,
};

const outputDirectory = resolve('output/pdf');
await mkdir(outputDirectory, { recursive: true });
const document = await createInvoicePdf(order);
await writeFile(resolve(outputDirectory, 'Anjaneya-Herbals-Sample-Invoice.pdf'), Buffer.from(document.output('arraybuffer')));
