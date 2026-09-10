import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AllProductsPage from '../pages/AllProductsPage';
import { categoriesApi, productsApi } from '../services/api';

vi.mock('../services/api', () => ({
  categoriesApi: { getAll: vi.fn() },
  productsApi: { getAll: vi.fn() },
}));

vi.mock('../components/ProductCard', () => ({
  default: ({ product }) => <div data-testid="product-card">{product.name}</div>,
}));

describe('category catalog routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    categoriesApi.getAll.mockResolvedValue([
      { id: 1, name: 'Spices', slug: 'spices' },
      { id: 2, name: 'Dry Fruits', slug: 'dry-fruits' },
    ]);
    productsApi.getAll.mockResolvedValue({
      content: [{ id: 8, name: 'Black Raisins', price: 200, categoryId: 2, categoryName: 'Dry Fruits' }],
      page: { totalElements: 1, totalPages: 1 },
    });
  });

  it('converts a category slug in the URL to the numeric API category ID', async () => {
    render(
      <MemoryRouter initialEntries={['/category/dry-fruits']}>
        <Routes>
          <Route path="/category/:categoryId" element={<AllProductsPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(productsApi.getAll).toHaveBeenLastCalledWith(
      expect.objectContaining({ category: 2 }),
    ));
    expect(await screen.findByRole('heading', { name: 'Dry Fruits' })).toBeInTheDocument();
    expect(screen.getByText('Black Raisins')).toBeInTheDocument();
  });
});
