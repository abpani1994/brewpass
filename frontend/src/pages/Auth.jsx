import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { login, register } from "../services/api";
import { useAuth } from "../lib/auth";

export default function Auth({ mode = "login" }) {
  const isRegister = mode === "register";
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ cafeName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      const data = isRegister
        ? await register(form)
        : await login({ email: form.email, password: form.password });
      signIn(data.token, data.owner);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: "var(--surface)" }}>
      <div className="max-w-6xl w-full mx-auto px-4 md:px-8 h-16 flex items-center">
        <Link to="/" className="flex items-center gap-2 font-semibold" style={{ color: "var(--text-1)" }}>
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-[calc(var(--radius)-0.4rem)]" style={{ background: "var(--brand)" }}>
            <Icon icon="ph:coffee-fill" width="18" color="#1e1e2e" />
          </span>
          <span style={{ fontFamily: "'Gabarito', sans-serif" }}>BrewPass</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <h1
            className="font-semibold mb-1"
            style={{ fontFamily: "'Gabarito', sans-serif", fontSize: "1.75rem", color: "var(--text-1)", letterSpacing: "-0.02em" }}
          >
            {isRegister ? "Start free for one location" : "Welcome back"}
          </h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-2)" }}>
            {isRegister
              ? "Set up your cafe and send your first link in minutes."
              : "Sign in to your morning board."}
          </p>

          <form onSubmit={submit} className="card flex flex-col gap-4">
            {isRegister && (
              <div>
                <label htmlFor="cafeName" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-1)" }}>
                  Cafe name
                </label>
                <input id="cafeName" className="input" value={form.cafeName} onChange={set("cafeName")} placeholder="Bluebird Coffee" required />
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-1)" }}>
                Email
              </label>
              <input id="email" type="email" className="input" value={form.email} onChange={set("email")} placeholder="you@cafe.com" required />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-1)" }}>
                Password
              </label>
              <input id="password" type="password" className="input" value={form.password} onChange={set("password")} placeholder={isRegister ? "At least 8 characters" : "Your password"} required />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm" style={{ color: "#dc2626" }}>
                <Icon icon="ph:warning-circle" width="16" />
                {error}
              </div>
            )}

            <button className="btn-primary w-full" disabled={pending}>
              {pending ? (
                <><Icon icon="ph:spinner-gap" className="animate-spin-slow" width="18" /> Working…</>
              ) : isRegister ? (
                "Create cafe account"
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="text-sm text-center mt-5" style={{ color: "var(--text-2)" }}>
            {isRegister ? (
              <>Already have an account? <Link to="/login" style={{ color: "var(--accent)" }}>Sign in</Link></>
            ) : (
              <>New to BrewPass? <Link to="/register" style={{ color: "var(--accent)" }}>Create an account</Link></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}