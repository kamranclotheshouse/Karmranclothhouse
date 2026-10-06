import { NextResponse } from 'next/server';
import { searchProducts } from '@/lib/db/catalogue';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') ?? '').trim().slice(0, 80);
  const limit = Math.min(Number(searchParams.get('limit')) || 6, 20);

  if (!q) {
    return NextResponse.json({ ok: true, query: '', products: [] });
  }

  const products = await searchProducts(q, limit);

  return NextResponse.json({ ok: true, query: q, products });
}
