import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import DeliveryEstimate from '../components/DeliveryEstimate';
import { estimateDelivery } from '../utils/deliveryEstimate';
import { calculateInvoiceTotals, createInvoicePdf } from '../utils/invoice';
import { readRecentlyViewed, rememberProduct } from '../utils/recentlyViewed';

describe('commerce enhancements', () => {
  beforeEach(() => window.localStorage.clear());

  it('validates PIN codes and displays a persisted delivery estimate', () => {
    render(<DeliveryEstimate />);
    fireEvent.change(screen.getByLabelText('Delivery PIN code'), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));
    expect(screen.getByRole('alert')).toHaveTextContent('valid 6-digit');
    fireEvent.change(screen.getByLabelText('Delivery PIN code'), { target: { value: '520001' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));
    expect(screen.getByText(/Estimated/)).toBeInTheDocument();
    expect(window.localStorage.getItem('anjaneya-delivery-pincode')).toBe('520001');
    expect(estimateDelivery('020001')).toBeNull();
  });

  it('keeps unique recently viewed products in newest-first order', () => {
    rememberProduct({ id: 1, name: 'Pistachio', price: 100 });
    rememberProduct({ id: 2, name: 'Raisins', price: 80 });
    rememberProduct({ id: 1, name: 'Pistachio', price: 95 });
    expect(readRecentlyViewed().map((item) => item.id)).toEqual([1, 2]);
    expect(readRecentlyViewed()[0].price).toBe(95);
  });

  it('uses real order fields for the complete invoice breakdown', () => {
    expect(calculateInvoiceTotals({
      items: [{ priceAtPurchase: 100, quantity: 2 }, { subtotal: 50, quantity: 1 }],
      shippingCharges: 40,
      codCharges: 10,
      taxAmount: 45,
      discountAmount: 20,
      totalAmount: 325,
    })).toEqual({ subtotal: 250, shipping: 40, cod: 10, tax: 45, discount: 20, total: 325 });
  });

  it('creates a non-empty PDF invoice with item, customer and tax data', async () => {
    const document = await createInvoicePdf({
      id: 42,
      createdAt: '2026-09-10T10:00:00Z',
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      customerName: 'Test Customer',
      shippingAddress: { addressLine1: 'Test Street', city: 'Vijayawada', state: 'Andhra Pradesh', pincode: '520001' },
      items: [{ productName: 'Black Raisins', priceAtPurchase: 1400, quantity: 1, subtotal: 1400 }],
      taxAmount: 70,
      shippingCharges: 40,
      discountAmount: 10,
      totalAmount: 1500,
    });
    expect(document.output('arraybuffer').byteLength).toBeGreaterThan(5000);
  });
});
