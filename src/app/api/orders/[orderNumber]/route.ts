import { NextResponse } from 'next/server';
import { requireAdmin, readJson, fail } from '@/lib/admin/api';
import { getOrder, updateOrderStatus, OrderNotFoundError } from '@/lib/db/orders';
import { ORDER_STATUSES, type OrderStatus } from '@/lib/orders';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ orderNumber: string }> };

/**
 * GET /api/orders/[orderNumber] — public, for the `/track` page.
 *
 * Returns only `TrackedOrder` fields. Anyone who knows (or guesses) the number
 * can see the status of an order, but never the customer's name, phone or
 * address.
 */
export async function GET(_request: Request, { params }: Params) {
  const { orderNumber } = await params;

  try {
    const order = await getOrder(orderNumber);
    if (!order) return fail('No order found with that number.', 404);

    const { customerName, customerPhone, customerAltPhone, deliveryAddress, specialInstructions, updatedAt, ...tracked } = order;
    void customerName;
    void customerPhone;
    void customerAltPhone;
    void deliveryAddress;
    void specialInstructions;
    void updatedAt;

    return NextResponse.json({ ok: true, order: tracked });
  } catch (error) {
    console.error('[orders] lookup failed:', error);
    return fail('Order could not be looked up. Please try again.', 500);
  }
}

/** PATCH /api/orders/[orderNumber] — admin changes the status. */
export async function PATCH(request: Request, { params }: Params) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { orderNumber } = await params;
  const body = await readJson(request);
  const status = body?.status;

  if (typeof status !== 'string' || !(ORDER_STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json(
      {
        ok: false,
        error: `Status ${JSON.stringify(status)} is not valid.`,
        fields: { status: `Choose one of: ${ORDER_STATUSES.join(', ')}.` },
      },
      { status: 422 }
    );
  }

  try {
    const order = await updateOrderStatus(orderNumber, status as OrderStatus);
    return NextResponse.json({ ok: true, order });
  } catch (error) {
    if (error instanceof OrderNotFoundError) return fail('That order no longer exists.', 404);
    console.error('[orders] status update failed:', error);
    return fail('Status could not be saved. Please try again.', 500);
  }
}
