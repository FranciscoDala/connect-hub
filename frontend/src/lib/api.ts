export const API_URL = (
    process.env.NEXT_PUBLIC_API_URL ||
    'https://connect-backend-iern.onrender.com'
).replace(/\/$/, '');

// --- TOKEN ---
export function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem("connect_token");
}

export function saveAuth(token: string, user?: any) {
    localStorage.setItem("connect_token", token);
    if (user) {
        localStorage.setItem("connect_user", JSON.stringify(user));
    }
}

export function clearAuth() {
    localStorage.removeItem("connect_token");
    localStorage.removeItem("connect_user");
}

function authHeader() {
    const t = getToken();
    return t ? { Authorization: `Bearer ${t}` } : {};
}

// --- PUBLIC ---
export async function getPosts() {
    try {
        const res = await fetch(`${API_URL}/api/v1/posts`, {
            next: { revalidate: 60 }
        });
        if (!res.ok) return [];
        return await res.json();
    } catch {
        return [];
    }
}

export async function getApps() {
    try {
        const res = await fetch(`${API_URL}/api/v1/apps`, {
            next: { revalidate: 60 }
        });
        if (!res.ok) return [];
        return await res.json();
    } catch {
        return [];
    }
}

// --- AUTH ---
export async function loginAdmin(email: string, password: string) {
    const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        cache: "no-store"
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.detail || "Email ou senha incorretos");
    }

    const token = data.token || data.access_token;
    saveAuth(token, { email: data.email, role: data.role });

    return data;
}

// --- ADMIN COM TOKEN ---
export async function createPost(data: any) {
    const res = await fetch(`${API_URL}/api/v1/posts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeader()
        } as any,
        body: JSON.stringify(data)
    });

    if (res.status === 401) {
        clearAuth();
        throw new Error("Sessão expirada");
    }

    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Erro ao criar post" }));
        throw new Error(err.detail || "Erro ao criar post");
    }

    return res.json();
}

export async function uploadMedia(file: File) {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch(`${API_URL}/api/v1/upload`, {
        method: "POST",
        headers: { ...authHeader() } as any,
        body: fd
    });

    if (res.status === 401) {
        clearAuth();
        throw new Error("Sessão expirada");
    }

    if (!res.ok) {
        throw new Error("Falha no upload");
    }

    return res.json() as Promise<{
        url: string;
        type: string;
        public_id: string
    }>;
}

export async function deletePost(id: string) {
    const res = await fetch(`${API_URL}/api/v1/posts/${id}`, {
        method: "DELETE",
        headers: { ...authHeader() } as any
    });

    if (res.status === 401) {
        clearAuth();
        throw new Error("Sessão expirada");
    }

    if (!res.ok) {
        throw new Error("Erro ao deletar");
    }

    return res.json();
}
