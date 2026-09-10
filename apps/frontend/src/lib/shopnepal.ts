export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
export function formatNPR(n:number){ return `Rs. ${Number(n).toLocaleString('en-IN')}`; }
export async function getProducts(){ const r=await fetch(`${API_URL}/api/products`, { next: { revalidate: 60 }}); if(!r.ok) return []; return r.json(); }
export async function getProductBySlug(slug:string){ const r=await fetch(`${API_URL}/api/products/${slug}`, { next: { revalidate: 60 }}); if(!r.ok) return null; return r.json(); }
