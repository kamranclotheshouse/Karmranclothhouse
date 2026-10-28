import { NextResponse } from 'next/server';
import {
  createProduct,
  slugify,
  slugIsTaken,
  type ProductInput,
} from '@/lib/db/catalogue';
import { fail, ok, readJson, requireAdmin } from '@/lib/admin/api';
import { revalidateCatalogue } from '@/lib/admin/revalidate';

interface VariantPayload {
  colorName: string;
  colorHex?: string;
  images: string[];
  stockQuantity?: number | string;
}

function suggestSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function findAvailableSlug(preferred: string): Promise<string> {
  const candidate = preferred || 'sale-product';
  if (!(await slugIsTaken(candidate))) {
    return candidate;
  }
  for (let suffix = 2; suffix < 1000; suffix++) {
    const test = `${candidate}-${suffix}`;
    if (!(await slugIsTaken(test))) {
      return test;
    }
  }
  return `${candidate}-${Date.now()}`;
}

export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const body = await readJson(request);
  if (!body) return fail('Form data send nahi hua. Dobara try karein.');

  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const price = typeof body.price === 'number' ? body.price : Number(body.price);

  if (!title) {
    return NextResponse.json(
      { ok: false, errors: { title: 'Product ka naam zaroori hai.' } },
      { status: 422 }
    );
  }

  if (isNaN(price) || price <= 0) {
    return NextResponse.json(
      { ok: false, errors: { price: 'Sale price zaroori hai aur number hona chahiye.' } },
      { status: 422 }
    );
  }

  const rawVariants = Array.isArray(body.variants) ? (body.variants as VariantPayload[]) : [];
  if (rawVariants.length === 0) {
    return NextResponse.json(
      { ok: false, errors: { variants: 'Kam az kam 1 colour / product variant zaroori hai.' } },
      { status: 422 }
    );
  }

  const compareAtPrice = body.compareAtPrice ? Number(body.compareAtPrice) : null;
  const brandSlug = typeof body.brandSlug === 'string' && body.brandSlug ? body.brandSlug : null;
  const categorySlug =
    typeof body.categorySlug === 'string' && body.categorySlug ? body.categorySlug : null;
  const badge = typeof body.badge === 'string' && body.badge.trim() ? body.badge.trim() : 'Sale';

  const fabricType = typeof body.fabricType === 'string' ? body.fabricType.trim() || null : null;
  const fabricLength =
    typeof body.fabricLength === 'string' ? body.fabricLength.trim() || null : null;
  const fabricWidth = typeof body.fabricWidth === 'string' ? body.fabricWidth.trim() || null : null;
  const season = typeof body.season === 'string' ? body.season.trim() || null : null;
  const weaveType = typeof body.weaveType === 'string' ? body.weaveType.trim() || null : null;
  const description = typeof body.description === 'string' ? body.description.trim() || null : null;

  try {
    const createdProducts = [];

    for (const v of rawVariants) {
      const colorName = (v.colorName ?? '').trim();
      const variantTitle = colorName ? `${title} - ${colorName}` : title;
      const baseSlug = suggestSlug(variantTitle) || slugify(variantTitle);
      const uniqueSlug = await findAvailableSlug(baseSlug);

      const variantImages = Array.isArray(v.images)
        ? v.images.filter((img): img is string => typeof img === 'string')
        : [];

      const qty = v.stockQuantity ? Number(v.stockQuantity) : 50;

      const input: ProductInput = {
        title: variantTitle,
        slug: uniqueSlug,
        brandSlug,
        categorySlug,
        price,
        compareAtPrice: isNaN(compareAtPrice as number) ? null : compareAtPrice,
        priceOnInquiry: false,
        isInStock: true,
        stockQuantity: isNaN(qty) ? 50 : qty,
        isFeatured: false,
        isBestseller: false,
        isOnSale: true,
        badge,
        fabricType,
        fabricLength,
        fabricWidth,
        season,
        weaveType,
        description,
        images: variantImages,
        imageAlt: colorName ? `${variantTitle} in ${colorName}` : variantTitle,
        colorVariants: colorName
          ? [
              {
                name: colorName,
                hex: v.colorHex || '#1B2A4A',
                inStock: true,
              },
            ]
          : [],
      };

      const created = await createProduct(input);
      createdProducts.push(created);
    }

    revalidateCatalogue();

    return ok(
      {
        createdCount: createdProducts.length,
        products: createdProducts,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/admin/sale/batch failed:', error);
    return fail('Sale products upload nahi ho sake. Dobara try karein.', 500);
  }
}
