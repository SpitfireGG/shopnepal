/**
 * Dynamic navigation.
 *
 * Fills every menu on the page from the derived category list: the desktop
 * menu and its dropdown panels, the mobile menu, the sidebar accordion and the
 * footer category columns. None of it is hardcoded any more - add a product in
 * a new category and it appears in all four.
 *
 * Each region is optional; whichever mount points exist on the page get filled.
 */

'use strict';

(function () {
  const ShopNepal = window.ShopNepal;

  const escape = (s) =>
    String(s).replace(/[&<>"']/g, (c) => `&${{ '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot', "'": '#39' }[c]};`);

  const categoryUrl = (c) => `/category.html?c=${encodeURIComponent(c.slug)}`;

  /** Fixed destinations that sit alongside the generated category entries. */
  const STATIC_LINKS = [
    { label: 'Home', href: '/' },
    { label: 'Track order', href: '/track.html' },
    { label: 'Wishlist', href: '/wishlist.html' },
  ];

  /** Split a list into `n` roughly equal columns for the dropdown panels. */
  function columns(items, n) {
    const perColumn = Math.ceil(items.length / n) || 1;
    const out = [];
    for (let i = 0; i < items.length; i += perColumn) out.push(items.slice(i, i + perColumn));
    return out;
  }

  // ---------------------------------------------------------------------
  // Desktop menu
  // ---------------------------------------------------------------------

  function desktopMenu(categories) {
    const featured = categories.slice(0, 4);

    const dropdown = `
      <div class="dropdown-panel">
        ${columns(categories, 4)
          .map(
            (col) => `
          <ul class="dropdown-panel-list">
            <li class="menu-title"><a href="/category.html">${escape(col[0].label)}</a></li>
            ${col
              .map(
                (c) => `
              <li class="panel-list-item">
                <a href="${categoryUrl(c)}">${escape(c.label)} <span class="nav-count">${c.count}</span></a>
              </li>`
              )
              .join('')}
          </ul>`
          )
          .join('')}
      </div>`;

    return `
      <ul class="desktop-menu-category-list">

        <li class="menu-category"><a href="/" class="menu-title">Home</a></li>

        <li class="menu-category">
          <a href="/category.html" class="menu-title">Categories</a>
          ${dropdown}
        </li>

        ${featured
          .map(
            (c) => `
          <li class="menu-category">
            <a href="${categoryUrl(c)}" class="menu-title">${escape(c.label)}</a>
            <ul class="dropdown-list">
              ${c.products
                .slice(0, 6)
                .map(
                  (p) => `
                <li class="dropdown-item">
                  <a href="/product/${escape(p.slug)}">${escape(p.title)}</a>
                </li>`
                )
                .join('')}
              <li class="dropdown-item">
                <a href="${categoryUrl(c)}"><strong>View all ${c.count}</strong></a>
              </li>
            </ul>
          </li>`
          )
          .join('')}

        <li class="menu-category"><a href="/track.html" class="menu-title">Track order</a></li>
        <li class="menu-category"><a href="/wishlist.html" class="menu-title">Wishlist</a></li>

      </ul>`;
  }

  // ---------------------------------------------------------------------
  // Mobile menu
  // ---------------------------------------------------------------------

  function mobileMenu(categories) {
    return `
      <div class="menu-top">
        <h2 class="menu-title">Menu</h2>
        <button class="menu-close-btn" data-mobile-menu-close-btn aria-label="Close menu">
          <ion-icon name="close-outline"></ion-icon>
        </button>
      </div>

      <ul class="mobile-menu-category-list">

        <li class="menu-category"><a href="/" class="menu-title">Home</a></li>

        <li class="menu-category">
          <button class="accordion-menu" data-accordion-btn>
            <p class="menu-title">Categories</p>
            <div>
              <ion-icon name="add-outline" class="add-icon"></ion-icon>
              <ion-icon name="remove-outline" class="remove-icon"></ion-icon>
            </div>
          </button>

          <ul class="submenu-category-list" data-accordion>
            ${categories
              .map(
                (c) => `
              <li class="submenu-category">
                <a href="${categoryUrl(c)}" class="submenu-title">
                  ${escape(c.label)} <span class="nav-count">${c.count}</span>
                </a>
              </li>`
              )
              .join('')}
          </ul>
        </li>

        ${categories
          .slice(0, 3)
          .map(
            (c) => `
          <li class="menu-category">
            <button class="accordion-menu" data-accordion-btn>
              <p class="menu-title">${escape(c.label)}</p>
              <div>
                <ion-icon name="add-outline" class="add-icon"></ion-icon>
                <ion-icon name="remove-outline" class="remove-icon"></ion-icon>
              </div>
            </button>
            <ul class="submenu-category-list" data-accordion>
              ${c.products
                .slice(0, 6)
                .map(
                  (p) => `
                <li class="submenu-category">
                  <a href="/product/${escape(p.slug)}" class="submenu-title">${escape(p.title)}</a>
                </li>`
                )
                .join('')}
            </ul>
          </li>`
          )
          .join('')}

        <li class="menu-category"><a href="/track.html" class="menu-title">Track order</a></li>
        <li class="menu-category"><a href="/wishlist.html" class="menu-title">Wishlist</a></li>

      </ul>`;
  }

  // ---------------------------------------------------------------------
  // Sidebar accordion
  // ---------------------------------------------------------------------

  function sidebar(categories) {
    return `
      <div class="sidebar-top">
        <h2 class="sidebar-title">Category</h2>
        <button class="sidebar-close-btn" data-mobile-menu-close-btn aria-label="Close">
          <ion-icon name="close-outline"></ion-icon>
        </button>
      </div>

      <ul class="sidebar-menu-category-list">
        ${categories
          .map(
            (c) => `
          <li class="sidebar-menu-category">
            <button class="sidebar-accordion-menu" data-accordion-btn>
              <div class="menu-title-flex">
                <img src="${c.icon}" alt="${escape(c.label)}" width="20" height="20" class="menu-title-img">
                <p class="menu-title">${escape(c.label)}</p>
              </div>
              <div>
                <ion-icon name="add-outline" class="add-icon"></ion-icon>
                <ion-icon name="remove-outline" class="remove-icon"></ion-icon>
              </div>
            </button>

            <ul class="sidebar-submenu-category-list" data-accordion>
              ${c.products
                .slice(0, 8)
                .map(
                  (p) => `
                <li class="sidebar-submenu-category">
                  <a href="/product/${escape(p.slug)}" class="sidebar-submenu-title">
                    <p class="product-name">${escape(p.title)}</p>
                    <data value="${p.price}" class="stock">${ShopNepal.formatNPR(p.price)}</data>
                  </a>
                </li>`
                )
                .join('')}
              <li class="sidebar-submenu-category">
                <a href="${categoryUrl(c)}" class="sidebar-submenu-title">
                  <p class="product-name"><strong>View all ${c.count}</strong></p>
                </a>
              </li>
            </ul>
          </li>`
          )
          .join('')}
      </ul>`;
  }

  // ---------------------------------------------------------------------
  // Footer
  // ---------------------------------------------------------------------

  function footerCategories(categories) {
    const [first, ...rest] = columns(categories, 3);

    return `
      <div class="container">
        <div class="footer-category-box">
          <h2 class="category-box-title">Shop by category</h2>
          ${(first || [])
            .map((c) => `<a href="${categoryUrl(c)}" class="footer-nav-link">${escape(c.label)}</a>`)
            .join('')}
        </div>

        ${rest
          .map(
            (col) => `
          <div class="footer-category-box">
            <h2 class="category-box-title">${escape(col[0].label)}</h2>
            ${col
              .map((c) => `<a href="${categoryUrl(c)}" class="footer-category-link">${escape(c.label)}</a>`)
              .join('')}
          </div>`
          )
          .join('')}
      </div>`;
  }

  // ---------------------------------------------------------------------

  /**
   * The template's accordion handler runs once on load, before these menus
   * exist. Rebinding here keeps the generated accordions working, and a flag
   * stops a second bind if this ever runs twice.
   */
  function wireAccordions(root) {
    root.querySelectorAll('[data-accordion-btn]').forEach((btn) => {
      if (btn.dataset.accordionBound) return;
      btn.dataset.accordionBound = 'true';

      btn.addEventListener('click', function () {
        const panel = this.nextElementSibling;
        const wasOpen = panel && panel.classList.contains('active');

        if (!wasOpen) {
          // Close siblings, so the accordion behaves like the original.
          const scope = this.closest('ul');
          if (scope) {
            scope.querySelectorAll('[data-accordion].active').forEach((el) => el.classList.remove('active'));
            scope.querySelectorAll('[data-accordion-btn].active').forEach((el) => el.classList.remove('active'));
          }
        }

        if (panel) panel.classList.toggle('active');
        this.classList.toggle('active');
      });
    });
  }

  /** Mobile menu open/close, rebound because the markup is generated. */
  function wireMobileMenu() {
    const overlay = document.querySelector('[data-overlay]');
    const menus = document.querySelectorAll('[data-mobile-menu]');

    document.querySelectorAll('[data-mobile-menu-open-btn]').forEach((btn, i) => {
      if (btn.dataset.menuBound) return;
      btn.dataset.menuBound = 'true';
      btn.addEventListener('click', () => {
        const menu = menus[i] || menus[0];
        if (menu) menu.classList.add('active');
        if (overlay) overlay.classList.add('active');
      });
    });

    const close = () => {
      menus.forEach((m) => m.classList.remove('active'));
      if (overlay) overlay.classList.remove('active');
    };

    document.querySelectorAll('[data-mobile-menu-close-btn]').forEach((btn) => {
      if (btn.dataset.menuBound) return;
      btn.dataset.menuBound = 'true';
      btn.addEventListener('click', close);
    });

    if (overlay && !overlay.dataset.menuBound) {
      overlay.dataset.menuBound = 'true';
      overlay.addEventListener('click', close);
    }
  }

  async function mount() {
    const targets = {
      desktop: document.querySelector('[data-nav-desktop]'),
      mobile: document.querySelector('[data-nav-mobile]'),
      sidebar: document.querySelector('[data-nav-sidebar]'),
      footer: document.querySelector('[data-nav-footer]'),
    };

    if (!Object.values(targets).some(Boolean)) return;

    let categories;
    try {
      ({ categories } = await ShopNepal.loadCatalog());
    } catch {
      return;
    }
    if (!categories.length) return;

    if (targets.desktop) targets.desktop.innerHTML = desktopMenu(categories);
    if (targets.mobile) targets.mobile.innerHTML = mobileMenu(categories);
    if (targets.sidebar) targets.sidebar.innerHTML = sidebar(categories);
    if (targets.footer) targets.footer.innerHTML = footerCategories(categories);

    wireAccordions(document);
    wireMobileMenu();

    document.dispatchEvent(new CustomEvent('shopnepal:nav-ready', { detail: { categories } }));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();

  ShopNepal.nav = { mount, STATIC_LINKS };
})();
