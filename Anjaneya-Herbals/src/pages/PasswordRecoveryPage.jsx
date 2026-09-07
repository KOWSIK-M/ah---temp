import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { requestJson } from '../services/api';
export default function PasswordRecoveryPage() {
  const location=useLocation(), reset=location.pathname==='/reset-password';
  const [email,setEmail]=useState(''), [password,setPassword]=useState(''), [message,setMessage]=useState(''), [busy,setBusy]=useState(false), [done,setDone]=useState(false);
  const token=new URLSearchParams(location.hash.slice(1)).get('token') || '';
  const submit=async event=>{event.preventDefault();setBusy(true);setMessage('');try {
    const result=await requestJson(`/auth/${reset?'reset-password':'forgot-password'}`,'POST',reset?{token,password}:{email});
    setMessage(result.message);setDone(true);
    if(reset) window.history.replaceState(null,'',location.pathname);
  } catch(error){setMessage(error.message);} finally{setBusy(false);} };
  return <section className="max-w-md mx-auto px-6 py-20"><h1 className="text-3xl font-serif mb-6">{reset?'Choose a new password':'Forgot your password?'}</h1>
    <form onSubmit={submit} className="space-y-5">{reset?<label className="block">New password<input className="block border rounded w-full p-3" type="password" autoComplete="new-password" minLength={8} maxLength={72} required value={password} onChange={e=>setPassword(e.target.value)}/></label>:
    <label className="block">Email address<input className="block border rounded w-full p-3" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label>}
    <button className="bg-green-800 text-white rounded px-5 py-3 disabled:opacity-50" disabled={busy || done || (reset&&!token)}>{busy?'Please wait…':reset?'Reset password':'Send reset link'}</button>
    {reset&&!token&&!done&&<p role="alert">The reset link is incomplete. Request a new one.</p>}
    {message&&<p role="status">{message}</p>}<Link className="block underline" to="/login">Back to sign in</Link></form></section>;
}
