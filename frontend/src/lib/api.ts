export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  'https://connect-backend-iern.onrender.com'
).replace(/\/$/, '');

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem("connect_token");
}

export function saveAuth(token: string, user?: any) {
  if (typeof window === 'undefined') return;
  localStorage.setItem("connect_token", token);
  if (user) localStorage.setItem("connect_user", JSON.stringify(user));
}

export function clearAuth() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem("connect_token");
  localStorage.removeItem("connect_user");
}

export function authHeader() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// PUBLIC
export async function getPosts() {
  try {
    const res = await fetch(`${API_URL}/api/v1/posts`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return await res.json();
  } catch { return []; }
}

// AUTH
export async function loginAdmin(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Credenciais inválidas");
  const token = data.token || data.access_token;
  saveAuth(token, data.user || { email });
  return data;
}
