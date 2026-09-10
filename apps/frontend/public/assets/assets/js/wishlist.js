'use strict';
(function(){
  const KEY='shopnepal_wishlist';
  const get=()=>{ try{ return JSON.parse(localStorage.getItem(KEY)||'[]'); }catch{ return []; } };
  const save=(a)=> localStorage.setItem(KEY, JSON.stringify(a));
  const has=(id)=> get().includes(id);
  const toggle=(id)=>{
    const a=get(); const i=a.indexOf(id);
    if(i>=0) a.splice(i,1); else a.push(id);
    save(a); updateUI(); return i<0;
  };
  function updateUI(){
    const count=get().length;
    document.querySelectorAll('[data-wishlist-count]').forEach(el=> el.textContent=count);
    document.querySelectorAll('[data-wishlist]').forEach(btn=>{
      const id=btn.getAttribute('data-wishlist');
      const on=has(id);
      btn.classList.toggle('is-active', on);
      const icon=btn.querySelector('ion-icon');
      if(icon) icon.setAttribute('name', on ? 'heart' : 'heart-outline');
      btn.style.color = on ? 'var(--salmon-pink)' : '';
    });
  }
  function wire(){
    document.querySelectorAll('.showcase-actions .btn-action').forEach(btn=>{
      if(btn.querySelector('[name="heart-outline"]') || btn.querySelector('[name="heart"]')){
        const card=btn.closest('.showcase');
        const add=card && card.querySelector('[data-add-to-cart]');
        const id= add ? add.getAttribute('data-add-to-cart') : null;
        if(!id) return;
        btn.setAttribute('data-wishlist', id);
        btn.addEventListener('click', (e)=>{
          e.preventDefault();
          const added=toggle(id);
          const title=card.querySelector('.showcase-title')?.textContent||id;
          if(window.ShopNepal && window.ShopNepal.flashMessage) window.ShopNepal.flashMessage(added ? `${title} added to wishlist` : `${title} removed from wishlist`);
        });
      }
    });
    document.querySelectorAll('.action-btn').forEach(btn=>{
      if(btn.querySelector('[name="heart-outline"]')){
        btn.setAttribute('data-wishlist-count','');
        const countEl=btn.querySelector('.count'); if(countEl) countEl.setAttribute('data-wishlist-count','');
        btn.addEventListener('click', (e)=>{ e.preventDefault(); const items=get(); if(!items.length){ if(window.ShopNepal) ShopNepal.flashMessage('Your wishlist is empty'); return; } window.location.href='/wishlist.html'; });
      }
    });
    updateUI();
  }
  window.ShopNepalWishlist={get, has, toggle, updateUI};
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', wire); else wire();
})();
