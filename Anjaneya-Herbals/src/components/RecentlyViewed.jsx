import React, { useEffect, useState } from 'react';
import { Clock3 } from 'lucide-react';
import ProductCard from './ProductCard';
import { readRecentlyViewed, subscribeToRecentlyViewed } from '../utils/recentlyViewed';

export default function RecentlyViewed({ currentProductId }) {
  const [products, setProducts] = useState(() => readRecentlyViewed().filter((item) => String(item.id) !== String(currentProductId)).slice(0, 4));

  useEffect(() => {
    const load = () => setProducts(readRecentlyViewed().filter((item) => String(item.id) !== String(currentProductId)).slice(0, 4));
    load();
    return subscribeToRecentlyViewed(load);
  }, [currentProductId]);

  if (!products.length) return null;
  return (
    <section className="mt-8" aria-labelledby="recently-viewed-title">
      <div className="mb-4 flex items-center gap-3">
        <span className="rounded-full bg-brand-cream p-2 text-brand-moss"><Clock3 size={20} /></span>
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-sage">Continue exploring</p><h2 id="recently-viewed-title" className="font-serif text-2xl font-bold text-brand-black">Recently viewed</h2></div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
    </section>
  );
}
