import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ordersApi } from '../services/api';
export default function TrackOrderPage(){
 const {orderId}=useParams(); const [order,setOrder]=useState(null),[error,setError]=useState('');
 useEffect(()=>{let active=true; const load=()=>ordersApi.getById(orderId).then(data=>{if(active){setOrder(data);setError('');}}).catch(e=>{if(active)setError(e.message);});load();const timer=setInterval(load,30000);return()=>{active=false;clearInterval(timer);};},[orderId]);
 const steps=['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED'];
 return <section className="max-w-2xl mx-auto p-6 py-16"><h1 className="text-3xl font-serif mb-6">Track order #{orderId}</h1>
 {error?<p role="alert">{error}</p>:!order?<p>Loading order…</p>:<><p className="mb-4">Current status: <strong>{order.status}</strong></p><p>Payment: {order.paymentStatus}</p>
 {['CANCELLED','REFUNDED'].includes(order.status)?<p>This order is {order.status.toLowerCase()}.</p>:<ol className="space-y-4 my-6">{steps.map((step,index)=><li key={step} className={index<=steps.indexOf(order.status)?'font-semibold text-green-800':'text-gray-500'}>{index<=steps.indexOf(order.status)?'✓':'○'} {step.toLowerCase()}</li>)}</ol>}
 <p className="text-sm text-gray-600">Last updated: {new Date(order.updatedAt).toLocaleString()}. This reflects store updates; a live courier location is not available.</p>
 <p className="mt-4">{order.shippingAddressSnapshot}</p></>}
 <Link className="block underline mt-6" to="/orders">Back to orders</Link></section>;
}
