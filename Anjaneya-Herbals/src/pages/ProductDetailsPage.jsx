import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ChevronRight, Heart, Leaf, Minus, PackageCheck,
  Plus, Share2, ShieldCheck, ShoppingBag, Star, Truck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { productsApi, wishlistApi } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import ProductReviews from '../components/ProductReviews';

const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='720' height='900'%3E%3Crect width='100%25' height='100%25' fill='%23eef2e7'/%3E%3Cpath d='M370 215c100 41 121 146 22 222-72-75-82-154-22-222Zm-12 231c-44-78-112-101-185-65 32 90 101 115 185 65Z' fill='%239CAF88'/%3E%3Ctext x='50%25' y='72%25' text-anchor='middle' font-family='Arial' font-size='34' fill='%23315b45'%3EAnjaneya Herbals%3C/text%3E%3C/svg%3E";

export default function ProductDetailsPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);
  const [openSection, setOpenSection] = useState('details');

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    productsApi.getById(productId)
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    if (!isAuthenticated) return;
    wishlistApi.getAll()
      .then((items) => setWishlisted(items.some((item) => String(item.id) === String(productId))))
      .catch(() => setWishlisted(false));
  }, [isAuthenticated, productId]);

  const images = useMemo(() => {
    if (!product) return [];
    const availableImages = [product.imageUrl, ...(product.additionalImages || [])].filter(Boolean);
    return availableImages.length ? availableImages : [fallbackImage];
  }, [product]);

  const price = Number(product?.price || 0);
  const oldPrice = Number(product?.oldPrice || 0);
  const discount = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
  const stock = Number(product?.stock || 0);

  const addItem = async (goToCheckout = false) => {
    if (!product || stock === 0 || adding) return;
    setAdding(true);
    try {
      await addToCart(product.id, quantity, {
        name: product.name,
        price,
        imageUrl: images[0],
        maxStock: stock,
      });
      toast.success(`${quantity} item${quantity > 1 ? 's' : ''} added to cart`, { id: `detail-cart-${product.id}` });
      if (goToCheckout) navigate('/checkout');
    } catch (error) {
      toast.error(error.message || 'Could not add this product', { id: `detail-cart-${product.id}` });
    } finally {
      setAdding(false);
    }
  };

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/product/${productId}` } });
      return;
    }
    try {
      if (wishlisted) await wishlistApi.remove(product.id);
      else await wishlistApi.add(product.id);
      setWishlisted((value) => !value);
      toast.success(wishlisted ? 'Removed from wishlist' : 'Saved to wishlist', { id: `wishlist-${product.id}` });
    } catch (error) {
      toast.error(error.message || 'Could not update wishlist', { id: `wishlist-${product.id}` });
    }
  };

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: product.name, url: window.location.href });
      else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Product link copied', { id: 'share-product' });
      }
    } catch (error) {
      if (error?.name !== 'AbortError') toast.error('Could not share this product', { id: 'share-product' });
    }
  };

  if (loading) return (
    <main className="botanical-section min-h-screen pt-24 pb-16">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-3xl bg-white/80" />
        <div className="space-y-4 pt-6">{[70, 95, 45, 100, 100].map((width, i) => <div key={i} className="h-7 animate-pulse rounded bg-white/80" style={{ width: `${width}%` }} />)}</div>
      </div>
    </main>
  );

  if (!product) return (
    <main className="botanical-section flex min-h-screen items-center justify-center px-5 pt-24">
      <div className="surface-card max-w-md rounded-3xl p-8 text-center">
        <Leaf className="mx-auto mb-4 text-brand-sage" size={48} />
        <h1 className="font-serif text-3xl text-brand-black">Product unavailable</h1>
        <p className="my-4 text-gray-600">This item may have moved or is no longer available.</p>
        <Link to="/products" className="btn-primary inline-flex">Browse products</Link>
      </div>
    </main>
  );

  return (
    <main className="botanical-section min-h-screen pt-20 sm:pt-24 pb-24 lg:pb-16">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <nav className="mb-4 flex min-w-0 items-center gap-2 overflow-hidden py-2 text-xs sm:text-sm text-gray-500">
          <button onClick={() => navigate(-1)} className="flex flex-shrink-0 items-center gap-1 hover:text-brand-moss"><ArrowLeft size={16} /> Back</button>
          <ChevronRight size={14} className="flex-shrink-0" />
          <Link to="/products" className="flex-shrink-0 hover:text-brand-moss">Products</Link>
          <ChevronRight size={14} className="flex-shrink-0" />
          <span className="truncate text-brand-black">{product.name}</span>
        </nav>

        <section className="surface-card grid min-w-0 overflow-hidden rounded-3xl lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)]">
          <div className="min-w-0 bg-[#eef2e7]/70 p-3 sm:p-6 lg:p-8">
            <div className="relative mx-auto aspect-square max-w-[620px] overflow-hidden rounded-2xl bg-white">
              <img src={images[imageIndex]} alt={product.name} className="h-full w-full object-contain p-3 sm:p-8" />
              {discount > 0 && <span className="absolute left-3 top-3 rounded-full bg-brand-terracotta px-3 py-1.5 text-xs font-bold text-white">{discount}% OFF</span>}
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {images.map((image, index) => (
                  <button key={image} onClick={() => setImageIndex(index)} className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 bg-white ${imageIndex === index ? 'border-brand-moss' : 'border-transparent'}`}>
                    <img src={image} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="min-w-0 p-5 sm:p-8 lg:p-10">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-sage">{product.categoryName || 'Anjaneya Herbals'}</p>
                <h1 className="mt-2 break-words font-serif text-3xl sm:text-4xl font-bold leading-tight text-brand-black">{product.name}</h1>
              </div>
              <div className="flex flex-shrink-0 gap-1">
                <button onClick={toggleWishlist} aria-label="Save to wishlist" className={`rounded-xl p-2.5 ${wishlisted ? 'bg-red-50 text-red-500' : 'bg-brand-cream text-brand-moss'}`}><Heart size={20} className={wishlisted ? 'fill-current' : ''} /></button>
                <button onClick={share} aria-label="Share product" className="rounded-xl bg-brand-cream p-2.5 text-brand-moss"><Share2 size={20} /></button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1 rounded-lg bg-brand-moss px-2 py-1 font-bold text-white">{Number(product.rating || 0).toFixed(1)} <Star size={13} className="fill-current" /></span>
              <button onClick={() => setOpenSection('reviews')} className="text-gray-500 underline-offset-4 hover:underline">{product.reviewCount || 0} customer reviews</button>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{stock > 0 ? `${stock} in stock` : 'Out of stock'}</span>
            </div>

            <div className="mt-6 flex flex-wrap items-baseline gap-3 border-y border-brand-sage/20 py-5">
              <span className="text-3xl font-bold text-brand-moss">₹{price.toLocaleString('en-IN')}</span>
              {oldPrice > price && <span className="text-base text-gray-400 line-through">₹{oldPrice.toLocaleString('en-IN')}</span>}
              <span className="text-xs text-gray-500">Inclusive of taxes</span>
            </div>

            <p className="mt-5 break-words text-sm sm:text-base leading-7 text-gray-600">{product.shortDescription || product.description}</p>

            {(product.weight || product.unit) && <div className="mt-5"><p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Pack size</p><span className="inline-flex rounded-xl border-2 border-brand-moss bg-green-50 px-4 py-2 text-sm font-semibold text-brand-moss">{product.weight} {product.unit}</span></div>}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex h-12 items-center rounded-xl border border-brand-sage/40 bg-white">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="h-full px-3" aria-label="Decrease quantity"><Minus size={16} /></button>
                <span className="w-9 text-center font-semibold">{quantity}</span>
                <button onClick={() => setQuantity((q) => Math.min(stock || 1, q + 1))} className="h-full px-3" aria-label="Increase quantity"><Plus size={16} /></button>
              </div>
              <button onClick={() => addItem(false)} disabled={adding || stock === 0} className="flex h-12 min-w-[150px] flex-1 items-center justify-center gap-2 rounded-xl bg-brand-moss px-5 font-semibold text-white hover:bg-brand-terracotta disabled:opacity-50"><ShoppingBag size={18} /> Add to cart</button>
              <button onClick={() => addItem(true)} disabled={adding || stock === 0} className="h-12 w-full rounded-xl border-2 border-brand-moss px-6 font-semibold text-brand-moss hover:bg-brand-moss hover:text-white sm:w-auto">Buy now</button>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2">
              {[{ icon: Leaf, title: 'Plant based', text: 'Thoughtfully sourced' }, { icon: ShieldCheck, title: 'Secure', text: 'Protected checkout' }, { icon: Truck, title: 'Delivery', text: 'Calculated at checkout' }].map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-2xl bg-brand-cream p-3 text-center"><Icon className="mx-auto text-brand-moss" size={20} /><p className="mt-1 text-xs font-bold">{title}</p><p className="hidden sm:block text-[10px] text-gray-500">{text}</p></div>
              ))}
            </div>
          </div>
        </section>

        <section className="surface-card mt-6 min-w-0 rounded-3xl p-4 sm:p-7">
          <div className="grid grid-cols-2 gap-2 sm:flex">
            {[['details', 'Product details'], ['ingredients', 'Ingredients'], ['usage', 'How to use'], ['reviews', 'Reviews']].map(([id, label]) => (
              <button key={id} onClick={() => setOpenSection(id)} className={`rounded-xl px-3 py-2 text-xs font-semibold sm:flex-shrink-0 sm:rounded-full sm:px-4 sm:text-sm ${openSection === id ? 'bg-brand-moss text-white' : 'bg-brand-cream text-brand-black'}`}>{label}</button>
            ))}
          </div>
          <div className="mt-5 min-w-0 break-words text-sm sm:text-base leading-7 text-gray-600">
            {openSection === 'details' && <><h2 className="mb-2 font-serif text-2xl font-bold text-brand-black">About this product</h2><p>{product.description || product.shortDescription || 'See the product package for details.'}</p>{product.benefits && <div className="mt-4 rounded-2xl bg-green-50 p-4"><p className="font-semibold text-brand-moss">Product information</p><p>{product.benefits}</p></div>}</>}
            {openSection === 'ingredients' && <><h2 className="mb-2 font-serif text-2xl font-bold text-brand-black">Ingredients</h2><p>{product.ingredients || 'Please refer to the package label for the complete ingredient list.'}</p></>}
            {openSection === 'usage' && <><h2 className="mb-2 font-serif text-2xl font-bold text-brand-black">How to use</h2><p>{product.usage || 'Follow the directions printed on the package.'}</p><div className="mt-4 flex gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900"><PackageCheck className="flex-shrink-0" size={20} /><p>Check the package label and stop use if irritation occurs. Product information is not medical advice.</p></div></>}
            {openSection === 'reviews' && <ProductReviews productId={product.id} />}
          </div>
        </section>
      </div>
    </main>
  );
}
