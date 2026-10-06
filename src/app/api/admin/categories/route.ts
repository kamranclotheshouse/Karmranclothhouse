import { NextResponse } from 'next/server';
import {
  createCategory,
  listCategories,
  productCountsBySlug,
  slugify,
  slugIsTaken,
} from '@/lib/db/catalogue';
import { fail, ok, readJson, requireAdmin } from '@/lib/admin/api';
import { revalidateCatalogue } from '@/lib/admin/revalidate';
import {
  hasTaxonomyErrors,
  validateTaxonomy,
  type TaxonomyFormValues,
} from '@/lib/admin/validate-taxonomy';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    const [categories, counts] = await Promise.all([
      listCategories(),
      productCountsBySlug('categories'),
    ]);
    return ok({
      categories: categories.map((c) => ({ ...c, productCount: counts[c.slug] ?? 0 })),
    });
  } catch (error) {
    console.error('GET /api/admin/categories failed:', error);
    return fail('Categories could not be loaded. Check the database connection.', 500);
  }
}

export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const body = await readJson(request);
  if (!body) return fail('The form data was not sent properly. Reload the page and try again.');

  const values: TaxonomyFormValues = {
    name: typeof body.name === 'string' ? body.name : '',
    slug: typeof body.slug === 'string' ? body.slug : '',
    sub: typeof body.sub === 'string' ? body.sub : '',
    description: typeof body.description === 'string' ? body.description : '',
    image: typeof body.image === 'string' ? body.image : '',
  };

  const errors = validateTaxonomy(values, 'category');
  if (hasTaxonomyErrors(errors)) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const slug = values.slug.trim() || slugify(values.name);
  if (!slug) {
    return NextResponse.json(
      { ok: false, errors: { slug: 'Ye naam se address nahi ban sakta — kuch aur likhein.' } },
      { status: 422 }
    );
  }
  if (await slugIsTaken(slug, undefined, 'categories')) {
    return NextResponse.json(
      {
        ok: false,
        errors: { slug: `Ye address pehle se istemal hai. Doosra likhein, jaise "${slug}-2".` },
      },
      { status: 422 }
    );
  }

  try {
    const category = await createCategory({
      name: values.name,
      slug,
      sub: values.sub,
      description: values.description,
      image: values.image,
      isActive: body.isActive !== false,
      sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0,
    });
    revalidateCatalogue();
    return ok({ category }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/categories failed:', error);
    return fail('The category could not be saved. Nothing was changed — try again.', 500);
  }
}
