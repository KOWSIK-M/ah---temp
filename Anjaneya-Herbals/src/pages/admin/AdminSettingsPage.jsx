import React from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Settings, Key, Mail, Bell, Shield, ExternalLink } from "lucide-react";

const AdminSettingsPage = () => {
  const sections = [
    {
      icon: Key,
      title: "Payment Gateway (Razorpay)",
      color: "from-blue-500 to-cyan-500",
      items: [
        { label: "RAZORPAY_KEY_ID", desc: "Your Razorpay Key ID (rzp_test_... or rzp_live_...)" },
        { label: "RAZORPAY_KEY_SECRET", desc: "Your Razorpay Key Secret — never expose publicly" },
      ],
      link: "https://dashboard.razorpay.com/app/keys",
      linkLabel: "Open Razorpay Dashboard →",
    },
    {
      icon: Mail,
      title: "Email (SMTP)",
      color: "from-emerald-500 to-teal-500",
      items: [
        { label: "MAIL_USERNAME", desc: "Gmail address used to send order confirmation emails" },
        { label: "MAIL_PASSWORD",  desc: "Gmail App Password (not your login password)" },
      ],
      link: "https://myaccount.google.com/apppasswords",
      linkLabel: "Create Gmail App Password →",
    },
    {
      icon: Shield,
      title: "Security",
      color: "from-violet-500 to-purple-600",
      items: [
        { label: "JWT_SECRET", desc: "Long random string used to sign JWT tokens (≥ 64 chars)" },
        { label: "GOOGLE_CLIENT_ID / SECRET", desc: "Google OAuth2 credentials for social login" },
      ],
      link: "https://console.cloud.google.com/apis/credentials",
      linkLabel: "Open Google Cloud Console →",
    },
    {
      icon: Bell,
      title: "Other Configuration",
      color: "from-orange-500 to-amber-500",
      items: [
        { label: "DATABASE_URL", desc: "PostgreSQL connection URL" },
        { label: "CLOUDINARY_API_KEY / SECRET", desc: "For product image uploads" },
        { label: "CORS_ORIGINS", desc: "Comma-separated list of allowed frontend origins" },
      ],
      link: null,
      linkLabel: null,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configuration is managed via environment variables — edit your <code className="px-1 py-0.5 bg-slate-100 rounded text-xs font-mono">.env</code> file or deployment secrets.
          </p>
        </div>

        <div className="grid gap-5">
          {sections.map(({ icon: Icon, title, color, items, link, linkLabel }) => (
            <div key={title} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm`}>
                  <Icon size={18} className="text-white" />
                </div>
                <h2 className="text-base font-semibold text-slate-800">{title}</h2>
              </div>

              <div className="space-y-3">
                {items.map(({ label, desc }) => (
                  <div key={label} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <code className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-1 rounded shrink-0 mt-0.5">
                      {label}
                    </code>
                    <p className="text-sm text-slate-600">{desc}</p>
                  </div>
                ))}
              </div>

              {link && (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  <ExternalLink size={13} />
                  {linkLabel}
                </a>
              )}
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-400 text-center pb-4">
          Restart the backend server after updating environment variables.
        </p>
      </div>
    </AdminLayout>
  );
};

export default AdminSettingsPage;
