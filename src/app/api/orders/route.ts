import { NextResponse } from 'next/server';
import { requireAdmin, readJson, fail } from '@/lib/admin/api';
import { createOrder, listOrders, prepareOrderInput } from '@/lib/db/orders';
import { ORDER_STATUSES, type NewOrderInput, type OrderStatus } from '@/lib/orders';

export const dynamic = 'force-dynamic';

/**
 * POST /api/orders — the customer's "Confirm COD Order" button.
 *
 * Public by design, so it does NOT go through `requireAdmin`. Everything is
 * re-validated here: the browser's copy of the rules is only a courtesy.
 */
export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return fail('Order data could not be read. Please try again.', 422);

  const input = body as unknown as NewOrderInput;
  const prepared = await prepareOrderInput(input);
  if (!prepared.input || prepared.error) {
    return NextResponse.json(
      { ok: false, error: prepared.error?.error, fields: prepared.error?.fields },
      { status: 422 }
    );
  }

  try {
    const order = await createOrder(prepared.input);
    return NextResponse.json({ ok: true, order }, { status: 201 });
  } catch (error) {
    console.error('[orders] create failed:', error);
    return fail('Order could not be saved. Please try again, or WhatsApp us directly.', 500);
  }
}

/** GET /api/orders — admin list, with search and status filters. */
export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const url = new URL(request.url);
  const rawStatus = url.searchParams.get('status') ?? 'all';
  const status = (ORDER_STATUSES as readonly string[]).includes(rawStatus)
    ? (rawStatus as OrderStatus)
    : 'all';
  const search = url.searchParams.get('q') ?? '';

  try {
    const orders = await listOrders({ status, search });
    return NextResponse.json({ ok: true, orders });
  } catch (error) {
    console.error('[orders] list failed:', error);
    return fail('Orders could not be loaded from the database.', 500);
  }
}
