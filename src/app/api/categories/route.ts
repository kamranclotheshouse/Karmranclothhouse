import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/db/storefront';

export const revalidate = 60;

export async function GET() {
  const categories = await getCategories();
  return NextResponse.json({ ok: true, categories });
}