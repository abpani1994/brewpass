import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { AuthProvider, useAuth } from "./lib/auth";
import { ToastProvider } from "./components/ui/Toast";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Regulars from "./pages/Regulars";
import Orders from "./pages/Orders";
import Menu from "./pages/Menu";
import Rewards from "./pages/Rewards";
import CustomerOrder from "./pages/CustomerOrder";

function ProtectedRoute({ children }) {
  const { owner, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center" style={{ background: "var(--surface)" }}>
        <Icon icon="ph:spinner-gap" className="animate-spin-slow" width="32" style={{ color: "var(--brand)" }} />
      </div>
    );
  }
  if (!owner) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/register" element={<Auth mode="register" />} />
            <Route path="/order/:token" element={<CustomerOrder />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/regulars" element={<ProtectedRoute><Regulars /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/menu" element={<ProtectedRoute><Menu /></ProtectedRoute>} />
            <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}