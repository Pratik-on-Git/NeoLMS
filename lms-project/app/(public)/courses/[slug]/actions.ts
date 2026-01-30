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

export async function enrollInCourseAction(
  courseId: string,
): Promise<ApiResponse | never> {
  const user = await requireUser();
  let checkoutUrl: string;
  try {
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
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        price: true,
        slug: true,
      },
    });

    if (!course) {
      return {
        status: "error",
        message: "Course not found.",
      };
    }
    let stripeCustomerId: string;

    const userWithStripeCustomerId = await prisma.user.findUnique({
      where: { id: user.id },
      select: { stripeCustomerId: true },
    });

    if (userWithStripeCustomerId?.stripeCustomerId) {
      stripeCustomerId = userWithStripeCustomerId.stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id },
      });

      stripeCustomerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: stripeCustomerId },
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const existingEnrollment = await tx.enrollment.findUnique({
        where: {
          courseId_userId: {
            courseId: courseId,
            userId: user.id,
          },
        },
        select: { status: true, id: true },
      });
      // Assuming EnrollmentStatus is an enum imported from your models/types

      if (existingEnrollment?.status === EnrollmentStatus.Completed) {
        return {
          status: "success",
          message: "You are already enrolled in this course.",
        };
      }

      let enrollment;

      if (existingEnrollment) {
        enrollment = await tx.enrollment.update({
          where: {
            id: existingEnrollment.id,
          },
          data: {
            ammount: course.price,
            status: EnrollmentStatus.Pending,
            updatedAt: new Date(),
          },
        });
      } else {
        enrollment = await tx.enrollment.create({
          data: {
            courseId: course.id,
            userId: user.id,
            ammount: course.price,
            status: EnrollmentStatus.Pending,
          },
        });
      }

      const checkoutSession = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        line_items: [
          {
            price: "price_1SvJzUPGSAxW38h9zQUGUMBC",
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${env.BETTER_AUTH_URL}/payment/success`,
        cancel_url: `${env.BETTER_AUTH_URL}/payment/cancel`,
        metadata: {
          userId: user.id,
          courseId: course.id,
          enrollmentId: enrollment.id,
        },
      });

      return {
        enrollment: enrollment,
        checkoutUrl: checkoutSession.url,
      };
    });

    checkoutUrl = result.checkoutUrl as string;
  } catch (error: unknown) {
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
