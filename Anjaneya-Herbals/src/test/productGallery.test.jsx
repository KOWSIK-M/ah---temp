import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductImageGallery from '../components/ProductImageGallery';

describe('product image viewer', () => {
  it('opens, zooms, switches photos and closes using the keyboard', async () => {
    render(<ProductImageGallery images={['/one.jpg', '/two.jpg']} productName="Raisins" />);
    fireEvent.click(screen.getByRole('button', { name: 'Enlarge image of Raisins' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Zoom out' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Zoom in', exact: true }));
    expect(screen.getByText('150%')).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('button', { name: 'Zoom in', exact: true }), { key: 'ArrowRight' });
    expect(screen.getByAltText('Raisins enlarged — image 2')).toHaveAttribute('src', '/two.jpg');
    expect(screen.getByText('100%')).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('button', { name: 'Close image viewer' }), { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});

