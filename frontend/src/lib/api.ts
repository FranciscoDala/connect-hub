export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://connect-backend-iern.onrender.com').replace(/\/$/, '');

export async function getPosts() {
    const res = await fetch(`${API_URL}/api/v1/posts`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return res.json();
}

export async function getApps() {
    const res = await fetch(`${API_URL}/api/v1/apps`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return res.json();
}

// --- PARA O LOGIN / ADMIN ---
export async function loginAdmin(email: string, password: string) {
    const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error("Login falhou");
    return res.json(); // espera { token }
}

export async function createPost(data: any, token: string) {
    const res = await fetch(`${API_URL}/api/v1/posts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    return res.json();
}
