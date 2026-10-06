'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AdminField,
  AdminInput,
  AdminSection,
  AdminTextarea,
  AdminSelect,
  notify,
} from '@/components/admin/ui';
import { DEFAULT_HERO_CONTENT, type HeroContent, type HeroSlide } from '@/lib/hero';
import { CloudinaryUploader } from '@/components/admin/CloudinaryUploader';
import {
  hasHeroErrors,
  validateHero,
  type HeroErrors,
  type HeroSlideFormValues,
} from '@/lib/admin/validate-hero';

interface SlideFormValues extends Partial<HeroSlideFormValues> {
  id?: string;
  sortOrder?: number;
  isActive?: boolean;
}

function slideToForm(slide: HeroSlide): SlideFormValues {
  return {
    id: slide.id,
    imageUrl: slide.imageUrl,
    eyebrow: slide.eyebrow,
    titleLine1: slide.titleLine1,
    titleLine2: slide.titleLine2,
    subtitle: slide.subtitle,
    ctaPrimaryLabel: slide.ctaPrimaryLabel,
    ctaPrimaryHref: slide.ctaPrimaryHref,
    ctaSecondaryLabel: slide.ctaSecondaryLabel,
    ctaSecondaryHref: slide.ctaSecondaryHref,
    sortOrder: slide.sortOrder,
    isActive: slide.isActive,
  };
}

function emptySlide(): SlideFormValues {
  return {
    id: '',
    imageUrl: '/images/hero.jpg',
    eyebrow: 'Shafi Market · Saddar · Peshawar',
    titleLine1: '',
    titleLine2: '',
    subtitle: '',
    ctaPrimaryLabel: '',
    ctaPrimaryHref: '/categories/winter-fabric',
    ctaSecondaryLabel: '',
    ctaSecondaryHref: '/categories/dulha-design',
    sortOrder: 0,
    isActive: true,
  };
}

type PromoBanner = HeroSlide | null;

