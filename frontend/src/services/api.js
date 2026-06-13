const TOKEN_KEY = "brewpass_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

// Auth
export const register = (payload) => request("/auth/register", { method: "POST", body: payload, auth: false });
export const login = (payload) => request("/auth/login", { method: "POST", body: payload, auth: false });
export const fetchMe = () => request("/auth/me");

// Menu
export const fetchMenu = () => request("/menu");
export const createMenuItem = (payload) => request("/menu", { method: "POST", body: payload });
export const updateMenuItem = (id, payload) => request(`/menu/${id}`, { method: "PUT", body: payload });
export const deleteMenuItem = (id) => request(`/menu/${id}`, { method: "DELETE" });

// Customers
export const fetchCustomers = () => request("/customers");
export const createCustomer = (payload) => request("/customers", { method: "POST", body: payload });
export const updateCustomer = (id, payload) => request(`/customers/${id}`, { method: "PUT", body: payload });
export const sendInvite = (id) => request(`/customers/${id}/invite`, { method: "POST" });

// Orders
export const fetchOrders = () => request("/orders");
export const updateOrderStatus = (id, status) => request(`/orders/${id}/status`, { method: "PUT", body: { status } });

// Dashboard
export const fetchDashboard = () => request("/dashboard");

// Rewards
export const fetchRewards = () => request("/rewards");
export const redeemReward = (id) => request(`/rewards/${id}/redeem`, { method: "POST" });

// SMS outbox
export const fetchOutbox = () => request("/sms/outbox");

// Public PWA
export const fetchUsual = (token) => request(`/public/usual/${token}`, { auth: false });
export const placeOrder = (token, payMethod) =>
  request(`/public/order/${token}`, { method: "POST", body: { payMethod }, auth: false });