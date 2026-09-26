export const API_URL = "http://127.0.0.1:8000"
export async function getPosts(){
  const res = await fetch(API_URL + "/api/v1/posts", { cache: 'no-store' })
  return res.json()
}
export async function getApps(){
  const res = await fetch(API_URL + "/api/v1/apps", { cache: 'no-store' })
  return res.json()
}
