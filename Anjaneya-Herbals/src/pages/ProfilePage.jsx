import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ordersApi, addressApi, wishlistApi } from '../services/api';
export default function ProfilePage(){
 const {user,updateProfile,logout}=useAuth(); const [form,setForm]=useState({firstName:user?.firstName||'',lastName:user?.lastName||'',phone:user?.phone||''}),[stats,setStats]=useState(null),[addresses,setAddresses]=useState([]),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{if(!user)return;Promise.all([ordersApi.getAll(0,1),addressApi.getAll(),wishlistApi.getAll()]).then(([orders,addresses,wishlist])=>{setStats({orders:orders.totalElements,wishlist:wishlist.length});setAddresses(addresses);}).catch(e=>setError(e.message));},[user]);
 const save=async e=>{e.preventDefault();setBusy(true);await updateProfile(form);setBusy(false);};
 return <section className="max-w-3xl mx-auto px-6 py-16"><h1 className="text-3xl font-serif mb-6">Your account</h1><p>{user?.email}</p>{error&&<p role="alert">{error}</p>}
 <div className="flex flex-wrap gap-6 my-6"><Link className="underline" to="/orders">Orders {stats?.orders??''}</Link><Link className="underline" to="/wishlist">Wishlist {stats?.wishlist??''}</Link><Link className="underline" to="/forgot-password">Reset password</Link></div>
 <form onSubmit={save} className="space-y-4 bg-white border rounded-xl p-6">{[['firstName','First name'],['lastName','Last name'],['phone','Phone']].map(([key,label])=><label className="block" key={key}>{label}<input className="block w-full border rounded p-3" required={key!=='phone'} maxLength={key==='phone'?10:50} pattern={key==='phone'?'[0-9]{10}':undefined} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/></label>)}<button disabled={busy} className="bg-green-800 text-white rounded px-5 py-3">{busy?'Saving…':'Save profile'}</button></form>
 <h2 className="text-xl font-semibold mt-8 mb-3">Saved addresses</h2>{addresses.length?addresses.map(a=><p className="border rounded p-4 mb-3" key={a.id}>{a.firstName} {a.lastName}, {a.addressLine1}, {a.city}, {a.state} – {a.pincode}</p>):<p>Add a delivery address during checkout.</p>}
 <button className="underline mt-8" onClick={logout}>Sign out</button></section>;
}
