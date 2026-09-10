'use strict';
const fs = require('fs/promises');
const path = require('path');
const seed = require('../assets/js/products.js');

const FILE = path.join(__dirname, '..', 'data', 'products.json');
let queue = Promise.resolve();

function withLock(fn) {
  const run = queue.then(fn, fn);
  queue = run.then(() => {}, () => {});
  return run;
}

async function readStore() {
  try {
    const raw = JSON.parse(await fs.readFile(FILE, 'utf8'));
    if (Array.isArray(raw)) return raw;
    if (raw.products) return raw.products;
    return raw;
  } catch (err) {
    if (err.code === 'ENOENT') return [...seed.PRODUCTS];
    throw err;
  }
}

async function writeStore(products) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(products, null, 2));
  await fs.rename(tmp, FILE);
}

function slugify(s) {
  return String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || `product-${Date.now()}`;
}

async function list() { return readStore(); }
async function getById(id) { const all = await readStore(); return all.find(p => p.id === id) || null; }
async function getBySlug(slug) { const all = await readStore(); return all.find(p => p.slug === slug) || null; }

async function create(payload) {
  return withLock(async () => {
    const all = await readStore();
    const id = payload.id || `SHOPNEPAL-${String(all.length + 1).padStart(3, '0')}-${Date.now().toString(36)}`;
    if (all.some(p => p.id === id)) throw new Error('Product ID already exists');
    let slug = slugify(payload.slug || payload.title);
    let n = 1; const base = slug;
    while (all.some(p => p.slug === slug)) slug = `${base}-${n++}`;
    const product = {
      id,
      slug,
      title: String(payload.title || 'Untitled').slice(0, 120),
      category: String(payload.category || 'general').slice(0, 40).toLowerCase(),
      badge: payload.badge || null,
      rating: Math.max(1, Math.min(5, Number(payload.rating) || 4)),
      price: Math.max(0, Math.floor(Number(payload.price) || 0)),
      compareAt: payload.compareAt ? Math.floor(Number(payload.compareAt)) : null,
      images: Array.isArray(payload.images) ? payload.images.slice(0, 4) : (payload.image ? [payload.image] : ['/assets/images/products/1.jpg']),
      sizes: payload.sizes ?? null,
      stock: Math.max(0, Math.floor(Number(payload.stock) || 0)),
      description: String(payload.description || '').slice(0, 2000),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (Array.isArray(product.sizes) && product.sizes.length === 0) product.sizes = null;
    if (typeof product.sizes === 'string') product.sizes = product.sizes.split(',').map(s => s.trim()).filter(Boolean);
    all.unshift(product);
    await writeStore(all);
    return product;
  });
}

async function update(id, patch) {
  return withLock(async () => {
    const all = await readStore();
    const idx = all.findIndex(p => p.id === id);
    if (idx === -1) return null;
    const cur = all[idx];
    let slug = cur.slug;
    if (patch.slug || patch.title) {
      const cand = slugify(patch.slug || patch.title || cur.slug);
      if (cand !== cur.slug) {
        let n = 1; let base = cand; let s = cand;
        while (all.some((p, i) => i !== idx && p.slug === s)) s = `${base}-${n++}`;
        slug = s;
      }
    }
    const updated = {
      ...cur,
      ...patch,
      slug,
      title: patch.title !== undefined ? String(patch.title).slice(0, 120) : cur.title,
      category: patch.category !== undefined ? String(patch.category).slice(0, 40).toLowerCase() : cur.category,
      price: patch.price !== undefined ? Math.max(0, Math.floor(Number(patch.price))) : cur.price,
      stock: patch.stock !== undefined ? Math.max(0, Math.floor(Number(patch.stock))) : cur.stock,
      rating: patch.rating !== undefined ? Math.max(1, Math.min(5, Number(patch.rating))) : cur.rating,
      images: patch.images !== undefined ? patch.images : cur.images,
      description: patch.description !== undefined ? String(patch.description).slice(0, 2000) : cur.description,
      updatedAt: new Date().toISOString()
    };
    if (patch.sizes !== undefined) {
      if (patch.sizes === null || patch.sizes === '') updated.sizes = null;
      else if (Array.isArray(patch.sizes)) updated.sizes = patch.sizes;
      else if (typeof patch.sizes === 'string') updated.sizes = patch.sizes.split(',').map(s=>s.trim()).filter(Boolean);
    }
    all[idx] = updated;
    await writeStore(all);
    return updated;
  });
}

async function remove(id) {
  return withLock(async () => {
    const all = await readStore();
    const idx = all.findIndex(p => p.id === id);
    if (idx === -1) return false;
    all.splice(idx, 1);
    await writeStore(all);
    return true;
  });
}

async function decrementStock(lines){
  return withLock(async()=>{
    const all=await readStore(); let changed=false;
    for(const l of lines){
      const p=all.find(x=>x.id===l.id);
      if(p){ p.stock=Math.max(0, (p.stock||0) - Math.floor(Number(l.qty)||0)); p.updatedAt=new Date().toISOString(); changed=true; }
    }
    if(changed) await writeStore(all);
    return all;
  });
}
async function search(q, category){
  const all=await readStore();
  const qq=(q||'').toLowerCase();
  return all.filter(p=>{
    const mQ=!qq || p.title.toLowerCase().includes(qq) || p.category.toLowerCase().includes(qq);
    const mC=!category || p.category.toLowerCase()===category.toLowerCase();
    return mQ && mC;
  });
}
async function lowStock(threshold=5){ const all=await readStore(); return all.filter(p=> (p.stock||0) <= threshold); }

module.exports = { list, getById, getBySlug, create, update, remove, decrementStock, search, lowStock };
