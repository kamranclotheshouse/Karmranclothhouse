import { NextResponse } from 'next/server';
import {
  NotFoundError,
  countProductsIn,
  deleteBrand,
  getBrandById,
  slugify,
  slugIsTaken,
  updateBrand,
} from '@/lib/db/catalogue';
import { fail, ok, readJson, requireAdmin } from '@/lib/admin/api';
import { revalidateCatalogue } from '@/lib/admin/revalidate';
import {
  hasTaxonomyErrors,
  validateTaxonomy,
  type TaxonomyFormValues,
} from '@/lib/admin/validate-taxonomy';

type Params = { params: Promise<{ id: string }> };

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: Params) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { id } = await params;
  try {
    const brand = await getBrandById(id);
    if (!brand) return fail('This brand no longer exists.', 404);
    return ok({ brand });
  } catch (error) {
    console.error('GET /api/admin/brands/[id] failed:', error);
    return fail('The brand could not be loaded.', 500);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { id } = await params;
  const body = await readJson(request);
  if (!body) return fail('The form data was not sent properly. Reload the page and try again.');

  const existing = await getBrandById(id);
  if (!existing) return fail('This brand no longer exists.', 404);

  const str = (key: string, fallback: string) =>
    typeof body[key] === 'string' ? (body[key] as string) : fallback;

  const values: TaxonomyFormValues = {
    name: str('name', existing.name),
    slug: str('slug', existing.slug),
    sub: str('sub', existing.tag),
    description: str('description', existing.description),
    image: str('image', existing.logo),
  };

  const errors = validateTaxonomy(values, 'brand');
  if (hasTaxonomyErrors(errors)) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const slug = values.slug.trim() || slugify(values.name);
  if (await slugIsTaken(slug, id, 'brands')) {
    return NextResponse.json(
      {
        ok: false,
        errors: { slug: `Ye address kisi doosri brand pe hai. Doosra likhein, jaise "${slug}-2".` },
      },
      { status: 422 }
    );
  }

  try {
    const brand = await updateBrand(id, {
      name: values.name,
      slug,
      tag: values.sub,
      description: values.description,
      logo: values.image,
      ...(typeof body.isActive === 'boolean' ? { isActive: body.isActive } : {}),
      ...(typeof body.isFeatured === 'boolean' ? { isFeatured: body.isFeatured } : {}),
      ...(Number.isFinite(Number(body.sortOrder)) ? { sortOrder: Number(body.sortOrder) } : {}),
    });
    revalidateCatalogue();
    return ok({ brand });
  } catch (error) {
    if (error instanceof NotFoundError) return fail('This brand no longer exists.', 404);
    console.error('PATCH /api/admin/brands/[id] failed:', error);
    return fail('The changes could not be saved. Nothing was changed — try again.', 500);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { id } = await params;
  try {
    const existing = await getBrandById(id);
    if (!existing) return fail('This brand no longer exists.', 404);

    const affected = await countProductsIn('brands', existing.slug);
    await deleteBrand(id);
    revalidateCatalogue();
    return ok({ orphanedProducts: affected });
  } catch (error) {
    if (error instanceof NotFoundError) return fail('This brand no longer exists.', 404);
    console.error('DELETE /api/admin/brands/[id] failed:', error);
    return fail('The brand could not be deleted. Try again.', 500);
  }
}
