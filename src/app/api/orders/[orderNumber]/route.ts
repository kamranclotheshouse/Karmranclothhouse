import { NextResponse } from 'next/server';
import { requireAdmin, readJson, fail } from '@/lib/admin/api';
import { getOrderForTracking, updateOrderStatus, OrderNotFoundError } from '@/lib/db/orders';
import { ORDER_STATUSES, type OrderStatus } from '@/lib/orders';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ orderNumber: string }> };

/**
 * GET /api/orders/[orderNumber] — public, for the `/track` page.
 *
 * Returns only `TrackedOrder` fields after the customer's phone number is
 * verified. This prevents sequential order numbers being used for lookup.
 */
export async function GET(request: Request, { params }: Params) {
  const { orderNumber } = await params;
  const phone = new URL(request.url).searchParams.get('phone') ?? '';

  try {
    const order = await getOrderForTracking(orderNumber, phone);
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
  const courierName = typeof body?.courierName === 'string' ? body.courierName.trim() : '';
  const trackingNumber = typeof body?.trackingNumber === 'string' ? body.trackingNumber.trim() : '';

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

  if (status === 'dispatched' && (!courierName || !trackingNumber)) {
    return fail('Dispatched order ke liye courier name aur tracking ID dono zaroori hain.', 422);
  }

  try {
    const order = await updateOrderStatus(orderNumber, status as OrderStatus, {
      courierName: courierName || undefined,
      trackingNumber: trackingNumber || undefined,
    });
    return NextResponse.json({ ok: true, order });
  } catch (error) {
    if (error instanceof OrderNotFoundError) return fail('That order no longer exists.', 404);
    console.error('[orders] status update failed:', error);
    return fail('Status could not be saved. Please try again.', 500);
  }
}
