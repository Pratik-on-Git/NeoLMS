"use server";
import { ApiResponse } from "@/lib/types";
import { courseSchema, mapFormToPrisma } from "@/lib/zodSchemas";
import { prisma } from "@/lib/db";
import arcjet, { fixedWindow, request } from "@arcjet/next"
import { requireAdmin } from "@/app/data/admin/require-admin"
import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";

const aj = arcjet({
    key: env.ARCJET_KEY || "",
    characteristics: ["fingerprint"],
    rules: [
      fixedWindow({
            mode: "LIVE",
            window: "1m",
            max: 10,
        }),
    ],
})

export async function CreateCourse(values: unknown): Promise<ApiResponse> {
  const session = await requireAdmin();
  try {

    const req = await request()
    const decision = await aj.protect(req, {
        fingerprint: session.user.id,
    })

    if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
            return {
                status: "error",
                message: "Too many requests. Please try again later.",
            }
        }
        else {
            return {
                status: "error",
                message: "Request blocked. If this is an error, please contact support.",
            }
        }
    }

    const validation = courseSchema.safeParse(values);
    if (!validation.success) {
      return {
        status: "error",
        message: "Invalid Form Data",
      };
    }

    const data = await stripe.products.create({
      name: validation.data.title,
      description: validation.data.smallDescription,
      default_price_data: {
        currency: "usd",
        unit_amount: validation.data.price * 100,
      },
    })

    // Map UI values to Prisma enum values
    const prismaData = mapFormToPrisma(validation.data);

    await prisma.course.create({
      data: {
        ...prismaData,
        userId: session?.user.id as string,
        stripePriceId: data.default_price as string,
      },
    });

    return {
      status: "success",
      message: "Course created successfully",
      data: validation.data,
    };
  } catch {
    return {
      status: "error",
      message: "Failed to create course",
    };
  }
}
