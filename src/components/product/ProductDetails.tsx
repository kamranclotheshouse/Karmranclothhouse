'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import CheckoutDrawer from '@/components/checkout/CheckoutDrawer';
import ProductCard from '@/components/product/ProductCard';
import { useCart } from '@/components/cart/CartProvider';
import { trackViewContent } from '@/lib/analytics';
import type { ColorVariant, Product } from '@/lib/data';
import type { StoreSettings } from '@/lib/settings';

export default function ProductDetails({
  product,
  settings,
  related = [],
}: {
  product: Product;
  settings: StoreSettings;
  related?: Product[];
}) {
  const inStock = product.isInStock ?? true;
  const { add } = useCart();

  const availableColors = product.colors.filter((c) => c.inStock);
  const [selectedColor, setSelectedColor] = useState<ColorVariant | undefined>(
    availableColors[0] ?? product.colors[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showAllColors, setShowAllColors] = useState(false);

  useEffect(() => {
    trackViewContent({ slug: product.slug, name: product.name, price: product.price });
  }, [product.slug, product.name, product.price]);

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const legacyWhatsappMsg = encodeURIComponent(
    `السلام علیکم، مجھے یہ fabric order کرنی ہے:\n\n` +
      `Product: ${product.name}\n` +
      `Brand: ${product.brand}\n` +
      (selectedColor ? `Color: ${selectedColor.name}\n` : '') +
      `Qty: ${quantity} piece(s)\n` +
      `Price: Rs. ${(product.price * quantity).toLocaleString()}\n\n` +
      `Please confirm availability & delivery details.`
  );

  const legacyOutOfStockMsg = encodeURIComponent(
    `السلام علیکم، مجھے یہ fabric چاہیے:\n\n` +
      `Product: ${product.name}\n` +
      `Brand: ${product.brand}\n\n` +
      `Yeh website par OUT OF STOCK دکھا رہا ہے۔ کیا یہ دوبارہ available ہو گا؟`
  );

  const whatsappMsg = encodeURIComponent(
    `Assalam-o-Alaikum, mujhe ye fabric order karni hai:\n\n` +
      `Product: ${product.name}\n` +
      `Brand: ${product.brand}\n` +
      (selectedColor ? `Color: ${selectedColor.name}\n` : '') +
      `Quantity: ${quantity} piece(s)\n` +
      `Price: Rs. ${(product.price * quantity).toLocaleString()}\n\n` +
      `Please availability aur delivery details confirm kar dein.`
  );
  const outOfStockMsg = encodeURIComponent(
    `Assalam-o-Alaikum, mujhe is fabric ki availability confirm karwani hai:\n\n` +
      `Product: ${product.name}\n` +
      `Brand: ${product.brand}\n\n` +
      `Website par out of stock show ho raha hai. Kya ye dobara available hai?`
  );
  void legacyWhatsappMsg;
  void legacyOutOfStockMsg;

  const buyNowItem = {
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    price: product.price,
    image: product.images[0],
    color: selectedColor?.name ?? '',
    quantity,
  };

  const handleAddToCart = () => {
    add(buyNowItem);
    setAddedToCart(true);
    window.setTimeout(() => setAddedToCart(false), 2200);
  };

  return (
    <>
      {/* Breadcrumb */}
      <div
        style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-cream)' }}
        className="py-3"
      >
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 text-xs tracking-widest uppercase"
          style={{ color: 'var(--color-fg-muted)' }}
        >
          <Link href="/" className="hover:opacity-50 transition-opacity">
            Home
          </Link>
          <span>/</span>
          <Link href={`/categories/${product.categorySlug}`} className="hover:opacity-50 transition-opacity">
            {product.category}
          </Link>
          <span>/</span>
          <Link href={`/brands/${product.brandSlug}`} className="hover:opacity-50 transition-opacity">
            {product.brand}
          </Link>
          <span>/</span>
          <span className="opacity-50 truncate max-w-[150px]">{product.name}</span>
        </div>
      </div>

      {/* Main Product Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* ── LEFT: Image Gallery ─────────────── */}
            <div className="flex gap-4">
              {/* Thumbnails */}
              <div className="hidden sm:flex flex-col gap-3 w-20">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className="w-20 aspect-square flex-shrink-0 transition-all overflow-hidden border relative"
                    style={{
                      borderColor: activeImage === i ? 'var(--color-border-strong)' : 'var(--color-border)',
                      opacity: activeImage === i ? 1 : 0.65,
                    }}
                    aria-label={`View image ${i + 1}`}
                  >
                    <Image src={img} alt="" fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>

              {/* Main Image */}
              <div className="flex-1">
                <div className="w-full aspect-[3/4] relative overflow-hidden bg-cream border border-line">
                  {discount > 0 && (
                    <span
                      className="absolute top-4 left-4 z-10 text-[10px] tracking-widest uppercase px-2.5 py-1 text-white bg-brand font-medium"
                    >
                      {discount}% Off
                    </span>
                  )}
                  <Image
                    src={product.images[activeImage]}
                    alt={product.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-opacity duration-300"
                  />
                </div>

                {/* Mobile thumbnails */}
                <div className="flex gap-2 mt-3 sm:hidden">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className="w-16 aspect-square overflow-hidden border relative"
                      style={{
                        borderColor: activeImage === i ? 'var(--color-border-strong)' : 'var(--color-border)',
                        opacity: activeImage === i ? 1 : 0.6,
                      }}
                      aria-label={`View image ${i + 1}`}
                    >
                      <Image src={img} alt="" fill sizes="64px" className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT: Product Details ──────────── */}
            <div className="flex flex-col">
              {/* Brand & Category */}
              <div className="flex items-center gap-3 mb-4">
                <Link
                  href={`/brands/${product.brandSlug}`}
                  className="text-xs tracking-[0.3em] uppercase transition-opacity hover:opacity-50"
                  style={{ color: 'var(--color-gold-text)' }}
                >
                  {product.brand}
                </Link>
                <span style={{ color: 'var(--color-border)' }}>·</span>
                <Link
                  href={`/categories/${product.categorySlug}`}
                  className="text-xs tracking-[0.3em] uppercase transition-opacity hover:opacity-50"
                  style={{ color: 'var(--color-fg-muted)' }}
                >
                  {product.category}
                </Link>
              </div>

              {/* Title */}
              <h1
                style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-3xl md:text-4xl tracking-wide mb-6 leading-tight"
              >
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-center gap-4 mb-8">
                <span className="text-2xl font-medium text-ink">Rs. {product.price.toLocaleString()}</span>
                {product.compareAtPrice && (
                  <span className="text-base line-through" style={{ color: 'var(--color-fg-muted)' }}>
                    Rs. {product.compareAtPrice.toLocaleString()}
                  </span>
                )}
                {discount > 0 && (
                  <span
                    className="text-xs tracking-widest uppercase px-2 py-1"
                    style={{ backgroundColor: 'var(--color-cream)', color: 'var(--color-gold-text)' }}
                  >
                    Save {discount}%
                  </span>
                )}
              </div>

              {/* Fabric Specs */}
              <div
                className="grid grid-cols-2 gap-3 mb-8 p-4"
                style={{ backgroundColor: 'var(--color-cream)', border: '1px solid var(--color-border)' }}
              >
                {[
                  { label: 'Fabric', value: product.fabricType },
                  { label: 'Length', value: product.length },
                  { label: 'Width', value: product.width },
                  { label: 'Season', value: product.season },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[10px] tracking-widest uppercase mb-0.5" style={{ color: 'var(--color-fg-muted)' }}>
                      {label}
                    </p>
                    <p className="text-xs font-medium text-ink">{value}</p>
                  </div>
                ))}
              </div>

              {/* Color Picker — hidden until the client adds real colours */}
              {product.colors.length > 0 && selectedColor && (
              <div className="mb-8">
                <p className="text-xs tracking-widest uppercase mb-3">
                  Color: <span className="font-medium text-ink">{selectedColor.name}</span>
                  {!selectedColor.inStock && <span className="ml-2 font-normal" style={{ color: 'var(--color-fg-muted)' }}>(out of stock)</span>}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  {(showAllColors ? product.colors : product.colors.slice(0, 3)).map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      title={color.inStock ? color.name : `${color.name} (out of stock)`}
                      className="w-8 h-8 rounded-full transition-all disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: color.hex,
                        opacity: color.inStock ? 1 : 0.35,
                        outline:
                          selectedColor.name === color.name
                            ? '2px solid var(--color-border-strong)'
                            : '2px solid transparent',
                        outlineOffset: '3px',
                      }}
                      aria-label={color.name}
                    />
                  ))}
                  {product.colors.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setShowAllColors((value) => !value)}
                      className="text-xs font-medium text-brand underline underline-offset-4"
                    >
                      {showAllColors ? 'Show less' : `+${product.colors.length - 3} more`}
                    </button>
                  )}
                </div>
              </div>
              )}

              {/* Quantity */}
              <div className="mb-8">
                <p className="text-xs tracking-widest uppercase mb-3 font-medium">Quantity</p>
                <div className="flex items-center gap-0 border border-line w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-lg font-bold text-ink bg-cream hover:bg-brand hover:text-white transition-colors"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-12 h-10 flex items-center justify-center text-sm font-semibold text-ink bg-white border-x border-line">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-lg font-bold text-ink bg-cream hover:bg-brand hover:text-white transition-colors"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-3 mb-10">
                {inStock ? (
                  <>
                    <button
                      id="btn-order-cod"
                      onClick={() => setDrawerOpen(true)}
                      className="w-full py-4 text-center text-xs tracking-[0.3em] uppercase bg-brand text-white hover:bg-brand-soft transition-colors font-semibold shadow-md"
                    >
                      Order — Cash on Delivery
                    </button>
                    <button
                      id="btn-add-cart"
                      onClick={handleAddToCart}
                      className={`w-full py-4 text-center text-xs tracking-[0.3em] uppercase border font-semibold transition-colors ${
                        addedToCart
                          ? 'bg-cream text-ink border-ink'
                          : 'bg-cream text-ink border-line hover:border-ink'
                      }`}
                      aria-live="polite"
                    >
                      {addedToCart ? '✓ Added to Cart' : 'Add to Cart'}
                    </button>
                  </>
                ) : (
                  <span className="w-full py-4 text-center text-xs tracking-[0.3em] uppercase bg-cream text-muted font-semibold border border-line">
                    Out of Stock
                  </span>
                )}
                <a
                  href={`https://wa.me/${settings.whatsappNumber}?text=${inStock ? whatsappMsg : outOfStockMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 text-center text-xs tracking-[0.3em] uppercase bg-[var(--color-whatsapp)] text-white hover:bg-[var(--color-whatsapp-hover)] transition-colors font-semibold shadow-md flex items-center justify-center gap-2"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                  </svg>
                  <span>Order on WhatsApp</span>
                </a>
              </div>

              {/* Divider */}
              <div style={{ borderTop: '1px solid var(--color-border)' }} className="pt-8">
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-fg-muted)' }}>
                  {product.description}
                </p>
              </div>

              {/* Guarantees */}
              <div className="mt-8 grid grid-cols-3 text-center gap-4">
                {[
                  { icon: '✓', label: '100% Original' },
                  { icon: '⟳', label: 'Easy Returns' },
                  { icon: '🚚', label: 'COD Delivery' },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1">
                    <span className="text-lg">{icon}</span>
                    <span className="text-[10px] tracking-widest uppercase" style={{ color: 'var(--color-fg-muted)' }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section
          className="py-16"
          style={{ backgroundColor: 'var(--color-cream)', borderTop: '1px solid var(--color-border)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-8 gap-4">
              <div>
                <p
                  className="text-[11px] tracking-[0.3em] uppercase mb-2"
                  style={{ color: 'var(--color-gold-text)' }}
                >
                  You may also like
                </p>
                <h2
                  style={{ fontFamily: "'Playfair Display', serif" }}
                  className="text-2xl md:text-3xl tracking-wide"
                >
                  More from {product.category}
                </h2>
              </div>
              <Link
                href={`/categories/${product.categorySlug}`}
                className="text-xs tracking-widest uppercase whitespace-nowrap hover:opacity-50 transition-opacity"
                style={{ color: 'var(--color-fg-muted)' }}
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {related.map((item) => (
                <ProductCard key={item.slug} product={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* COD Checkout Drawer */}
      <CheckoutDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        settings={settings}
        items={[buyNowItem]}
      />
    </>
  );
}
