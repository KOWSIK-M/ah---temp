import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { couponApi } from "../../services/api";
import {
  Tag, Plus, Search, Edit2, Trash2, X, Check, AlertCircle,
  Percent, DollarSign, Calendar, Users, ToggleLeft, ToggleRight,
  ChevronDown, Loader2, RefreshCw,
} from "lucide-react";

/* ── helpers ──────────────────────────────────────────────────── */
const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n ?? 0);

const fmtDate = (s) =>
  s ? new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const isExpired = (expiresAt) => expiresAt && new Date(expiresAt) < new Date();

const EMPTY_FORM = {
  code: "",
  description: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  minOrderAmount: "",
  maxDiscountAmount: "",
  maxUses: "",
  expiresAt: "",
  active: true,
};

/* ── StatusBadge ──────────────────────────────────────────────── */
const StatusBadge = ({ coupon }) => {
  if (!coupon.active)
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">Inactive</span>;
  if (isExpired(coupon.expiresAt))
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Expired</span>;
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses)
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">Exhausted</span>;
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Active</span>;
};

/* ── Modal ────────────────────────────────────────────────────── */
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  </div>
);

/* ── CouponForm ───────────────────────────────────────────────── */
const CouponForm = ({ initial, onSave, onCancel, saving }) => {
  const [form, setForm] = useState(() => {
    if (!initial) return EMPTY_FORM;
    return {
      code: initial.code ?? "",
      description: initial.description ?? "",
      discountType: initial.discountType ?? "PERCENTAGE",
      discountValue: initial.discountValue ?? "",
      minOrderAmount: initial.minOrderAmount ?? "",
      maxDiscountAmount: initial.maxDiscountAmount ?? "",
      maxUses: initial.maxUses ?? "",
      expiresAt: initial.expiresAt ? initial.expiresAt.slice(0, 16) : "",
      active: initial.active ?? true,
    };
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.code.trim()) e.code = "Code is required";
    else if (!/^[A-Z0-9_-]+$/.test(form.code)) e.code = "Only uppercase letters, digits, _ and - allowed";
    if (!form.discountValue || isNaN(form.discountValue) || Number(form.discountValue) <= 0)
      e.discountValue = "Enter a positive discount value";
    if (form.discountType === "PERCENTAGE" && Number(form.discountValue) > 100)
      e.discountValue = "Percentage cannot exceed 100";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({
      code: form.code.trim().toUpperCase(),
      description: form.description.trim() || null,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
      maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      expiresAt: form.expiresAt || null,
      active: form.active,
    });
  };

  const field = (label, name, type = "text", placeholder = "", extra = {}) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        type={type}
        value={form[name]}
        onChange={e => set(name, type === "checkbox" ? e.target.checked : e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
          errors[name] ? "border-red-400 bg-red-50" : "border-slate-200 bg-white hover:border-slate-300"
        }`}
        {...extra}
      />
      {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Code */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Coupon Code <span className="text-red-500">*</span></label>
        <input
          value={form.code}
          onChange={e => set("code", e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))}
          placeholder="e.g. SAVE20"
          className={`w-full px-3 py-2 rounded-lg border text-sm font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
            errors.code ? "border-red-400 bg-red-50" : "border-slate-200 bg-white hover:border-slate-300"
          }`}
          disabled={!!initial}
        />
        {initial && <p className="mt-1 text-xs text-slate-400">Coupon code cannot be changed after creation.</p>}
        {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
      </div>

      {field("Description (optional)", "description", "text", "e.g. New user discount")}

      {/* Discount type + value */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Discount Type <span className="text-red-500">*</span></label>
          <div className="relative">
            <select
              value={form.discountType}
              onChange={e => set("discountType", e.target.value)}
              className="w-full px-3 py-2 pr-8 rounded-lg border border-slate-200 bg-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED">Fixed (₹)</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Value <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              {form.discountType === "PERCENTAGE" ? "%" : "₹"}
            </span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.discountValue}
              onChange={e => set("discountValue", e.target.value)}
              placeholder="e.g. 20"
              className={`w-full pl-7 pr-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                errors.discountValue ? "border-red-400 bg-red-50" : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            />
          </div>
          {errors.discountValue && <p className="mt-1 text-xs text-red-500">{errors.discountValue}</p>}
        </div>
      </div>

      {/* Min order + max discount */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Min Order (₹)</label>
          <input
            type="number" min="0" step="1"
            value={form.minOrderAmount}
            onChange={e => set("minOrderAmount", e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
        </div>
        {form.discountType === "PERCENTAGE" && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Max Discount (₹)</label>
            <input
              type="number" min="0" step="1"
              value={form.maxDiscountAmount}
              onChange={e => set("maxDiscountAmount", e.target.value)}
              placeholder="No cap"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
        )}
      </div>

      {/* Max uses + expiry */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Max Uses</label>
          <input
            type="number" min="1" step="1"
            value={form.maxUses}
            onChange={e => set("maxUses", e.target.value)}
            placeholder="Unlimited"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Expires At</label>
          <input
            type="datetime-local"
            value={form.expiresAt}
            onChange={e => set("expiresAt", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
        </div>
      </div>

      {/* Active toggle */}
      <div className="flex items-center gap-3 py-1">
        <button
          type="button"
          onClick={() => set("active", !form.active)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.active ? "bg-emerald-500" : "bg-slate-200"}`}
        >
          <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${form.active ? "translate-x-6" : "translate-x-1"}`} />
        </button>
        <span className="text-sm font-medium text-slate-700">
          {form.active ? "Active — customers can use this coupon" : "Inactive — coupon disabled"}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
          {initial ? "Save Changes" : "Create Coupon"}
        </button>
      </div>
    </form>
  );
};

/* ── AdminCouponsPage ─────────────────────────────────────────── */
const AdminCouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all | active | inactive | expired

  const [modal, setModal] = useState(null); // null | "create" | "edit"
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await couponApi.getAll();
      setCoupons(Array.isArray(data) ? data : data.content ?? []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* filtering */
  const filtered = coupons.filter(c => {
    const matchSearch =
      !search ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      (c.description ?? "").toLowerCase().includes(search.toLowerCase());

    const expired = isExpired(c.expiresAt);
    const exhausted = c.maxUses && c.usedCount >= c.maxUses;
    const effectivelyActive = c.active && !expired && !exhausted;

    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && effectivelyActive) ||
      (filterStatus === "inactive" && !c.active) ||
      (filterStatus === "expired" && (expired || exhausted));

    return matchSearch && matchStatus;
  });

  /* stats */
  const stats = {
    total: coupons.length,
    active: coupons.filter(c => c.active && !isExpired(c.expiresAt) && !(c.maxUses && c.usedCount >= c.maxUses)).length,
    totalUses: coupons.reduce((s, c) => s + (c.usedCount ?? 0), 0),
  };

  /* handlers */
  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (modal === "edit") {
        await couponApi.update(editTarget.id, data);
        showToast("Coupon updated successfully");
      } else {
        await couponApi.create(data);
        showToast("Coupon created successfully");
      }
      setModal(null);
      setEditTarget(null);
      await load();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await couponApi.delete(deleteId);
      showToast("Coupon deleted");
      setDeleteId(null);
      await load();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = async (coupon) => {
    try {
      await couponApi.update(coupon.id, { ...coupon, active: !coupon.active });
      setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, active: !c.active } : c));
      showToast(coupon.active ? "Coupon deactivated" : "Coupon activated");
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  /* ── render ── */
  return (
    <AdminLayout>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
          toast.type === "error" ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
        }`}>
          {toast.type === "error" ? <AlertCircle size={16} /> : <Check size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <Modal title="Delete Coupon" onClose={() => setDeleteId(null)}>
          <p className="text-slate-600 text-sm mb-6">
            Are you sure you want to delete this coupon? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setDeleteId(null)}
              className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
              Delete
            </button>
          </div>
        </Modal>
      )}

      {/* Coupon form modal */}
      {(modal === "create" || modal === "edit") && (
        <Modal
          title={modal === "edit" ? `Edit "${editTarget?.code}"` : "Create New Coupon"}
          onClose={() => { setModal(null); setEditTarget(null); }}
        >
          <CouponForm
            initial={editTarget}
            onSave={handleSave}
            onCancel={() => { setModal(null); setEditTarget(null); }}
            saving={saving}
          />
        </Modal>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Coupons</h1>
            <p className="text-sm text-slate-500 mt-0.5">Create and manage discount coupons</p>
          </div>
          <button
            type="button"
            onClick={() => { setEditTarget(null); setModal("create"); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold shadow-sm shadow-emerald-500/20 transition-colors"
          >
            <Plus size={16} />
            New Coupon
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Coupons", value: stats.total, icon: Tag, color: "from-violet-500 to-purple-600" },
            { label: "Active Coupons", value: stats.active, icon: Check, color: "from-emerald-500 to-teal-500" },
            { label: "Total Redemptions", value: stats.totalUses, icon: Users, color: "from-blue-500 to-cyan-500" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm shrink-0`}>
                <Icon size={20} className="text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{value}</p>
                <p className="text-sm text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex gap-3 flex-wrap items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by code or description…"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1">
              {["all", "active", "inactive", "expired"].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                    filterStatus === s
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={load}
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">Loading coupons…</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <AlertCircle size={32} className="text-red-400" />
              <p className="text-sm font-medium text-slate-600">{error}</p>
              <button
                type="button"
                onClick={load}
                className="text-sm text-emerald-600 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Tag size={36} className="text-slate-200" />
              <p className="text-sm font-medium text-slate-500">
                {search || filterStatus !== "all" ? "No coupons match your filters" : "No coupons yet"}
              </p>
              {!search && filterStatus === "all" && (
                <button
                  type="button"
                  onClick={() => { setEditTarget(null); setModal("create"); }}
                  className="text-sm text-emerald-600 hover:underline"
                >
                  Create your first coupon
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <th className="text-left px-5 py-3.5 font-semibold text-xs text-slate-500 uppercase tracking-wide">Code</th>
                    <th className="text-left px-4 py-3.5 font-semibold text-xs text-slate-500 uppercase tracking-wide hidden md:table-cell">Discount</th>
                    <th className="text-left px-4 py-3.5 font-semibold text-xs text-slate-500 uppercase tracking-wide hidden lg:table-cell">Min Order</th>
                    <th className="text-left px-4 py-3.5 font-semibold text-xs text-slate-500 uppercase tracking-wide">Usage</th>
                    <th className="text-left px-4 py-3.5 font-semibold text-xs text-slate-500 uppercase tracking-wide hidden lg:table-cell">Expires</th>
                    <th className="text-left px-4 py-3.5 font-semibold text-xs text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3.5" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((coupon, idx) => (
                    <tr
                      key={coupon.id}
                      className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${idx % 2 === 0 ? "" : "bg-slate-50/30"}`}
                    >
                      {/* Code */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                            <Tag size={15} className="text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 font-mono tracking-wide">{coupon.code}</p>
                            {coupon.description && (
                              <p className="text-xs text-slate-400 truncate max-w-[160px]">{coupon.description}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Discount */}
                      <td className="px-4 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-1.5">
                          {coupon.discountType === "PERCENTAGE" ? (
                            <Percent size={13} className="text-violet-500" />
                          ) : (
                            <DollarSign size={13} className="text-blue-500" />
                          )}
                          <span className="font-medium text-slate-700">
                            {coupon.discountType === "PERCENTAGE"
                              ? `${coupon.discountValue}%`
                              : fmt(coupon.discountValue)}
                          </span>
                          {coupon.discountType === "PERCENTAGE" && coupon.maxDiscountAmount && (
                            <span className="text-xs text-slate-400">(max {fmt(coupon.maxDiscountAmount)})</span>
                          )}
                        </div>
                      </td>

                      {/* Min order */}
                      <td className="px-4 py-4 hidden lg:table-cell text-slate-600">
                        {coupon.minOrderAmount > 0 ? fmt(coupon.minOrderAmount) : <span className="text-slate-300">—</span>}
                      </td>

                      {/* Usage */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <span className="font-medium text-slate-700">{coupon.usedCount ?? 0}</span>
                            {coupon.maxUses && (
                              <span className="text-slate-400"> / {coupon.maxUses}</span>
                            )}
                          </div>
                          {coupon.maxUses && (
                            <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-emerald-400 transition-all"
                                style={{ width: `${Math.min(100, ((coupon.usedCount ?? 0) / coupon.maxUses) * 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Expires */}
                      <td className="px-4 py-4 hidden lg:table-cell">
                        {coupon.expiresAt ? (
                          <div className="flex items-center gap-1.5">
                            <Calendar size={13} className={isExpired(coupon.expiresAt) ? "text-red-400" : "text-slate-400"} />
                            <span className={isExpired(coupon.expiresAt) ? "text-red-500 text-xs" : "text-slate-600 text-xs"}>
                              {fmtDate(coupon.expiresAt)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs">Never</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <StatusBadge coupon={coupon} />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 justify-end">
                          {/* Toggle active */}
                          <button
                            type="button"
                            onClick={() => toggleActive(coupon)}
                            title={coupon.active ? "Deactivate" : "Activate"}
                            className={`p-1.5 rounded-lg transition-colors ${
                              coupon.active
                                ? "text-emerald-500 hover:bg-emerald-50"
                                : "text-slate-400 hover:bg-slate-100"
                            }`}
                          >
                            {coupon.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => { setEditTarget(coupon); setModal("edit"); }}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={15} />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setDeleteId(coupon.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Footer */}
              <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100 text-xs text-slate-400">
                Showing {filtered.length} of {coupons.length} coupon{coupons.length !== 1 ? "s" : ""}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCouponsPage;
