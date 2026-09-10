import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, HeartHandshake, Leaf, MapPin, PackageCheck, Scale, Sprout, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import herbalTea from '../assets/hero-herbal-tea.jpg';
import turmeric from '../assets/hero-turmeric.jpg';

const values = [
  { icon: Leaf, title: 'Rooted in tradition', text: 'We present herbal and Ayurvedic-inspired products with clear ingredients, directions and responsible product information.' },
  { icon: PackageCheck, title: 'Care in every pack', text: 'Our catalog brings together herbs, personal care, spices and dry fruits in packaging designed for everyday homes.' },
  { icon: Scale, title: 'Honest information', text: 'We aim to describe what a product contains and how it is used without making unsafe or exaggerated medical claims.' },
  { icon: HeartHandshake, title: 'Personal service', text: 'Questions are welcomed before and after purchase, with support connected to our Vijayawada roots.' },
];

const steps = [
  ['01', 'Select thoughtfully', 'Products are chosen for relevance to traditional household wellness and daily nourishment.'],
  ['02', 'Explain clearly', 'Ingredients, pack size, usage and pricing are presented so customers can make an informed choice.'],
  ['03', 'Pack with care', 'Orders are prepared for safe delivery, with status tracking and a detailed invoice.'],
];

export default function AboutPage() {
  return (
    <main className="botanical-section min-h-screen overflow-hidden pt-20 sm:pt-24">
      <section className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_.9fr] lg:px-8 lg:py-20">
        <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
          <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-moss"><Sprout size={16} /> Our story</span>
          <h1 className="mt-6 max-w-3xl font-serif text-4xl font-bold leading-tight text-brand-black sm:text-5xl lg:text-6xl">Traditional goodness for modern homes.</h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-gray-600 sm:text-lg">Anjaneya Herbals is a Vijayawada-based herbal store built around a simple idea: trusted traditional products should be easy to understand, easy to buy and thoughtfully presented.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/products" className="btn-primary inline-flex items-center gap-2">Explore products <ArrowRight size={18} /></Link>
            <Link to="/contact" className="inline-flex items-center rounded-xl border-2 border-brand-moss px-5 py-3 font-semibold text-brand-moss hover:bg-brand-moss hover:text-white">Talk to us</Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-brand-sage/25 pt-6 text-sm text-gray-600">
            <span className="inline-flex items-center gap-2"><MapPin className="text-brand-terracotta" size={18} /> Vijayawada, Andhra Pradesh</span>
            <span className="inline-flex items-center gap-2"><Users className="text-brand-terracotta" size={18} /> Built for families and everyday wellness</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .65, delay: .08 }} className="relative mx-auto w-full max-w-xl">
          <div className="overflow-hidden rounded-[2rem] shadow-[0_28px_80px_rgba(31,79,61,.2)]"><img src={herbalTea} alt="A cup of herbal tea with herbs and flowers" className="aspect-[4/5] w-full object-cover" /></div>
          <div className="absolute -bottom-6 -left-3 w-2/5 overflow-hidden rounded-3xl border-4 border-brand-cream bg-white shadow-xl sm:-left-8"><img src={turmeric} alt="Turmeric and traditional herbal ingredients" className="aspect-square w-full object-cover" /></div>
          <div className="absolute -right-3 top-8 rounded-2xl bg-brand-moss px-5 py-4 text-white shadow-lg sm:-right-6"><Leaf className="mb-2" size={22} /><p className="font-serif text-lg font-bold">Pure choices</p><p className="text-xs text-white/75">Clearly presented</p></div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center"><p className="text-xs font-bold uppercase tracking-[.22em] text-brand-terracotta">What guides us</p><h2 className="mt-3 font-serif text-3xl font-bold text-brand-black sm:text-4xl">Care that goes beyond the product</h2></div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{values.map(({ icon: Icon, title, text }, index) => <motion.article key={title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .25 }} transition={{ delay: index * .06 }} className="surface-card rounded-3xl p-6"><span className="inline-flex rounded-2xl bg-green-50 p-3 text-brand-moss"><Icon size={24} /></span><h3 className="mt-5 font-serif text-xl font-bold text-brand-black">{title}</h3><p className="mt-3 text-sm leading-7 text-gray-600">{text}</p></motion.article>)}</div>
      </section>

      <section className="bg-brand-moss py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr]">
            <div><p className="text-xs font-bold uppercase tracking-[.22em] text-brand-yellow">From shelf to doorstep</p><h2 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">A considered shopping experience</h2><p className="mt-5 max-w-md leading-7 text-white/70">Our website connects product discovery, safe herbal guidance, secure checkout, order tracking and customer support in one place.</p></div>
            <div className="grid gap-4 sm:grid-cols-3">{steps.map(([number, title, text]) => <div key={number} className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur"><span className="font-serif text-3xl text-brand-yellow">{number}</span><h3 className="mt-5 font-serif text-xl font-bold">{title}</h3><p className="mt-3 text-sm leading-6 text-white/70">{text}</p></div>)}</div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:py-20"><img src="/logo-transparent.png" alt="Anjaneya Herbals" className="mx-auto h-24 w-auto object-contain" /><h2 className="mt-5 font-serif text-3xl font-bold text-brand-black">Come discover nature's everyday essentials.</h2><p className="mx-auto mt-4 max-w-2xl leading-7 text-gray-600">Browse our growing collection or visit our store in Vijayawada. We are here to help you understand each product before you choose it.</p><Link to="/stores" className="mt-7 inline-flex items-center gap-2 font-semibold text-brand-moss hover:text-brand-terracotta">Find our store <ArrowRight size={18} /></Link></section>
    </main>
  );
}
