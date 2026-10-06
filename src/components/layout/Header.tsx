'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useCart } from '@/components/cart/CartProvider';
import SearchOverlay from '@/components/layout/SearchOverlay';
import CartDrawer from '@/components/cart/CartDrawer';
import CheckoutDrawer from '@/components/checkout/CheckoutDrawer';
import type { StoreSettings } from '@/lib/settings';
import type { Category } from '@/lib/data';

const navBefore = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Brands', href: '/brands' },
];

const navAfter = [
  { label: 'Tailoring', href: '/tailoring' },
  { label: 'Contact Us', href: '/contact' },
];

/** Client-side categories for the dropdown — fetched once on mount. */
function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    let mounted = true;
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => {
        if (mounted && data.categories) setCategories(data.categories);
      });
    return () => { mounted = false; };
  }, []);
  return categories;
}

function isActiveLink(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

function NavTab({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className="relative px-3 py-2 text-sm font-medium transition-all duration-300 nav-link-slide"
      style={{
        fontFamily: "'Outfit', sans-serif",
        color: '#C9A227',
      }}
    >
      {label}
      {active && (
        <span
          className="absolute left-3 right-3 -bottom-0.5 h-[2px] rounded-full transition-all duration-300"
          style={{ backgroundColor: '#C9A227' }}
        />
      )}
    </Link>
  );
}

/** Vertical category dropdown panel — compact & anchored under the Categories tab with side thumbnails. */
function CategoriesDropdown({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <div
      className="absolute top-full left-1/2 -translate-x-1/2 w-[390px] bg-white shadow-2xl border border-line z-50 animate-slide-down overflow-hidden"
      style={{
        boxShadow: '0 20px 45px rgba(10,43,32,0.18)',
      }}
    >
      {/* Top gold line */}
      <div className="h-[2.5px] w-full" style={{ backgroundColor: '#C9A227' }} />

      {/* Vertical list of categories */}
      <div className="max-h-[420px] overflow-y-auto divide-y divide-line/40">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/categories/${cat.slug}`}
            className="group flex items-center gap-3.5 px-4 py-3 bg-white hover:bg-[#F5F0E6] transition-all duration-200"
          >
            {/* Small picture on the side */}
            <div className="relative w-12 h-12 rounded-[2px] overflow-hidden bg-zinc-100 flex-shrink-0 border border-line/60 group-hover:border-[#C9A227] transition-colors">
              <Image
                src={cat.image}
                alt=""
                fill
                sizes="48px"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
              />
            </div>

            {/* Category Name & Tagline */}
            <div className="flex-1 min-w-0">
              <p
                style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-sm font-semibold text-ink group-hover:text-brand transition-colors leading-tight truncate"
              >
                {cat.name}
              </p>
              <p className="text-[11px] text-zinc-500 truncate mt-0.5 group-hover:text-amber-800 transition-colors">
                {cat.sub || 'Premium unstitched collection'}
              </p>
            </div>

            {/* Arrow indicator */}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-zinc-400 group-hover:text-[#C9A227] group-hover:translate-x-1 transition-all flex-shrink-0"
              aria-hidden="true"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>

      {/* Footer link */}
      <div className="p-3 bg-zinc-50 border-t border-line text-center">
        <Link
          href="/categories"
          className="text-[11px] font-bold tracking-[0.2em] uppercase text-gold-text hover:text-brand transition-colors inline-flex items-center gap-2"
        >
          <span>View All Collections</span>
          <span className="text-sm">→</span>
        </Link>
      </div>
    </div>
  );
}

export default function Header({ settings }: { settings: StoreSettings }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [hoverCategories, setHoverCategories] = useState(false);

  const cart = useCart();
  const categories = useCategories();
  const pathname = usePathname();

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* ── Header ── */}
      <header
        style={{ backgroundColor: 'var(--color-green)' }}
        className="sticky top-0 z-50 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-20">
            {/* Mobile: Hamburger */}
            <button
              className="md:hidden p-2 text-white"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle Menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></svg>
              )}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center group py-2">
              <Image
                src="/kamran_logo.png"
                alt="Kamran Cloth House"
                width={385}
                height={119}
                priority
                className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 h-20">
              {navBefore.map((link) => (
                <NavTab
                  key={link.href}
                  {...link}
                  active={isActiveLink(pathname, link.href)}
                />
              ))}

              {/* Categories dropdown — wrapper spans header height so the
                  hover gap between button and panel keeps it open */}
              <div
                className="relative h-full flex items-center"
                onMouseEnter={() => setHoverCategories(true)}
                onMouseLeave={() => setHoverCategories(false)}
                onFocus={() => setHoverCategories(true)}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) {
                    setHoverCategories(false);
                  }
                }}
              >
                <button
                  type="button"
                  onClick={() => setHoverCategories((open) => !open)}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      setHoverCategories(false);
                      event.currentTarget.blur();
                    }
                  }}
                  className="px-3 py-2 text-sm font-medium transition-opacity hover:opacity-70 flex items-center gap-1"
                  style={{ fontFamily: "'Outfit', sans-serif", color: '#C9A227' }}
                  aria-haspopup="true"
                  aria-expanded={hoverCategories}
                >
                  Categories
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                    className={`transition-transform ${hoverCategories ? 'rotate-180' : ''}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {hoverCategories && <CategoriesDropdown categories={categories} />}
              </div>

              {navAfter.map((link) => (
                <NavTab
                  key={link.href}
                  {...link}
                  active={isActiveLink(pathname, link.href)}
                />
              ))}
            </nav>

            {/* Icons */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-white hover:text-gold transition-colors"
                aria-label="Search"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </button>

              <Link
                href="/track"
                className="hidden sm:block p-2 text-white hover:text-gold transition-colors"
                aria-label="Track your order"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </Link>

              <button
                onClick={() => setCartOpen(true)}
                className="p-2 text-white hover:text-gold transition-colors relative"
                aria-label={cart.count > 0 ? `Basket, ${cart.count} items` : 'Basket'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                {cart.count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gold text-ink text-[10px] font-bold leading-[18px] text-center tabular-nums">
                    {cart.count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div
            style={{ borderTop: '1px solid rgba(201,162,39,0.25)', backgroundColor: '#0E3B2C' }}
            className="md:hidden px-6 pb-6 pt-4 flex flex-col gap-4 animate-slide-down"
          >
            <button
              onClick={() => { closeMenu(); setSearchOpen(true); }}
              className="flex items-center gap-3 text-sm font-medium hover:opacity-70 transition-opacity"
              style={{ color: '#C9A227' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              Search
            </button>

            {[...navBefore, ...navAfter].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="text-sm font-medium hover:opacity-70 transition-opacity"
                style={{ color: '#C9A227' }}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile categories list */}
            <details className="group">
              <summary
                className="flex items-center justify-between text-sm font-medium hover:opacity-70 transition-opacity cursor-pointer list-none py-1"
                style={{ color: '#C9A227' }}
              >
                <span>Categories</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-open:rotate-180"><path d="M6 9l6 6 6-6"/></svg>
              </summary>
              <div className="mt-2.5 space-y-1.5 pl-2 border-l border-[#C9A227]/30">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/categories/${cat.slug}`}
                    onClick={closeMenu}
                    className="flex items-center gap-3 px-2 py-1.5 text-sm hover:opacity-85 transition-opacity rounded-sm"
                    style={{ color: '#F5F0E6' }}
                  >
                    <div className="relative w-8 h-8 rounded-[2px] overflow-hidden bg-white/10 flex-shrink-0 border border-[#C9A227]/30">
                      <Image
                        src={cat.image}
                        alt=""
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs leading-tight truncate">{cat.name}</p>
                      {cat.sub && <p className="text-[10px] text-zinc-400 truncate">{cat.sub}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </details>

            <Link
              href="/track"
              onClick={closeMenu}
              className="text-sm font-medium hover:opacity-70 transition-opacity text-left"
              style={{ color: '#C9A227' }}
            >
              Track Order
            </Link>

            <button
              onClick={() => { closeMenu(); setCartOpen(true); }}
              className="text-sm font-medium hover:opacity-70 transition-opacity text-left"
              style={{ color: '#C9A227' }}
            >
              Basket{cart.count > 0 ? ` (${cart.count})` : ''}
            </button>
          </div>
        )}
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        settings={settings}
        items={cart.items}
        setQty={cart.setQty}
        remove={cart.remove}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      <CheckoutDrawer
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        settings={settings}
        items={cart.items}
        onPlaced={cart.clear}
      />
    </>
  );
}
