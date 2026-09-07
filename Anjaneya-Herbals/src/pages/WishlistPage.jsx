import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { wishlistApi } from '../services/api';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';
export default function WishlistPage() {
  const [items,setItems]=useState([]), [loading,setLoading]=useState(true), [error,setError]=useState(''), [busy,setBusy]=useState(null);
  const { addToCart }=useCart();
  const load=async()=>{ setLoading(true); try { setItems(await wishlistApi.getAll()); setError(''); } catch(e) { setError(e.message); } finally {setLoading(false);} };
  useEffect(()=>{load();},[]);
  const act=async(item,remove)=>{setBusy(item.id); try { if(remove) {await wishlistApi.remove(item.id); setItems(old=>old.filter(p=>p.id!==item.id));} else {await addToCart(item.id,1,item); toast.success('Added to cart');} } catch(e) {toast.error(e.message);} finally {setBusy(null);} };
  return <section className="max-w-5xl mx-auto px-6 py-16"><h1 className="text-3xl font-serif mb-6">Your wishlist</h1>
    {loading ? <p>Loading wishlist…</p> : error ? <p role="alert">{error} <button onClick={load}>Retry</button></p> : !items.length ? <p>No saved products yet. <Link className="underline" to="/products">Explore products</Link></p> :
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{items.map(item=><article key={item.id} className="bg-white rounded-xl border p-5">
      <Link to={`/product/${item.id}`}><img src={item.imageUrl} alt={item.name} className="w-full h-48 object-contain"/><h2 className="font-semibold my-3">{item.name}</h2></Link>
      <p>₹{Number(item.price).toFixed(2)} · {item.stock>0?'In stock':'Out of stock'}</p>
      <button disabled={busy===item.id || !(item.stock>0)} onClick={()=>act(item,false)} className="bg-green-800 text-white rounded px-4 py-2 mt-4 disabled:opacity-50">Add to cart</button>
      <button disabled={busy===item.id} onClick={()=>act(item,true)} className="ml-4 underline">Remove</button>
    </article>)}</div>}
  </section>;
}
