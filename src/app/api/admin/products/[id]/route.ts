import { NextResponse } from 'next/server';
import {
  NotFoundError,
  deleteProduct,
  getProductById,
  setProductExtraCategories,
  slugify,
  slugIsTaken,
  updateProduct,
} from '@/lib/db/catalogue';
import type { ProductPatch } from '@/lib/db/catalogue';
import { fail, ok, readJson, requireAdmin } from '@/lib/admin/api';
import { revalidateCatalogue } from '@/lib/admin/revalidate';
import { validateProduct, hasErrors, type ProductFormValues } from '@/lib/admin/validate-product';

type Params = { params: Promise<{ id: string }> };

function optionalString(body: Record<string, unknown>, key: string): string | undefined {
  return typeof body[key] === 'string' ? (body[key] as string) : undefined;
}

function num(value: string): number | undefined {
  const trimmed = value.trim();
  return trimmed === '' ? undefined : Number(trimmed);
}

export async function GET(request: Request, { params }: Params) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { id } = await params;
  try {
    const product = await getProductById(id);
    if (!product) return fail('This product no longer exists.', 404);
    return ok({ product });
  } catch (error) {
    console.error('GET /api/admin/products/[id] failed:', error);
    return fail('The product could not be loaded.', 500);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { id } = await params;
  const body = await readJson(request);
  if (!body) return fail('The form data was not sent properly. Reload the page and try again.');

  const existing = await getProductById(id);
  if (!existing) return fail('This product no longer exists.', 404);

  // Merge onto the current row so validation sees the complete record, not
  // just the fields that happen to be in this request.
  const values: ProductFormValues = {
    title: optionalString(body, 'title') ?? existing.name,
    slug: optionalString(body, 'slug') ?? existing.slug,
    price: optionalString(body, 'price') ?? String(existing.price),
    compareAtPrice:
      optionalString(body, 'compareAtPrice') ??
      (existing.compareAtPrice ? String(existing.compareAtPrice) : ''),
    stockQuantity: optionalString(body, 'stockQuantity') ?? String(existing.stockQuantity),
    brandSlug: optionalString(body, 'brandSlug') ?? existing.brandSlug,
    categorySlug: optionalString(body, 'categorySlug') ?? existing.categorySlug,
    description: optionalString(body, 'description') ?? existing.description,
    fabricType: optionalString(body, 'fabricType') ?? existing.fabricType,
    length: optionalString(body, 'length') ?? existing.length,
    width: optionalString(body, 'width') ?? existing.width,
    season: optionalString(body, 'season') ?? existing.season,
    weaveType: optionalString(body, 'weaveType') ?? existing.weaveType,
    badge: optionalString(body, 'badge') ?? (existing.badge ?? ''),
    sku: optionalString(body, 'sku') ?? (existing.sku ?? ''),
    imageAlt: optionalString(body, 'imageAlt') ?? (existing.imageAlt ?? ''),
  };

  const errors = validateProduct(values);
  if (hasErrors(errors)) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const slug = values.slug.trim() || slugify(values.title);
  if (await slugIsTaken(slug, id)) {
    return NextResponse.json(
      {
        ok: false,
        errors: { slug: `Ye address kisi aur product pehle se hai. Koi doosra likhein, jaise "${slug}-2".` },
      },
      { status: 422 }
    );
  }

  try {
    const patch: ProductPatch = {
      title: values.title.trim(),
      slug,
      sku: values.sku.trim() || null,
      brandSlug: values.brandSlug || null,
      categorySlug: values.categorySlug || null,
      description: values.description.trim() || null,
      fabricType: values.fabricType.trim() || null,
      fabricLength: values.length.trim() || null,
      fabricWidth: values.width.trim() || null,
      season: values.season.trim() || null,
      weaveType: values.weaveType.trim() || null,
      price: num(values.price) ?? existing.price,
      compareAtPrice: num(values.compareAtPrice) ?? null,
      badge: values.badge.trim() || null,
      imageAlt: values.imageAlt.trim() || null,
    };

    if (typeof body.priceOnInquiry === 'boolean') patch.priceOnInquiry = body.priceOnInquiry;
    if (typeof body.isInStock === 'boolean') patch.isInStock = body.isInStock;
    if (typeof body.isFeatured === 'boolean') patch.isFeatured = body.isFeatured;
    if (typeof body.isBestseller === 'boolean') patch.isBestseller = body.isBestseller;
    if (num(values.stockQuantity) !== undefined) patch.stockQuantity = num(values.stockQuantity);

    if (Array.isArray(body.images)) {
      patch.images = (body.images as unknown[]).filter(
        (i): i is string => typeof i === 'string'
      ) as string[];
    }
    if (Array.isArray(body.colorVariants)) {
      patch.colorVariants = body.colorVariants as ProductPatch['colorVariants'];
    }

    const product = await updateProduct(id, patch);
    if (Array.isArray(body.alsoIn)) {
      const extras = (body.alsoIn as unknown[]).filter(
        (s): s is string => typeof s === 'string' && s !== values.categorySlug
      );
      await setProductExtraCategories(id, extras);
    }
    revalidateCatalogue();
    const saved = (await getProductById(id)) ?? product;
    return ok({ product: saved });
  } catch (error) {
    if (error instanceof NotFoundError) return fail('This product no longer exists.', 404);
    if (String(error).includes('duplicate key')) {
      return NextResponse.json(
        { ok: false, errors: { slug: 'Ye address pehle se maujood hai. Doosra try karein.' } },
        { status: 422 }
      );
    }
    console.error('PATCH /api/admin/products/[id] failed:', error);
    return fail('The changes could not be saved. Nothing was changed — try again.', 500);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { id } = await params;
  try {
    await deleteProduct(id);
    revalidateCatalogue();
    return ok({});
  } catch (error) {
    if (error instanceof NotFoundError) return fail('This product no longer exists.', 404);
    console.error('DELETE /api/admin/products/[id] failed:', error);
    return fail('The product could not be deleted. Try again.', 500);
  }
}
