import { NextResponse } from 'next/server';
import {
  createProduct,
  listProducts,
  listBrands,
  listCategories,
  getProductById,
  setProductExtraCategories,
  slugify,
  slugIsTaken,
} from '@/lib/db/catalogue';
import type { ProductInput } from '@/lib/db/catalogue';
import { fail, ok, readJson, requireAdmin } from '@/lib/admin/api';
import { revalidateCatalogue } from '@/lib/admin/revalidate';
import { validateProduct, hasErrors, type ProductFormValues } from '@/lib/admin/validate-product';

/** Turns the admin form's string fields into typed values for the database. */
function toProductInput(body: Record<string, unknown>): ProductFormValues {
  const s = (key: string) => (typeof body[key] === 'string' ? (body[key] as string) : '');
  return {
    title: s('title'),
    slug: s('slug'),
    price: s('price'),
    compareAtPrice: s('compareAtPrice'),
    stockQuantity: s('stockQuantity'),
    brandSlug: s('brandSlug'),
    categorySlug: s('categorySlug'),
    description: s('description'),
    fabricType: s('fabricType'),
    length: s('length'),
    width: s('width'),
    season: s('season'),
    weaveType: s('weaveType'),
    badge: s('badge'),
    sku: s('sku'),
    imageAlt: s('imageAlt'),
  };
}

function num(value: string): number | undefined {
  const trimmed = value.trim();
  return trimmed === '' ? undefined : Number(trimmed);
}

export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    const [products, brands, categories] = await Promise.all([
      listProducts(),
      listBrands(),
      listCategories(),
    ]);
    return ok({ products, brands, categories });
  } catch (error) {
    console.error('GET /api/admin/products failed:', error);
    return fail('The catalogue could not be loaded. Check the database connection.', 500);
  }
}

export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const body = await readJson(request);
  if (!body) return fail('The form data was not sent properly. Reload the page and try again.');

  const values = toProductInput(body);
  const errors = validateProduct(values);
  if (hasErrors(errors)) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  // Slug defaults to a slugified title, but must still be unique.
  const slug = values.slug.trim() || slugify(values.title);
  if (await slugIsTaken(slug)) {
    return NextResponse.json(
      {
        ok: false,
        errors: {
          slug: `Ye address pehle se istemal ho chuka hai. Koi doosra likhein, jaise "${slug}-2".`,
        },
      },
      { status: 422 }
    );
  }

  try {
    const input: ProductInput = {
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
      price: num(values.price) ?? 0,
      compareAtPrice: num(values.compareAtPrice) ?? null,
      priceOnInquiry: body.priceOnInquiry === true,
      isInStock: body.isInStock !== false,
      stockQuantity: num(values.stockQuantity) ?? 50,
      isFeatured: body.isFeatured === true,
      isBestseller: body.isBestseller === true,
      badge: values.badge.trim() || null,
      images: Array.isArray(body.images)
        ? (body.images as unknown[]).filter((i): i is string => typeof i === 'string')
        : [],
      imageAlt: values.imageAlt.trim() || null,
      colorVariants: Array.isArray(body.colorVariants)
        ? (body.colorVariants as ProductInput['colorVariants'])
        : [],
    };

    const product = await createProduct(input);
    if (Array.isArray(body.alsoIn)) {
      const extras = (body.alsoIn as unknown[]).filter(
        (s): s is string => typeof s === 'string' && s !== values.categorySlug
      );
      await setProductExtraCategories(product.id, extras);
    }
    revalidateCatalogue();
    const saved = (await getProductById(product.id)) ?? product;
    return ok({ product: saved }, { status: 201 });
  } catch (error) {
    if (String(error).includes('duplicate key')) {
      return NextResponse.json(
        { ok: false, errors: { slug: 'Ye address pehle se maujood hai. Doosra try karein.' } },
        { status: 422 }
      );
    }
    console.error('POST /api/admin/products failed:', error);
    return fail('The product could not be saved. Nothing was changed — try again.', 500);
  }
}
