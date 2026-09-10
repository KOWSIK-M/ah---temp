import React, { useMemo, useState } from 'react';
import { CalendarDays, MapPin, RotateCcw, Truck } from 'lucide-react';
import { estimateDelivery } from '../utils/deliveryEstimate';

const formatDate = (date) => date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

export default function DeliveryEstimate() {
  const saved = typeof window === 'undefined' ? '' : window.localStorage.getItem('anjaneya-delivery-pincode') || '';
  const [input, setInput] = useState(saved);
  const [pincode, setPincode] = useState(saved);
  const [error, setError] = useState('');
  const estimate = useMemo(() => estimateDelivery(pincode), [pincode]);
  const submit = (event) => {
    event.preventDefault();
    if (!/^[1-9][0-9]{5}$/.test(input)) { setError('Enter a valid 6-digit Indian PIN code'); return; }
    setError('');
    setPincode(input);
    window.localStorage.setItem('anjaneya-delivery-pincode', input);
  };
  return (
    <div className="mt-6 rounded-2xl border border-brand-sage/25 bg-brand-cream/70 p-4">
      <div className="flex items-center gap-2 text-brand-moss"><Truck size={19} /><h2 className="font-semibold">Check delivery estimate</h2></div>
      <form onSubmit={submit} className="mt-3 flex gap-2">
        <label className="relative min-w-0 flex-1"><span className="sr-only">Delivery PIN code</span><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-sage" size={17} /><input inputMode="numeric" autoComplete="postal-code" maxLength={6} value={input} onChange={(event) => setInput(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter PIN code" className={`h-11 w-full rounded-xl border bg-white pl-9 pr-3 outline-none focus:ring-2 focus:ring-brand-moss/30 ${error ? 'border-red-500' : 'border-brand-sage/30'}`} /></label>
        <button className="h-11 rounded-xl bg-brand-moss px-4 text-sm font-semibold text-white hover:bg-brand-terracotta">Check</button>
      </form>
      {error && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}
      {estimate && !error && <div className="mt-3 flex items-start gap-3 rounded-xl bg-white p-3 text-sm"><CalendarDays className="mt-0.5 shrink-0 text-brand-moss" size={18} /><div className="min-w-0"><p className="font-semibold text-brand-black">Estimated {formatDate(estimate.earliest)} – {formatDate(estimate.latest)}</p><p className="mt-0.5 text-xs text-gray-500">For PIN {pincode}. Final serviceability and date are confirmed at checkout.</p></div><button aria-label="Change PIN code" onClick={() => { setPincode(''); setInput(''); }} className="ml-auto shrink-0 rounded-lg p-1 text-brand-moss hover:bg-green-50"><RotateCcw size={16} /></button></div>}
    </div>
  );
}
