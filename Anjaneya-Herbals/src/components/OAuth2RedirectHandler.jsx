import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { userApi } from "../services/api";

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get("error");

    if (error) {
      console.error("OAuth2 Error:", error);
      toast.error(error);
      navigate("/login");
      return;
    }

    const apiBase =
      import.meta.env.VITE_API_URL ||
      (window?.location?.hostname === "localhost"
        ? "http://localhost:8888/api"
        : "/api");

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    const finalizeOAuthLogin = async () => {
      // Try a few times to fetch profile; if 401 received, try refresh once.
      let lastError = null;
      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          const profile = await userApi.getProfile();
          localStorage.setItem("user", JSON.stringify(profile));
          window.dispatchEvent(
            new CustomEvent("authChange", { detail: { force: true } }),
          );
          toast.success("Signed in successfully");
          navigate("/", { replace: true });
          return;
        } catch (err) {
          lastError = err;

          // If attempt is 1 (after a quick retry), attempt server refresh endpoint
          if (
            attempt === 1 ||
            (err && err.message && err.message.toLowerCase().includes("401"))
          ) {
            try {
              const refreshRes = await fetch(`${apiBase}/auth/refresh`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
              });
              if (refreshRes.ok) {
                // give server a brief moment to set cookies
                await sleep(200);
                continue; // next loop will attempt getProfile again
              }
            } catch (refreshErr) {
              console.error("OAuth refresh attempt failed:", refreshErr);
            }
          }

          // Exponential backoff before retry
          await sleep(250 * Math.pow(2, attempt));
        }
      }

      console.error("OAuth profile sync failed:", lastError);
      toast.error("Could not complete OAuth sign-in. Please try again.");
      // Ensure any stale client state is cleared
      localStorage.removeItem("user");
      window.dispatchEvent(
        new CustomEvent("authChange", { detail: { force: true } }),
      );
      navigate("/login", { replace: true });
    };

    finalizeOAuthLogin();
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-brand-terracotta border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-brand-black font-serif text-lg">Authenticating...</p>
      </div>
    </div>
  );
};

export default OAuth2RedirectHandler;
