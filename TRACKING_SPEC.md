# 🎯 Meta & TikTok Pixel Tracking & Retargeting Specification

## Project: Kamran Cloth House
Target Ad Platforms: **Meta Ads (Facebook & Instagram)** + **TikTok Ads**

---

## 1. Why Pixel Setup is Critical for Kamran Cloth House

The majority of website visitors will arrive from targeted video ads on TikTok and Instagram showcasing:
- Unstitched premium winter fabrics (Karandi, Khaddar, Wool)
- Dulha (Groom) wedding suits & waistcoat designs
- Original Grace & Pasha branded fabric demonstrations (water-drop test, wrinkle test)

Without precise event tracking, advertising budgets are wasted on unqualified clicks. With this setup, the client can:
1. **Optimize for Purchases:** Train TikTok & Meta algorithms to find buyers, not just clickers.
2. **Retarget Browsers:** Show special discount ads or WhatsApp reminder ads to users who viewed products or opened the checkout drawer but did not complete the order.
3. **Build Lookalike Audiences:** Find similar high-spending men in Peshawar, Islamabad, Lahore, Karachi, and across KP.

---

## 2. Event Mapping Matrix

| User Action | Meta Pixel Event | TikTok Pixel Event | Parameters Passed |
| :--- | :--- | :--- | :--- |
| Any Page Visit | `fbq('track', 'PageView')` | `ttq.page()` | URL, Page Title |
| Viewing Product Details | `fbq('track', 'ViewContent')` | `ttq.track('ViewContent')` | `content_id`, `content_name`, `content_category`, `value`, `currency: 'PKR'` |
| Clicking "Buy via COD" (Drawer Open) | `fbq('track', 'AddToCart')` | `ttq.track('AddToCart')` | `content_id`, `content_name`, `value`, `currency: 'PKR'` |
| Filling Name & Phone in Checkout | `fbq('track', 'InitiateCheckout')` | `ttq.track('InitiateCheckout')` | `value`, `currency: 'PKR'`, `num_items` |
| Submitting Cash on Delivery Order | `fbq('track', 'Purchase')` | `ttq.track('CompletePayment')` | `order_id`, `value`, `currency: 'PKR'`, `contents` |
| Clicking WhatsApp Chat / Order Button | `fbq('trackCustom', 'WhatsAppChat')` | `ttq.track('Contact')` | `product_name`, `destination: 'WhatsApp'` |

---

## 3. Code Implementations

> **Status (Rebrand R7 — pending):** `src/lib/analytics.ts` is not built yet. The plan:
> load Meta `fbq` + TikTok `ttq` snippets once, reading **pixel IDs from
> `store_settings`** (editable at `/admin/settings`, no code changes needed).
> Core events to wire first: `PageView` (route change), `ViewContent` (PDP),
> `AddToCart` (checkout drawer opened), `Purchase` (order submitted).
> The helper below is the reference implementation — `InitiateCheckout` and
> `WhatsAppChat` are optional extras.

### 3.1. Unified Analytics Dispatcher Helper (`lib/analytics.ts`)

```typescript
// Unified Event Trigger for both Meta and TikTok Pixels
export const trackEvent = {
  viewContent: (product: { id: string; title: string; category: string; price: number }) => {
    // Meta Pixel
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'ViewContent', {
        content_ids: [product.id],
        content_name: product.title,
        content_category: product.category,
        value: product.price,
        currency: 'PKR',
      });
    }
    // TikTok Pixel
    if (typeof window !== 'undefined' && (window as any).ttq) {
      (window as any).ttq.track('ViewContent', {
        content_id: product.id,
        content_name: product.title,
        content_category: product.category,
        price: product.price,
        value: product.price,
        currency: 'PKR',
      });
    }
  },

  addToCart: (product: { id: string; title: string; price: number; quantity: number }) => {
    const totalValue = product.price * product.quantity;
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'AddToCart', {
        content_ids: [product.id],
        content_name: product.title,
        value: totalValue,
        currency: 'PKR',
      });
    }
    if (typeof window !== 'undefined' && (window as any).ttq) {
      (window as any).ttq.track('AddToCart', {
        content_id: product.id,
        content_name: product.title,
        quantity: product.quantity,
        value: totalValue,
        currency: 'PKR',
      });
    }
  },

  purchase: (order: { orderNumber: string; totalAmount: number; items: any[] }) => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Purchase', {
        content_type: 'product',
        contents: order.items.map(i => ({ id: i.product_id, quantity: i.quantity, item_price: i.price })),
        value: order.totalAmount,
        currency: 'PKR',
        order_id: order.orderNumber,
      });
    }
    if (typeof window !== 'undefined' && (window as any).ttq) {
      (window as any).ttq.track('CompletePayment', {
        content_id: order.orderNumber,
        value: order.totalAmount,
        currency: 'PKR',
      });
    }
  },

  whatsAppClick: (productName?: string) => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('trackCustom', 'WhatsAppChat', {
        label: productName || 'General Inquiry',
      });
    }
    if (typeof window !== 'undefined' && (window as any).ttq) {
      (window as any).ttq.track('Contact', {
        contents: [{ content_name: productName || 'General Inquiry' }],
      });
    }
  }
};
```

---

## 4. Retargeting Funnel Strategy for the Client

1. **Top of Funnel (Cold Ads):**
   - Video ads showing unstitched fabric quality & Saddar Peshawar store ambiance.
   - Objective: Video Views & Traffic to `/categories/winter-fabric` or `/brands/grace`.
2. **Middle of Funnel (Retargeting Viewers):**
   - Audience: Users who triggered `ViewContent` or `AddToCart` in past 14 days, excluding `Purchase`.
   - Ad Angle: *"Still thinking? Order with 100% Cash on Delivery & Free delivery over Rs. 5000. Pay when you hold the fabric in your hands."*
3. **Bottom of Funnel (Past Buyers):**
   - Audience: Users who triggered `Purchase` in past 90 days.
   - Ad Angle: New season arrival (e.g. Summer Egyptian Cotton or Eid Dulha collection).
