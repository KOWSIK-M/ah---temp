import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersApi, paymentApi } from '../services/api';
import toast from 'react-hot-toast';
export default function OrdersPage() {
  const [orders,setOrders]=useState([]), [page,setPage]=useState(0), [pages,setPages]=useState(1), [error,setError]=useState(''), [loading,setLoading]=useState(true), [busy,setBusy]=useState(null);
  const [returnId,setReturnId]=useState(null),[reason,setReason]=useState('');
  const load=async()=>{setLoading(true);try{const data=await ordersApi.getAll(page,10);setOrders(data.content);setPages(data.totalPages);setError('');}catch(e){setError(e.message);}finally{setLoading(false);}};
  useEffect(()=>{load();},[page]);
  const action=async(id,fn)=>{setBusy(id);try{await fn();await load();}catch(e){toast.error(e.message);}finally{setBusy(null);}};
  const pay=async order=>{await action(order.id,async()=>{
    if(!window.Razorpay) await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://checkout.razorpay.com/v1/checkout.js';script.onload=resolve;script.onerror=()=>reject(new Error('Payment gateway unavailable'));document.body.append(script);});
    const checkout=await paymentApi.createRazorpayOrder({orderId:order.id});
    new window.Razorpay({key:checkout.keyId,amount:checkout.amount,currency:checkout.currency,order_id:checkout.razorpayOrderId,name:'Anjaneya Herbals',
      handler:response=>action(order.id,async()=>{await paymentApi.verifyRazorpayPayment({razorpayOrderId:response.razorpay_order_id,razorpayPaymentId:response.razorpay_payment_id,razorpaySignature:response.razorpay_signature});toast.success('Payment confirmed');}),
      modal:{ondismiss:load}}).open();
  });};
  return <section className="max-w-4xl mx-auto px-6 py-16"><h1 className="text-3xl font-serif mb-6">Your orders</h1>
    {error&&<p role="alert">{error} <button onClick={load}>Retry</button></p>}{loading&&<p>Loading orders…</p>}
    {!loading&&!error&&!orders.length&&<p>You have no orders yet. <Link className="underline" to="/products">Browse products</Link></p>}
    <div className="space-y-5">{orders.map(order=><article className="border bg-white rounded-xl p-5" key={order.id}>
      <div className="flex justify-between gap-4"><h2 className="font-semibold">Order #{order.id}</h2><span>{order.status}</span></div>
      <p className="text-sm my-2">{new Date(order.createdAt).toLocaleDateString()} · {order.payment?.method} · {order.paymentStatus}</p>
      <ul>{order.items.map(item=><li key={item.productId}>{item.productName} × {item.quantity}</li>)}</ul>
      <p className="font-semibold mt-3">Total ₹{Number(order.totalAmount).toFixed(2)}</p>
      <div className="flex flex-wrap gap-4 mt-4"><Link className="underline" to={`/orders/${order.id}`}>Details</Link><Link className="underline" to={`/track-order/${order.id}`}>Track order</Link>
        {order.paymentStatus==='AWAITING_PAYMENT'&&order.status==='PENDING'&&<button disabled={busy===order.id} onClick={()=>pay(order)}>Complete payment</button>}
        {['PENDING','CONFIRMED','PROCESSING'].includes(order.status)&&<button disabled={busy===order.id} onClick={()=>action(order.id,()=>ordersApi.cancel(order.id))}>Cancel order</button>}
        {order.status==='DELIVERED'&&!order.returnRequestedAt&&<button onClick={()=>{setReturnId(order.id);setReason('');}}>Request return</button>}
      </div>
      {order.returnRequestedAt&&<p className="mt-3">Return request received: {order.returnReason}. Support will review your request.</p>}
      {returnId===order.id&&<form className="mt-4" onSubmit={e=>{e.preventDefault();action(order.id,async()=>{await ordersApi.requestReturn(order.id,reason);setReturnId(null);toast.success('Return request saved');});}}>
        <label className="block">Reason for return<textarea className="border rounded w-full p-2" required maxLength={1000} value={reason} onChange={e=>setReason(e.target.value)}/></label>
        <button className="bg-green-800 text-white px-4 py-2 rounded" disabled={busy===order.id}>Submit request</button><button type="button" className="ml-4" onClick={()=>setReturnId(null)}>Close</button>
      </form>}
    </article>)}</div>
    <div className="flex gap-4 mt-6"><button disabled={page===0||loading} onClick={()=>setPage(page-1)}>Previous</button><span>Page {page+1} of {Math.max(pages,1)}</span><button disabled={page+1>=pages||loading} onClick={()=>setPage(page+1)}>Next</button></div>
  </section>;
}
