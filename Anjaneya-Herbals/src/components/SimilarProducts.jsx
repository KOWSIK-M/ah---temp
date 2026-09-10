import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { productsApi } from '../services/api';
import ProductCard from './ProductCard';

export default function SimilarProducts({ productId, categoryId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const categoryResult = await productsApi.getAll({ category: categoryId, size: 8 });
        let suggestions = (categoryResult.content || []).filter((item) => String(item.id) !== String(productId));
        if (suggestions.length < 4) {
          const catalog = await productsApi.getAll({ size: 12 });
          const seen = new Set(suggestions.map((item) => String(item.id)));
          suggestions = [...suggestions, ...(catalog.content || []).filter((item) => String(item.id) !== String(productId) && !seen.has(String(item.id)))];
        }
        if (active) setProducts(suggestions.slice(0, 4));
      } catch {
        if (active) setProducts([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [productId, categoryId]);

  if (!loading && !products.length) return null;
  return (
    <section className="mt-8" aria-labelledby="suggested-products-title">
      <div className="mb-4 flex items-center gap-3">
        <span className="rounded-full bg-green-50 p-2 text-brand-moss"><Sparkles size={20} /></span>
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-sage">Picked for you</p><h2 id="suggested-products-title" className="font-serif text-2xl font-bold text-brand-black">You may also like</h2></div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {loading ? Array.from({ length: 4 }, (_, index) => <div key={index} className="aspect-[3/5] animate-pulse rounded-3xl bg-white/70" />) : products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}
