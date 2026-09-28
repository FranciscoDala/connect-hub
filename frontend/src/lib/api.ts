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
