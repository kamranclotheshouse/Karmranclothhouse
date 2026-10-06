import { NextResponse } from 'next/server';
import {
  NotFoundError,
  countProductsIn,
  deleteCategory,
  getCategoryById,
  slugify,
  slugIsTaken,
  updateCategory,
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
    const category = await getCategoryById(id);
    if (!category) return fail('This category no longer exists.', 404);
    return ok({ category });
  } catch (error) {
    console.error('GET /api/admin/categories/[id] failed:', error);
    return fail('The category could not be loaded.', 500);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { id } = await params;
  const body = await readJson(request);
  if (!body) return fail('The form data was not sent properly. Reload the page and try again.');

  const existing = await getCategoryById(id);
  if (!existing) return fail('This category no longer exists.', 404);

  const str = (key: string, fallback: string) =>
    typeof body[key] === 'string' ? (body[key] as string) : fallback;

  // Merge onto the current row so validation sees the whole record.
  const values: TaxonomyFormValues = {
    name: str('name', existing.name),
    slug: str('slug', existing.slug),
    sub: str('sub', existing.sub),
    description: str('description', existing.description),
    image: str('image', existing.image),
  };

  const errors = validateTaxonomy(values, 'category');
  if (hasTaxonomyErrors(errors)) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const slug = values.slug.trim() || slugify(values.name);
  if (await slugIsTaken(slug, id, 'categories')) {
    return NextResponse.json(
      {
        ok: false,
        errors: { slug: `Ye address kisi doosri category pe hai. Doosra likhein, jaise "${slug}-2".` },
      },
      { status: 422 }
    );
  }

  try {
    const category = await updateCategory(id, {
      name: values.name,
      slug,
      sub: values.sub,
      description: values.description,
      image: values.image,
      ...(typeof body.isActive === 'boolean' ? { isActive: body.isActive } : {}),
      ...(Number.isFinite(Number(body.sortOrder)) ? { sortOrder: Number(body.sortOrder) } : {}),
    });
    revalidateCatalogue();
    return ok({ category });
  } catch (error) {
    if (error instanceof NotFoundError) return fail('This category no longer exists.', 404);
    console.error('PATCH /api/admin/categories/[id] failed:', error);
    return fail('The changes could not be saved. Nothing was changed — try again.', 500);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { id } = await params;
  try {
    const existing = await getCategoryById(id);
    if (!existing) return fail('This category no longer exists.', 404);

    const affected = await countProductsIn('categories', existing.slug);
    await deleteCategory(id);
    revalidateCatalogue();
    return ok({
      // Products survive; they simply stop showing a category until reassigned.
      orphanedProducts: affected,
    });
  } catch (error) {
    if (error instanceof NotFoundError) return fail('This category no longer exists.', 404);
    console.error('DELETE /api/admin/categories/[id] failed:', error);
    return fail('The category could not be deleted. Try again.', 500);
  }
}
