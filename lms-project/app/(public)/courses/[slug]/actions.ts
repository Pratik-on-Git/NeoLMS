"use server";
import { requireUser } from "@/app/data/user/require-user";
import { prisma } from "@/lib/db";
import { EnrollmentStatus } from "@prisma/client";
import { stripe } from "@/lib/stripe";
import { ApiResponse } from "@/lib/types";
import Stripe from "stripe";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";

const aj = arcjet.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "1m",
    max: 6,
  }),
);

/**
 * Validates or creates a Stripe customer for the user.
 * If existing customer ID is invalid (deleted from Stripe), creates a new one.
 */
async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name: string,
  existingCustomerId: string | null
): Promise<string> {
  // If user has an existing customer ID, validate it exists in Stripe
  if (existingCustomerId) {
    try {
      const customer = await stripe.customers.retrieve(existingCustomerId);
      // Check if customer is deleted
      if (!customer.deleted) {
        return existingCustomerId;
      }
    } catch {
      // Customer doesn't exist in Stripe, will create new one
      console.log(`Stripe customer ${existingCustomerId} not found, creating new one`);
    }
  }

  // Create new customer in Stripe
  const customer = await stripe.customers.create({
    email: email,
    name: name,
    metadata: { userId: userId },
  });

  // Update user with new Stripe customer ID
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

export async function enrollInCourseAction(
  courseId: string,
): Promise<ApiResponse | never> {
  const user = await requireUser();
  let checkoutUrl: string;

  try {
    // Rate limiting
    const req = await request();
    const decision = await aj.protect(req, {
      fingerprint: user.id,
    });

    if (decision.isDenied()) {
      return {
        status: "error",
        message: "Too many requests. Please try again later.",
      };
    }

    // Fetch course details
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        price: true,
        slug: true,
        stripePriceId: true,
        status: true,
      },
    });

    if (!course) {
      return {
        status: "error",
        message: "Course not found.",
      };
    }

    if (course.status !== "PUBLISHED") {
      return {
        status: "error",
        message: "This course is not available for enrollment.",
      };
    }

    if (!course.stripePriceId) {
      return {
        status: "error",
        message: "This course is not configured for payment.",
      };
    }

    // Check if user is already enrolled and completed
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        courseId_userId: {
          courseId: courseId,
          userId: user.id,
        },
      },
      select: { status: true, id: true },
    });

    if (existingEnrollment?.status === EnrollmentStatus.Completed) {
      return {
        status: "success",
        message: "You are already enrolled in this course.",
      };
    }

    // Get or create Stripe customer (validates existing ID)
    const userWithStripeCustomerId = await prisma.user.findUnique({
      where: { id: user.id },
      select: { stripeCustomerId: true },
    });

    const stripeCustomerId = await getOrCreateStripeCustomer(
      user.id,
      user.email,
      user.name,
      userWithStripeCustomerId?.stripeCustomerId ?? null
    );

    // Create or update enrollment record
    let enrollment;
    if (existingEnrollment) {
      enrollment = await prisma.enrollment.update({
        where: { id: existingEnrollment.id },
        data: {
          ammount: course.price,
          status: EnrollmentStatus.Pending,
          updatedAt: new Date(),
        },
      });
    } else {
      enrollment = await prisma.enrollment.create({
        data: {
          courseId: course.id,
          userId: user.id,
          ammount: course.price,
          status: EnrollmentStatus.Pending,
        },
      });
    }

    // Create Stripe checkout session (outside transaction)
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: course.stripePriceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${env.BETTER_AUTH_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.BETTER_AUTH_URL}/payment/cancel`,
      metadata: {
        userId: user.id,
        courseId: course.id,
        enrollmentId: enrollment.id,
      },
      // Expire session after 30 minutes
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

    if (!checkoutSession.url) {
      // Rollback enrollment to cancelled if checkout creation fails
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { status: EnrollmentStatus.Cancelled },
      });
      return {
        status: "error",
        message: "Failed to create checkout session. Please try again.",
      };
    }

    checkoutUrl = checkoutSession.url;
  } catch (error: unknown) {
    console.error("Enrollment error:", error);

    if (error instanceof Stripe.errors.StripeError) {
      return {
        status: "error",
        message: "Payment processing error: " + error.message,
      };
    }

    if (typeof error === "object" && error !== null && "message" in error) {
      return {
        status: "error",
        message:
          (error as { message: string }).message ||
          "Failed to enroll in course.",
      };
    }

    return {
      status: "error",
      message: "Failed to enroll in course.",
    };
  }

  redirect(checkoutUrl);
}
