import React, { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { ZoomIn, ZoomOut, X, ChevronLeft, ChevronRight, Scan } from 'lucide-react';

export default function ProductImageGallery({ images, productName, discount = 0 }) {
  const [selected, setSelected] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const choose = (index) => { setSelected(index); setZoom(1); setHovered(false); };
  const step = (direction) => choose((selected + direction + images.length) % images.length);
  const control = 'inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white text-brand-moss shadow-sm transition-colors hover:bg-green-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-moss disabled:opacity-40';
  return <>
    <div className="space-y-3 lg:sticky lg:top-28">
      <div className="relative overflow-hidden rounded-2xl border border-brand-sage/15 bg-white">
        <button type="button" aria-label={`Enlarge image of ${productName}`} className="block aspect-square w-full cursor-zoom-in overflow-hidden focus-visible:outline-2 focus-visible:outline-brand-moss"
          onPointerMove={(event) => {
            if (event.pointerType !== 'mouse') return;
            const box = event.currentTarget.getBoundingClientRect();
            setOrigin(`${(event.clientX - box.left) / box.width * 100}% ${(event.clientY - box.top) / box.height * 100}%`);
            setHovered(true);
          }} onPointerLeave={() => setHovered(false)} onClick={() => { setOpen(true); setHovered(false); }}>
          <img src={images[selected]} alt={`${productName} — image ${selected + 1}`} draggable={false}
            className="h-full w-full object-contain p-4 transition-transform duration-200 motion-reduce:transition-none sm:p-6"
            style={{ transform: hovered ? 'scale(2.5)' : 'scale(1)', transformOrigin: origin }} />
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full bg-brand-moss px-4 py-2.5 text-xs font-semibold text-white shadow-lg"><ZoomIn size={17} /> Zoom</span>
        </button>
        {discount > 0 && <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-brand-terracotta px-3 py-1.5 text-xs font-bold text-white">{discount}% OFF</span>}
        {images.length > 1 && <div className="absolute inset-x-3 top-1/2 flex -translate-y-1/2 justify-between pointer-events-none">
          <button aria-label="Previous image" onClick={() => step(-1)} className={`${control} pointer-events-auto`}><ChevronLeft size={20} /></button>
          <button aria-label="Next image" onClick={() => step(1)} className={`${control} pointer-events-auto`}><ChevronRight size={20} /></button>
        </div>}
      </div>
      <p className="flex items-center justify-center gap-2 text-xs text-gray-500"><Scan size={14} /><span className="hidden lg:inline">Hover to explore · </span>Tap image to enlarge</p>
      {images.length > 1 && <div className="flex gap-2 overflow-x-auto p-1">
        {images.map((src, index) => <button key={`${src}-${index}`} aria-label={`View image ${index + 1}`} aria-pressed={selected === index} onClick={() => choose(index)} className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-white p-1 ${selected === index ? 'border-brand-moss' : 'border-transparent hover:border-brand-sage'}`}><img src={src} alt="" className="h-full w-full object-contain" /></button>)}
      </div>}
    </div>
    <Dialog open={open} onClose={() => setOpen(false)} className="relative z-[200]">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-6">
        <DialogPanel className="flex h-[90dvh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-brand-cream shadow-2xl" onKeyDown={(event) => {
          if (event.key === 'ArrowRight') { event.preventDefault(); step(1); }
          if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
        }}>
          <div className="flex items-center justify-between gap-3 border-b border-brand-sage/20 p-3 sm:px-6">
            <DialogTitle className="truncate font-serif text-lg text-brand-moss">{productName}</DialogTitle>
            <button autoFocus aria-label="Close image viewer" onClick={() => setOpen(false)} className={control}><X size={21} /></button>
          </div>
          <div className="min-h-0 flex-1 overflow-auto overscroll-contain bg-white" tabIndex={0} aria-label="Product image; scroll to explore when zoomed">
            <div className="flex items-center justify-center" style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }}>
              <img src={images[selected]} alt={`${productName} enlarged — image ${selected + 1}`} className="h-full w-full object-contain p-4" draggable={false} />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 border-t border-brand-sage/20 p-3">
            {images.length > 1 && <button aria-label="Previous enlarged image" onClick={() => step(-1)} className={control}><ChevronLeft size={20} /></button>}
            <button aria-label="Zoom out" disabled={zoom === 1} onClick={() => setZoom((value) => Math.max(1, value - 0.5))} className={control}><ZoomOut size={20} /></button>
            <span className="w-12 text-center text-sm tabular-nums" aria-live="polite">{zoom * 100}%</span>
            <button aria-label="Zoom in" disabled={zoom === 3} onClick={() => setZoom((value) => Math.min(3, value + 0.5))} className={control}><ZoomIn size={20} /></button>
            {images.length > 1 && <button aria-label="Next enlarged image" onClick={() => step(1)} className={control}><ChevronRight size={20} /></button>}
            <p className="w-full text-center text-xs text-gray-500">Image {selected + 1} of {images.length} · Zoom in, then scroll or swipe to explore</p>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  </>;
}
