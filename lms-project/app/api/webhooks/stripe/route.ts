import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import Stripe from "stripe";
import { EnrollmentStatus } from "@prisma/client";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature");

  if (!signature) {
    console.error("Missing Stripe-Signature header");
    return new Response("Missing Stripe-Signature header", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return new Response("Webhook signature verification failed", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      }
      case "checkout.session.expired": {
        await handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session);
        break;
      }
      // Add more event types as needed
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook event:", error);
    // Return 200 to prevent Stripe from retrying, but log the error
    // This prevents infinite retry loops for non-recoverable errors
    return new Response("Webhook processed with errors", { status: 200 });
  }
}

/**
 * Handles successful checkout session completion.
 * Updates enrollment status to Completed.
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const { courseId, userId, enrollmentId } = session.metadata ?? {};

  // Validate required metadata
  if (!courseId || !userId || !enrollmentId) {
    console.error("Missing required metadata in checkout session:", {
      sessionId: session.id,
      courseId,
      userId,
      enrollmentId,
    });
    return;
  }

  // Verify enrollment exists
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: { id: true, status: true, userId: true, courseId: true },
  });

  if (!enrollment) {
    console.error(`Enrollment not found: ${enrollmentId}`);
    return;
  }

  // Verify the enrollment belongs to the correct user and course
  if (enrollment.userId !== userId || enrollment.courseId !== courseId) {
    console.error("Enrollment mismatch:", {
      expected: { userId, courseId },
      actual: { userId: enrollment.userId, courseId: enrollment.courseId },
    });
    return;
  }

  // Skip if already completed (idempotency)
  if (enrollment.status === EnrollmentStatus.Completed) {
    console.log(`Enrollment ${enrollmentId} already completed, skipping`);
    return;
  }

  // Update enrollment to completed
  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: {
      status: EnrollmentStatus.Completed,
      ammount: session.amount_total ?? enrollment.ammount,
      updatedAt: new Date(),
    },
  });

  console.log(`Enrollment ${enrollmentId} completed for user ${userId}, course ${courseId}`);
}

/**
 * Handles expired checkout sessions.
 * Updates enrollment status to Cancelled if it was Pending.
 */
async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
  const { enrollmentId } = session.metadata ?? {};

  if (!enrollmentId) {
    console.log("No enrollment ID in expired session metadata");
    return;
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: { id: true, status: true },
  });

  if (!enrollment) {
    console.log(`Enrollment ${enrollmentId} not found for expired session`);
    return;
  }

  // Only cancel if still pending
  if (enrollment.status === EnrollmentStatus.Pending) {
    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        status: EnrollmentStatus.Cancelled,
        updatedAt: new Date(),
      },
    });
    console.log(`Enrollment ${enrollmentId} cancelled due to expired checkout session`);
  }
}