export function HeroEditor({ hero, promo }: { hero: HeroContent; promo: PromoBanner }) {
  const router = useRouter();
  const [slides, setSlides] = useState<SlideFormValues[]>(() =>
    hero.slides.length > 0 ? hero.slides.map(slideToForm) : [emptySlide()]
  );
  const [promoValues, setPromoValues] = useState<SlideFormValues>(() =>
    promo ? { ...slideToForm(promo), isActive: true } : emptySlide()
  );
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [errors, setErrors] = useState<Record<number, HeroErrors>>({});
  const [promoErrors, setPromoErrors] = useState<HeroErrors>({});
  const [busy, setBusy] = useState(false);
  const [promoBusy, setPromoBusy] = useState(false);

  const currentSlide = slides[Math.min(activeSlideIndex, slides.length - 1)];
  const isFirstSlide = activeSlideIndex === 0;

  const setSlide = (index: number, key: keyof SlideFormValues, value: string) =>
    setSlides((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });

  const setSlideProp = (index: number, key: keyof SlideFormValues, value: string | number | boolean) =>
    setSlides((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });

  const setPromo = (key: keyof SlideFormValues, value: string) =>
    setPromoValues((prev) => ({ ...prev, [key]: value }));

  const validateSlide = (index: number) => {
    const fieldErrors = validateHero(slides[index] as HeroSlideFormValues);
    setErrors((prev) => ({ ...prev, [index]: fieldErrors }));
    return fieldErrors;
  };

  const validatePromo = () => {
    const fieldErrors = validateHero(promoValues as HeroSlideFormValues);
    setPromoErrors(fieldErrors);
    return fieldErrors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);

    let hasErrors = false;
    const newErrors: Record<number, HeroErrors> = {};
    for (let i = 0; i < slides.length; i++) {
      const err = validateHero(slides[i] as HeroSlideFormValues);
      if (hasHeroErrors(err)) {
        newErrors[i] = err;
        hasErrors = true;
      }
    }
    setErrors(newErrors);
    if (hasErrors) {
      notify('Kuch slides me errors hain — neeche dekhein.', 'error');
      setBusy(false);
      return;
    }

    try {
      const payload = {
        slides: slides.map((s, i) => ({
          id: s.id,
          imageUrl: s.imageUrl,
          eyebrow: s.eyebrow,
          titleLine1: s.titleLine1,
          titleLine2: s.titleLine2,
          subtitle: s.subtitle,
          ctaPrimaryLabel: s.ctaPrimaryLabel,
          ctaPrimaryHref: s.ctaPrimaryHref,
          ctaSecondaryLabel: s.ctaSecondaryLabel,
          ctaSecondaryHref: s.ctaSecondaryHref,
          sortOrder: s.sortOrder ?? i,
          isActive: s.isActive ?? true,
        })),
      };

      const res = await fetch('/api/admin/home', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        if (data.errors) {
          const mapped: Record<number, HeroErrors> = {};
          for (const [key, err] of Object.entries(data.errors)) {
            if (key.startsWith('slides[')) {
              const idx = parseInt(key.match(/slides\[(\d+)\]/)?.[1] ?? '0', 10);
              mapped[idx] = err as HeroErrors;
            }
          }
          setErrors(mapped);
        }
        notify(data.error ?? 'Save nahi ho saka.', 'error');
        return;
      }

      notify('Hero carousel save ho gaya — ab live hai.');
      setErrors({});
      router.refresh();
    } catch {
      notify('Network problem — kuch save nahi hua.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handlePromoSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const promoHasContent = ['imageUrl', 'eyebrow', 'titleLine1', 'titleLine2', 'subtitle', 'ctaPrimaryLabel', 'ctaPrimaryHref', 'ctaSecondaryLabel', 'ctaSecondaryHref']
      .some((f) => {
        const val = promoValues[f as keyof SlideFormValues];
        return typeof val === 'string' && val.trim().length > 0;
      });

    if (promoHasContent) {
      const fieldErrors = validateHero(promoValues as HeroSlideFormValues);
      if (hasHeroErrors(fieldErrors)) {
        setPromoErrors(fieldErrors);
        notify('Promo banner me errors hain.', 'error');
        return;
      }
    }

    setPromoBusy(true);
    try {
      await updatePromoBanner(promoValues);
      notify(promoHasContent ? 'Winter banner save ho gaya.' : 'Winter banner hata diya gaya.');
      setPromoErrors({});
      router.refresh();
    } catch {
      notify('Network problem — promo save nahi hua.', 'error');
    } finally {
      setPromoBusy(false);
    }
  };

  const addSlide = () => {
    if (slides.length >= 5) {
      notify('Maximum 5 slides allowed.', 'error');
      return;
    }
    const newSlide = emptySlide();
    newSlide.sortOrder = slides.length;
    setSlides((prev) => [...prev, newSlide]);
    setActiveSlideIndex(slides.length);
  };

  const removeSlide = (index: number) => {
    if (slides.length <= 1) {
      notify('At least one slide is required.', 'error');
      return;
    }
    const next = slides.filter((_, i) => i !== index);
    next.forEach((s, i) => (s.sortOrder = i));
    setSlides(next);
    setActiveSlideIndex(Math.min(activeSlideIndex, next.length - 1));
  };

  const moveSlide = (from: number, to: number) => {
    const next = [...slides];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    next.forEach((s, i) => (s.sortOrder = i));
    setSlides(next);
    setActiveSlideIndex(to);
  };

  const restoreDefaults = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/admin/home', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slides: DEFAULT_HERO_CONTENT.slides }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        notify(data.error ?? 'Reset nahi ho saka.', 'error');
        return;
      }
      notify('Default hero wapas aa gaya.');
      setSlides(DEFAULT_HERO_CONTENT.slides.map(slideToForm));
      setActiveSlideIndex(0);
      router.refresh();
    } catch {
      notify('Network problem — reset nahi hua.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Hero Carousel Slides */}
      <AdminSection
        step={1}
        title="Hero Carousel"
        description="Website khulte hi customer ye dekhta hai. Multiple slides add karein — har slide ek big deal / collection highlight karta hai. Arrows + dots automatic dikhenge."
        action={
          <>
            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--sm"
              onClick={addSlide}
              disabled={busy || slides.length >= 5}
            >
              + Add Slide
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--sm"
              onClick={restoreDefaults}
              disabled={busy}
            >
              Restore default
            </button>
          </>
        }
      >
        {/* Slide Navigation Tabs */}
        {slides.length > 1 && (
          <div className="admin-slide-tabs" style={{ marginBottom: 16 }}>
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveSlideIndex(i)}
                className={`admin-tab ${i === activeSlideIndex ? 'active' : ''}`}
                style={{
                  padding: '8px 16px',
                  marginRight: 8,
                  border: '1px solid var(--color-border)',
                  background: i === activeSlideIndex ? 'var(--color-brand)' : 'white',
                  color: i === activeSlideIndex ? 'white' : 'var(--color-ink)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 500,
                }}
              >
                Slide {i + 1}
                {slides.length > 1 && i !== 0 && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeSlide(i); }}
                    style={{ marginLeft: 6, color: 'var(--color-fg-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                    aria-label={`Delete slide ${i + 1}`}
                  >
                    ×
                  </button>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Reorder controls */}
        {slides.length > 1 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--sm"
              onClick={() => moveSlide(activeSlideIndex, activeSlideIndex - 1)}
              disabled={activeSlideIndex === 0 || busy}
            >
              ↑ Move Up
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--sm"
              onClick={() => moveSlide(activeSlideIndex, activeSlideIndex + 1)}
              disabled={activeSlideIndex === slides.length - 1 || busy}
            >
              ↓ Move Down
            </button>
          </div>
        )}

        {/* Active Slide Form */}
        <AdminSection
          title={`Slide ${activeSlideIndex + 1}${slides.length > 1 ? ` of ${slides.length}` : ''}`}
        >
          <div className="admin-grid">
            <AdminField
              label="Eyebrow"
              required
              hint="Heading ke upar chhota gold line — jaise “Shafi Market · Saddar · Peshawar”."
              error={errors[activeSlideIndex]?.eyebrow}
            >
              <AdminInput
                value={currentSlide.eyebrow}
                onChange={(e) => setSlide(activeSlideIndex, 'eyebrow', e.target.value)}
                placeholder="Shafi Market · Saddar · Peshawar"
                aria-invalid={Boolean(errors[activeSlideIndex]?.eyebrow)}
              />
            </AdminField>

            <AdminField
              label="Background image"
              hint="Hero poora screen bharta hai — 1920 × 1080 px (16:9 landscape) banayein. Text baen (left) taraf aata hai, is liye photo ka main subject dayen (right) taraf rakhein."
              error={errors[activeSlideIndex]?.imageUrl}
            >
              <CloudinaryUploader
                single
                images={currentSlide.imageUrl ? [currentSlide.imageUrl] : []}
                onChange={(next) => setSlide(activeSlideIndex, 'imageUrl', next[0] ?? '')}
                hint="1920 × 1080 px (16:9), max 15 MB — subject right side"
                emptyHint="Abhi hero photo nahi. Widescreen photo yahan upload karein."
                ariaLabel="Upload hero background image"
              />
            </AdminField>
          </div>

          <div className="admin-grid">
            <AdminField
              label="Heading — line 1"
              required
              hint="Do shabd se zyada na ho — bara font hai, mobile pe ho jata hai."
              error={errors[activeSlideIndex]?.titleLine1}
            >
              <AdminInput
                value={currentSlide.titleLine1}
                onChange={(e) => setSlide(activeSlideIndex, 'titleLine1', e.target.value)}
                placeholder="Peshawar's"
                aria-invalid={Boolean(errors[activeSlideIndex]?.titleLine1)}
              />
            </AdminField>

            <AdminField
              label="Heading — line 2"
              hint="Apne aap doosri line par aata hai. Khali chhod dein to sirf ek line dikhegi."
              error={errors[activeSlideIndex]?.titleLine2}
            >
              <AdminInput
                value={currentSlide.titleLine2}
                onChange={(e) => setSlide(activeSlideIndex, 'titleLine2', e.target.value)}
                placeholder="Finest Fabric"
              />
            </AdminField>
          </div>

          <AdminField
            label="Supporting paragraph"
            required
            hint="1–2 lines. Apne sabse strong brands aur kya bikta hai uska zikr karein."
            error={errors[activeSlideIndex]?.subtitle}
            note={
              <p className="admin-hint" style={{ marginTop: 4 }}>
                {currentSlide.subtitle?.length ?? 0}/400 characters
                {(currentSlide.subtitle?.length ?? 0) > 320 ? ' — mobile pe lamba ho sakta hai' : ''}
              </p>
            }
          >
            <AdminTextarea
              rows={3}
              value={currentSlide.subtitle ?? ''}
              onChange={(e) => setSlide(activeSlideIndex, 'subtitle', e.target.value)}
              aria-invalid={Boolean(errors[activeSlideIndex]?.subtitle)}
              maxLength={400}
            />
          </AdminField>

          <AdminField
            label="Sort order"
            hint="Kam number = pehle dikhega. Auto-set hota hai, manually change kar sakte hain."
          >
            <AdminInput
              type="number"
              value={currentSlide.sortOrder ?? 0}
              onChange={(e) => setSlideProp(activeSlideIndex, 'sortOrder', parseInt(e.target.value, 10))}
            />
          </AdminField>

          <AdminField
            label="Active"
            hint="Uncheck to hide this slide without deleting it."
          >
            <select
              value={currentSlide.isActive ? 'true' : 'false'}
              onChange={(e) => setSlideProp(activeSlideIndex, 'isActive', e.target.value === 'true')}
              className="w-full px-4 py-3 bg-white border border-line text-sm text-ink focus:outline-none focus:border-brand transition-colors"
            >
              <option value="true">Active</option>
              <option value="false">Hidden</option>
            </select>
          </AdminField>

          <AdminField
            label="Slide ID (auto)"
            hint="Naye slides ke liye khali chhod dein. Edit karte waqt yahan ID dikhegi."
          >
            <AdminInput
              value={currentSlide.id ?? ''}
              disabled
              placeholder="Auto-generated on save"
            />
          </AdminField>
        </AdminSection>

        {/* Buttons for Active Slide */}
        <AdminSection
          step={2}
          title="Buttons (for this slide)"
          description="Do buttons heading ke neeche aate hain. Links internal (`/…`) ya poore `https://…` ho sakte hain."
        >
          <div className="admin-grid">
            <AdminField
              label="Primary button — label"
              required
              hint="Safed button, jaise “Winter Collection”."
              error={errors[activeSlideIndex]?.ctaPrimaryLabel}
            >
              <AdminInput
                value={currentSlide.ctaPrimaryLabel}
                onChange={(e) => setSlide(activeSlideIndex, 'ctaPrimaryLabel', e.target.value)}
                placeholder="Winter Collection"
                aria-invalid={Boolean(errors[activeSlideIndex]?.ctaPrimaryLabel)}
              />
            </AdminField>

            <AdminField
              label="Primary button — link"
              required
              hint="Kahan jaye. Internal page `/` se shuru hota hai, jaise /categories/winter-fabric"
              error={errors[activeSlideIndex]?.ctaPrimaryHref}
            >
              <AdminInput
                value={currentSlide.ctaPrimaryHref}
                onChange={(e) => setSlide(activeSlideIndex, 'ctaPrimaryHref', e.target.value)}
                placeholder="/categories/winter-fabric"
                aria-invalid={Boolean(errors[activeSlideIndex]?.ctaPrimaryHref)}
              />
            </AdminField>

            <AdminField
              label="Secondary button — label"
              hint="Kaala button, jaise “Dulha Design”. Khali chhod dein to doosra button chhup jayega."
              error={errors[activeSlideIndex]?.ctaSecondaryLabel}
            >
              <AdminInput
                value={currentSlide.ctaSecondaryLabel}
                onChange={(e) => setSlide(activeSlideIndex, 'ctaSecondaryLabel', e.target.value)}
                placeholder="Dulha Design"
                aria-invalid={Boolean(errors[activeSlideIndex]?.ctaSecondaryLabel)}
              />
            </AdminField>

            <AdminField
              label="Secondary button — link"
              hint="Jaise /categories/dulha-design"
              error={errors[activeSlideIndex]?.ctaSecondaryHref}
            >
              <AdminInput
                value={currentSlide.ctaSecondaryHref}
                onChange={(e) => setSlide(activeSlideIndex, 'ctaSecondaryHref', e.target.value)}
                placeholder="/categories/dulha-design"
                aria-invalid={Boolean(errors[activeSlideIndex]?.ctaSecondaryHref)}
              />
            </AdminField>
          </div>
        </AdminSection>

        {/* Slide Actions */}
        <div className="admin-actions" style={{ marginTop: 16 }}>
          {slides.length > 1 && (
            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--sm"
              onClick={() => removeSlide(activeSlideIndex)}
              disabled={busy || slides.length <= 1}
            >
              Delete This Slide
            </button>
          )}
          <button type="submit" className="admin-btn" disabled={busy}>
            {busy ? 'Saving…' : 'Save All Slides'}
          </button>
        </div>
      </AdminSection>

      {/* ── Winter / Promo Banner ── */}
      <AdminSection
        step={3}
        title="Season Highlight Banner"
        description="Homepage ke bottom par ek alag banner — seasonal offer ya winter collection ke liye. Khali chhod kar bhi rakh sakte hain."
      >
        <div className="admin-grid">
          <AdminField
            label="Background image"
            hint="Banner lamba aur chhorra hota hai — 1920 × 800 px landscape banayein. Heading overlay beech mein aati hai, is liye saaf texture wali photo best rahegi."
            error={promoErrors.imageUrl}
          >
            <CloudinaryUploader
              single
              images={promoValues.imageUrl ? [promoValues.imageUrl] : []}
              onChange={(next) => setPromo('imageUrl', next[0] ?? '')}
              hint="1920 × 800 px (landscape), max 15 MB"
              emptyHint="Abhi banner photo nahi. Winter/fabric ki landscape photo yahan upload karein."
              ariaLabel="Upload winter banner background image"
            />
          </AdminField>

          <AdminField
            label="Eyebrow"
            hint="Chhota gold line upar."
            error={promoErrors.eyebrow}
          >
            <AdminInput
              value={promoValues.eyebrow}
              onChange={(e) => setPromo('eyebrow', e.target.value)}
              placeholder="Winter Collection 2026"
              aria-invalid={Boolean(promoErrors.eyebrow)}
            />
          </AdminField>
        </div>

        <div className="admin-grid">
          <AdminField
            label="Heading — line 1"
            hint="Mukhya heading ka pehla hissa."
            error={promoErrors.titleLine1}
          >
            <AdminInput
              value={promoValues.titleLine1}
              onChange={(e) => setPromo('titleLine1', e.target.value)}
              placeholder="Winter Collection"
              aria-invalid={Boolean(promoErrors.titleLine1)}
            />
          </AdminField>

          <AdminField
            label="Heading — line 2"
            hint="Heading ka doosra hissa (optional)."
            error={promoErrors.titleLine2}
          >
            <AdminInput
              value={promoValues.titleLine2}
              onChange={(e) => setPromo('titleLine2', e.target.value)}
              placeholder="2026 Arrivals"
              aria-invalid={Boolean(promoErrors.titleLine2)}
            />
          </AdminField>
        </div>

        <AdminField
          label="Supporting paragraph"
          hint="1–2 lines ka description."
          error={promoErrors.subtitle}
        >
          <AdminTextarea
            rows={2}
            value={promoValues.subtitle ?? ''}
            onChange={(e) => setPromo('subtitle', e.target.value)}
            aria-invalid={Boolean(promoErrors.subtitle)}
            maxLength={400}
          />
        </AdminField>

        <div className="admin-grid">
          <AdminField
            label="Primary button — label"
            hint="Main CTA, jaise “Shop Winter”."
            error={promoErrors.ctaPrimaryLabel}
          >
            <AdminInput
              value={promoValues.ctaPrimaryLabel}
              onChange={(e) => setPromo('ctaPrimaryLabel', e.target.value)}
              placeholder="Shop Winter Collection"
              aria-invalid={Boolean(promoErrors.ctaPrimaryLabel)}
            />
          </AdminField>

          <AdminField
            label="Primary button — link"
            hint="Kahan jaye, jaise /categories/winter-fabric"
            error={promoErrors.ctaPrimaryHref}
          >
            <AdminInput
              value={promoValues.ctaPrimaryHref}
              onChange={(e) => setPromo('ctaPrimaryHref', e.target.value)}
              placeholder="/categories/winter-fabric"
              aria-invalid={Boolean(promoErrors.ctaPrimaryHref)}
            />
          </AdminField>
        </div>

        <div className="admin-grid">
          <AdminField
            label="Secondary button — label"
            hint="Optional second CTA."
            error={promoErrors.ctaSecondaryLabel}
          >
            <AdminInput
              value={promoValues.ctaSecondaryLabel}
              onChange={(e) => setPromo('ctaSecondaryLabel', e.target.value)}
              placeholder="View All Winter"
              aria-invalid={Boolean(promoErrors.ctaSecondaryLabel)}
            />
          </AdminField>

          <AdminField
            label="Secondary button — link"
            hint="Jaise /brands/grace-fabrics"
            error={promoErrors.ctaSecondaryHref}
          >
            <AdminInput
              value={promoValues.ctaSecondaryHref}
              onChange={(e) => setPromo('ctaSecondaryHref', e.target.value)}
              placeholder="/brands/grace-fabrics"
              aria-invalid={Boolean(promoErrors.ctaSecondaryHref)}
            />
          </AdminField>
        </div>

        <div className="admin-actions">
          <button type="button" className="admin-btn admin-btn--ghost" onClick={handlePromoSubmit} disabled={promoBusy}>
            {promoBusy ? 'Saving…' : 'Save Season Banner'}
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--ghost admin-btn--sm"
            onClick={() => { setPromoValues(emptySlide()); setPromoErrors({}); }}
            disabled={promoBusy}
          >
            Clear Banner
          </button>
        </div>
      </AdminSection>
    </form>
  );
}

async function updatePromoBanner(patch: Partial<SlideFormValues>) {
  const res = await fetch('/api/admin/home', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ promo: patch }),
  });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error ?? 'Promo save failed');
}