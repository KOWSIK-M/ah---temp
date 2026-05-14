import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatApi } from '../services/api';
import { Link } from 'react-router-dom';
import {
  X, Send, Leaf, Loader2, ShoppingBag, Star, ChevronDown, RotateCcw,
} from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content: "Namaste! I'm **Vaidya**, your Ayurvedic wellness guide at Anjaneya Herbals.\n\nAsk me anything — which herb helps with digestion, what benefits Ashwagandha has, or what to use for hair care. I'll suggest the right products for you.",
  suggestions: [],
};

const SUGGESTED_QUESTIONS = [
  'What helps with hair fall?',
  'Best product for immunity boost',
  'Natural remedy for digestion',
  'Difference between Brahmi and Ashwagandha',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function renderContent(text) {
  // Very lightweight markdown: bold, newlines
  return text
    .split('\n')
    .map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={i}>
          {parts.map((part, j) =>
            part.startsWith('**') && part.endsWith('**')
              ? <strong key={j}>{part.slice(2, -2)}</strong>
              : <span key={j}>{part}</span>
          )}
          {i < text.split('\n').length - 1 && <br />}
        </span>
      );
    });
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ProductCard({ product }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="flex items-center gap-2 bg-white border border-[#5C7A59]/20 rounded-lg p-2 hover:border-[#5C7A59]/60 hover:shadow-sm transition-all group"
    >
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-10 h-10 rounded-md object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-md bg-[#5C7A59]/10 flex items-center justify-center flex-shrink-0">
          <Leaf className="w-5 h-5 text-[#5C7A59]" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 truncate group-hover:text-[#5C7A59]">
          {product.name}
        </p>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-[#5C7A59] font-bold">₹{product.price}</span>
          {product.rating > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-amber-500">
              <Star className="w-2.5 h-2.5 fill-current" />
              {product.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-[#5C7A59] flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
          <Leaf className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div className={`max-w-[82%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1.5`}>
        <div
          className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-[#5C7A59] text-white rounded-tr-sm'
              : 'bg-gray-100 text-gray-800 rounded-tl-sm'
          }`}
        >
          {renderContent(msg.content)}
        </div>

        {/* Product suggestion cards below assistant messages */}
        {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
          <div className="flex flex-col gap-1.5 w-full">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide px-1">
              Suggested Products
            </p>
            {msg.suggestions.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 150);
  }, [isOpen]);

  const buildHistory = useCallback(() =>
    messages
      .filter(m => m.id !== 'welcome' && m.role !== 'error')
      .map(m => ({ role: m.role, content: m.content }))
  , [messages]);

  const sendMessage = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg = { id: Date.now(), role: 'user', content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setError(null);
    setLoading(true);

    try {
      const history = buildHistory();
      const data = await chatApi.sendMessage(trimmed, history);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: data.reply,
          suggestions: data.suggestions || [],
        },
      ]);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: 'I\'m having trouble connecting right now. Please try again in a moment.',
          suggestions: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading, buildHistory]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const resetChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setInput('');
    setError(null);
  };

  return (
    <>
      {/* Floating trigger button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#5C7A59] text-white shadow-lg flex items-center justify-center"
            aria-label="Open Ayurvedic assistant"
          >
            <Leaf className="w-6 h-6" />
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full bg-[#5C7A59]/40 animate-ping" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
            style={{ height: '520px' }}
          >
            {/* Header */}
            <div className="bg-[#5C7A59] text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Leaf className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Vaidya</p>
                  <p className="text-[10px] text-green-200">Ayurvedic Wellness Guide</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={resetChat}
                  title="Clear chat"
                  className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="Close chat"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
              {messages.map((msg) => (
                <Message key={msg.id} msg={msg} />
              ))}

              {/* Loading indicator */}
              {loading && (
                <div className="flex justify-start mb-3">
                  <div className="w-7 h-7 rounded-full bg-[#5C7A59] flex items-center justify-center flex-shrink-0 mr-2">
                    <Leaf className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#5C7A59] rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-[#5C7A59] rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-[#5C7A59] rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested questions (shown only on welcome state) */}
            {messages.length === 1 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-[11px] bg-[#5C7A59]/8 hover:bg-[#5C7A59]/15 text-[#5C7A59] border border-[#5C7A59]/25 rounded-full px-2.5 py-1 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input area */}
            <div className="px-3 pb-3 pt-2 border-t border-gray-100 flex-shrink-0">
              <div className="flex items-end gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 focus-within:border-[#5C7A59]/50">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about herbs, products, wellness..."
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 resize-none outline-none max-h-24"
                  style={{ minHeight: '24px' }}
                  disabled={loading}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={loading || !input.trim()}
                  className="w-8 h-8 rounded-lg bg-[#5C7A59] text-white flex items-center justify-center disabled:opacity-40 hover:bg-[#4a6649] transition-colors flex-shrink-0"
                  aria-label="Send message"
                >
                  {loading
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Send className="w-3.5 h-3.5" />
                  }
                </button>
              </div>
              <p className="text-[9px] text-gray-400 text-center mt-1.5">
                Powered by Claude AI · Not a substitute for medical advice
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
