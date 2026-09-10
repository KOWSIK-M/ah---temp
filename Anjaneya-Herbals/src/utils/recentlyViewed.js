const STORAGE_KEY = 'anjaneya-recently-viewed';
const CHANGE_EVENT = 'anjaneya:recently-viewed';
const MAX_ITEMS = 8;

export const readRecentlyViewed = () => {
  if (typeof window === 'undefined') return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

export const rememberProduct = (product) => {
  if (typeof window === 'undefined' || !product?.id) return;
  const summary = {
    id: product.id,
    name: product.name,
    price: product.price,
    oldPrice: product.oldPrice,
    imageUrl: product.imageUrl,
    rating: product.rating,
    reviewCount: product.reviewCount,
    stock: product.stock,
    categoryId: product.categoryId,
    categoryName: product.categoryName,
    featured: product.featured,
  };
  const next = [summary, ...readRecentlyViewed().filter((item) => String(item.id) !== String(product.id))].slice(0, MAX_ITEMS);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
};

export const subscribeToRecentlyViewed = (listener) => {
  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener('storage', listener);
  };
};
