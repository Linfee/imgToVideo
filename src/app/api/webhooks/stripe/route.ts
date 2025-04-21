import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic'; // 强制动态渲染

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("Stripe-Signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      return new NextResponse("Order ID not found", { status: 400 });
    }

    // 更新订单状态
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "completed" },
    });

    // 更新用户积分
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (order) {
      const credits = order.amount === 19900 ? 999 : 1; // 专业版给 999 积分，基础版给 1 积分
      await prisma.user.update({
        where: { id: order.userId },
        data: {
          credits: {
            increment: credits,
          },
        },
      });
    }
  }

  return new NextResponse(null, { status: 200 });
}
