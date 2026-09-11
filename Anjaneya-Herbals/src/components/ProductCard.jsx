import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';
import { optimizeCloudinaryImage } from '../utils/imageOptimization';

const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='600'%3E%3Crect width='100%25' height='100%25' fill='%23eef2e7'/%3E%3Cpath d='M245 145c68 28 82 99 15 151-49-51-56-105-15-151Zm-8 157c-30-53-76-69-126-44 22 61 69 78 126 44Z' fill='%239CAF88'/%3E%3Ctext x='50%25' y='72%25' text-anchor='middle' font-family='Arial' font-size='24' fill='%23315b45'%3EAnjaneya Herbals%3C/text%3E%3C/svg%3E";

export default function ProductCard({ product, priority = false }) {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const oldPrice = Number(product.oldPrice || 0);
  const price = Number(product.price || 0);
  const discount = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
  const rawImage = product.image || product.imageUrl || fallbackImage;
  const imageSrc = optimizeCloudinaryImage(rawImage, 600);

  const handleAdd = async (event) => {
    event.preventDefault();
    if (adding || product.stock === 0) return;
    setAdding(true);
    try {
      await addToCart(product.id, 1, {
        name: product.name,
        price,
        imageUrl: product.image || product.imageUrl,
        maxStock: product.stock,
      });
      setAdded(true);
      toast.success('Added to cart', { id: `cart-${product.id}` });
      setTimeout(() => setAdded(false), 1800);
    } catch (error) {
      toast.error(error.message || 'Could not add this item', { id: `cart-${product.id}` });
    } finally {
      setAdding(false);
    }
  };

  return (
    <article className="group surface-card rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col min-w-0 h-full transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(30,58,47,.15)]">
      <Link to={`/product/${product.id}`} className="relative block aspect-[4/5] overflow-hidden bg-[#eef2e7]">
        <img
          src={imageSrc}
          alt={product.name}
          width="600"
          height="750"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = fallbackImage; }}
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/25 to-transparent" />
        <div className="absolute left-2 top-2 sm:left-3 sm:top-3 flex flex-col items-start gap-1.5">
          {discount > 0 && <span className="rounded-full bg-brand-terracotta px-2.5 py-1 text-[10px] sm:text-xs font-bold text-white shadow">{discount}% OFF</span>}
          {product.featured && <span className="rounded-full bg-brand-moss/90 px-2.5 py-1 text-[10px] font-semibold text-white">Bestseller</span>}
        </div>
        {product.stock === 0 && <span className="absolute inset-x-3 bottom-3 rounded-xl bg-white/95 py-2 text-center text-xs font-semibold text-red-600">Out of stock</span>}
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="mb-1 truncate text-[10px] sm:text-xs font-semibold uppercase tracking-[0.12em] text-brand-sage">{product.category || 'Herbal care'}</p>
        <Link to={`/product/${product.id}`} className="min-w-0">
          <h3 className="line-clamp-2 min-h-[2.6rem] text-sm sm:text-base font-semibold leading-snug text-brand-black transition-colors group-hover:text-brand-terracotta">{product.name}</h3>
        </Link>
        {product.shortDescription && <p className="mt-1 hidden sm:block line-clamp-2 text-xs leading-relaxed text-gray-500">{product.shortDescription}</p>}

        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <span className="inline-flex items-center gap-1 rounded-md bg-brand-moss px-1.5 py-1 font-bold text-white">
            {Number(product.rating || 0).toFixed(1)} <Star size={11} className="fill-current" />
          </span>
          <span className="truncate text-gray-400">{product.reviews || 0} reviews</span>
        </div>

        <div className="mt-auto pt-3">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-lg sm:text-xl font-bold text-brand-moss">₹{price.toLocaleString('en-IN')}</span>
            {oldPrice > price && <span className="text-xs text-gray-400 line-through">₹{oldPrice.toLocaleString('en-IN')}</span>}
          </div>
          {(product.weight || product.unit) && <p className="text-[10px] text-gray-400">{product.weight} {product.unit}</p>}
          <button
            type="button"
            onClick={handleAdd}
            disabled={adding || product.stock === 0}
            className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand-moss px-2 py-2 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-brand-terracotta disabled:cursor-not-allowed disabled:opacity-50"
          >
            {added ? <Check size={16} /> : <ShoppingCart size={16} />}
            <span>{added ? 'Added' : product.stock === 0 ? 'Unavailable' : 'Add to cart'}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
