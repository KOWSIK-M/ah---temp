import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authApi } from "../../services/api";
import {
  LayoutDashboard, Package, ShoppingCart, Users, LogOut,
  Menu, Bell, ChevronDown, ChevronRight, Shield,
  PlusCircle, Settings, Tag, X,
} from "lucide-react";

/* ── inactivity timeout ─────────────────────────────────── */
const INACTIVITY_TIMEOUT = import.meta.env.DEV
  ? 24 * 60 * 60 * 1000
  : 15 * 60 * 1000;

/* ── nav structure (only routes that actually exist) ─────── */
const NAV_ITEMS = [
  {
    id: "dashboard",
    path: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    id: "products",
    path: "/admin/products",
    label: "Products",
    icon: Package,
    children: [
      { path: "/admin/products", label: "All Products" },
      { path: "/admin/products/new", label: "Add New Product", icon: PlusCircle },
    ],
  },
  {
    id: "orders",
    path: "/admin/orders",
    label: "Orders",
    icon: ShoppingCart,
  },
  {
    id: "customers",
    path: "/admin/customers",
    label: "Customers",
    icon: Users,
  },
  {
    id: "coupons",
    path: "/admin/coupons",
    label: "Coupons",
    icon: Tag,
  },
];

/* ─────────────────────────────────────────────────────────── */
const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  /* sidebar visibility */
  const [collapsed, setCollapsed]     = useState(false); // desktop icon-only mode
  const [drawerOpen, setDrawerOpen]   = useState(false); // mobile drawer
  const [isMobile, setIsMobile]       = useState(() => window.innerWidth < 1024);

  /* sub-menu expand state */
  const [expanded, setExpanded] = useState({});

  /* user-menu dropdown */
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  /* inactivity */
  const [lastActivity, setLastActivity] = useState(Date.now());
  const resetActivity = useCallback(() => setLastActivity(Date.now()), []);

  /* ── effects ──────────────────────────────────────────── */

  /* responsive */
  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setDrawerOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* close mobile drawer on route change */
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  /* close user-menu on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* inactivity tracking */
  useEffect(() => {
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach(e => window.addEventListener(e, resetActivity));
    return () => events.forEach(e => window.removeEventListener(e, resetActivity));
  }, [resetActivity]);

  useEffect(() => {
    const t = setInterval(() => {
      if (Date.now() - lastActivity > INACTIVITY_TIMEOUT) handleLogout();
    }, 60_000);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastActivity]);

  /* auto-expand parent if a child route is active */
  useEffect(() => {
    const updates = {};
    NAV_ITEMS.forEach(item => {
      if (
        item.children &&
        item.children.some(c => location.pathname.startsWith(c.path))
      ) {
        updates[item.id] = true;
      }
    });
    if (Object.keys(updates).length) {
      setExpanded(prev => ({ ...prev, ...updates }));
    }
  }, [location.pathname]);

  /* ── handlers ─────────────────────────────────────────── */
  const handleLogout = async () => {
    try { await authApi.logout(); } catch (_) {}
    navigate("/admin/login");
  };

  const toggleExpanded = (id) =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const isActivePath = (path, exact) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  /* ── sidebar content (render function, NOT a component) ── */
  /*  Using a render-function avoids the "new component type on
      every render" problem that caused React to unmount/remount
      the sidebar (and break Link clicks) on every state change. */
  const renderSidebarContent = (mobile = false) => {
    const showLabels = mobile || !collapsed;

    return (
      <div className="flex flex-col h-full bg-slate-900 text-white">

        {/* ── Logo ── */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700/60 shrink-0">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center shadow-lg shrink-0">
            <Shield size={18} className="text-white" />
          </div>
          {showLabels && (
            <div className="overflow-hidden">
              <p className="font-bold text-white text-sm leading-tight truncate">
                Anjaneya Herbals
              </p>
              <p className="text-xs text-slate-400 truncate">Admin Panel</p>
            </div>
          )}
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {showLabels && (
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-2 mt-1">
              Main Menu
            </p>
          )}

          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active     = isActivePath(item.path, item.exact);
            const hasKids    = !!item.children;
            const kidActive  = hasKids && item.children.some(c => location.pathname.startsWith(c.path));
            const open       = expanded[item.id];

            if (hasKids) {
              return (
                <div key={item.id}>
                  {/* parent toggle button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!showLabels) setCollapsed(false);
                      toggleExpanded(item.id);
                    }}
                    className={[
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                      "transition-colors group",
                      active || kidActive
                        ? "bg-slate-700/60 text-white"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white",
                    ].join(" ")}
                  >
                    <Icon
                      size={18}
                      className={[
                        "shrink-0",
                        active || kidActive ? "text-emerald-400" : "group-hover:text-emerald-400",
                      ].join(" ")}
                    />
                    {showLabels && (
                      <>
                        <span className="flex-1 text-left truncate">{item.label}</span>
                        <ChevronDown
                          size={14}
                          className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                        />
                      </>
                    )}
                  </button>

                  {/* children */}
                  {open && showLabels && (
                    <div className="mt-0.5 ml-3 pl-6 border-l border-slate-700/50 space-y-0.5 pb-1">
                      {item.children.map(child => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={[
                            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                            location.pathname === child.path
                              ? "bg-emerald-500/15 text-emerald-400 font-medium"
                              : "text-slate-400 hover:text-white hover:bg-slate-800",
                          ].join(" ")}
                        >
                          {child.icon && <child.icon size={14} className="shrink-0" />}
                          <span className="truncate">{child.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            /* leaf item */
            return (
              <Link
                key={item.id}
                to={item.path}
                title={!showLabels ? item.label : undefined}
                className={[
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                  "transition-colors group",
                  active
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white",
                ].join(" ")}
              >
                <Icon
                  size={18}
                  className={`shrink-0 ${active ? "text-white" : "group-hover:text-emerald-400"}`}
                />
                {showLabels && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* ── Footer ── */}
        <div className="shrink-0 border-t border-slate-700/60 p-3">
          {showLabels && (
            <div className="flex items-center gap-3 px-2 py-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                A
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-medium text-white truncate">Admin</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  <span className="text-xs text-slate-400">Online</span>
                </div>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            title={!showLabels ? "Logout" : undefined}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm font-medium group"
          >
            <LogOut size={18} className="shrink-0 group-hover:text-red-400" />
            {showLabels && <span>Logout</span>}
          </button>
        </div>
      </div>
    );
  };

  /* ── current page label for breadcrumb ────────────────── */
  const currentPageLabel = NAV_ITEMS.find(n =>
    n.exact
      ? location.pathname === n.path
      : location.pathname.startsWith(n.path)
  )?.label ?? "Dashboard";

  /* ── sidebar widths ───────────────────────────────────── */
  const sidebarWidth = collapsed ? "w-[72px]" : "w-64";

  /* ──────────────────────────────────────────────────────── */
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* ─── Desktop sidebar (always in flow) ─────────────── */}
      <aside
        className={[
          "hidden lg:flex flex-col shrink-0 overflow-hidden",
          "transition-all duration-300 ease-in-out",
          sidebarWidth,
        ].join(" ")}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* ─── Mobile: overlay ──────────────────────────────── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ─── Mobile: drawer ───────────────────────────────── */}
      <aside
        className={[
          "fixed left-0 top-0 h-full w-72 z-50 lg:hidden",
          "transition-transform duration-300 ease-in-out",
          drawerOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* close button inside drawer */}
        <div className="absolute top-4 right-4 z-10">
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        {renderSidebarContent(true)}
      </aside>

      {/* ─── Main area ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top header */}
        <header className="shrink-0 h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-3 shadow-sm z-30">

          {/* Burger button */}
          <button
            type="button"
            onClick={() => isMobile ? setDrawerOpen(d => !d) : setCollapsed(c => !c)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500 flex-1 min-w-0">
            <Link
              to="/admin/dashboard"
              className="hover:text-emerald-600 transition-colors font-medium shrink-0"
            >
              Admin
            </Link>
            <ChevronRight size={14} className="shrink-0 text-slate-400" />
            <span className="text-slate-800 font-semibold truncate">
              {currentPageLabel}
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Bell */}
            <button
              type="button"
              className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(o => !o)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  A
                </div>
                <ChevronDown
                  size={14}
                  className={`text-slate-500 transition-transform hidden sm:block ${userMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900">Admin User</p>
                    <p className="text-xs text-slate-500">Super Administrator</p>
                  </div>
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => { navigate("/admin/settings"); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                    >
                      <Settings size={15} />
                      Settings
                    </button>
                  </div>
                  <div className="border-t border-slate-100 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut size={15} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
