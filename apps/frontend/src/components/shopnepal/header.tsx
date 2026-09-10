// @ts-nocheck
'use client';
import Link from 'next/link';
import { Search, User, Heart, ShoppingBag, Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
export function Header(){
  const [count,setCount]=useState(0);
  useEffect(()=>{
    const update=()=>{ try{ const c=JSON.parse(localStorage.getItem('shopnepal.cart.v1')||'[]'); setCount(c.reduce((s:any,i:any)=>s+(i.qty||0),0)); }catch{ setCount(0);} };
    update(); window.addEventListener('storage',update); window.addEventListener('shopnepal:cart-changed',update as any);
    return ()=>{ window.removeEventListener('storage',update); window.removeEventListener('shopnepal:cart-changed',update as any); };
  },[]);
  return (
    <header>
      <div className="header-top">
        <div className="container">
          <ul className="header-social-container">
            <li><a href="#" className="social-link"><ion-icon name="logo-facebook"></ion-icon></a></li>
            <li><a href="#" className="social-link"><ion-icon name="logo-twitter"></ion-icon></a></li>
            <li><a href="#" className="social-link"><ion-icon name="logo-instagram"></ion-icon></a></li>
            <li><a href="#" className="social-link"><ion-icon name="logo-linkedin"></ion-icon></a></li>
          </ul>
          <div className="header-alert-news"><p><b>Free Shipping</b> This Week Order Over - Rs. 7,150</p></div>
          <div className="header-top-actions">
            <select name="currency"><option value="npr">NPR Rs.</option></select>
            <select name="language"><option value="en-NP">English (NP)</option><option value="ne-NP">नेपाली</option></select>
          </div>
        </div>
      </div>
      <div className="header-main">
        <div className="container">
          <Link href="/" className="header-logo"><img src="/assets/images/logo/logo.svg" alt="ShopNepal" width={120} height={36}/></Link>
          <div className="header-search-container">
            <input type="search" className="search-field" placeholder="Enter your product name..." id="search-field"/>
            <button className="search-btn" onClick={()=>{
              const el=document.getElementById('search-field') as HTMLInputElement;
              if(el?.value) window.location.href=`/search?q=${encodeURIComponent(el.value)}`;
            }}><ion-icon name="search-outline"></ion-icon></button>
          </div>
          <div className="header-user-actions">
            <Link href="/wishlist" className="action-btn"><ion-icon name="heart-outline"></ion-icon><span className="count">0</span></Link>
            <Link href="/cart" className="action-btn" style={{position:'relative'}}><ion-icon name="bag-handle-outline"></ion-icon><span className="count" data-cart-count>{count}</span></Link>
          </div>
        </div>
      </div>
      <nav className="desktop-navigation-menu">
        <div className="container">
          <ul className="desktop-menu-category-list">
            <li className="menu-category"><Link href="/" className="menu-title">Home</Link></li>
            <li className="menu-category"><Link href="/category" className="menu-title">Categories</Link></li>
            <li className="menu-category"><Link href="/search" className="menu-title">Shop</Link></li>
            <li className="menu-category"><Link href="/track" className="menu-title">Track Order</Link></li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
