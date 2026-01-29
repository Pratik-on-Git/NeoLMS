"use server"

import { requireAdmin } from "@/app/data/admin/require-admin"
import arcjet, { fixedWindow, request } from "@arcjet/next"
import { prisma } from "@/lib/db"
import { env } from "@/lib/env"
import { ApiResponse } from "@/lib/types"
import { revalidatePath } from "next/cache"

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
});

export async function deleteCourse(courseId: string): Promise<ApiResponse> {
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

        await prisma.course.delete({
            where: {
                id: courseId,
            },
        })
        revalidatePath("/admin/courses");
        return { status: "success", message: "Course deleted successfully." }
    }
    catch{
        return { status: "error", message: "Failed to delete course." }
    }
}