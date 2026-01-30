"use server"
import { requireUser } from "@/app/data/user/require-user";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { ApiResponse } from "@/lib/types";

export async function enrollInCourseAction(courseId: string): Promise<ApiResponse> {
    
    const user = await requireUser();
    
    try {
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
                message: "Course not found."
            }
        }
        let stripeCustomerId = null;
        
        const userWithStripeCustomerId = await prisma.user.findUnique({
            where: { id: user.id },
            select: { stripeCustomerId: true },
        });
        

        if (userWithStripeCustomerId?.stripeCustomerId) {
            
            stripeCustomerId = userWithStripeCustomerId.stripeCustomerId;
        } else {
            
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name || undefined,
                metadata: { userId: user.id },
            });
            
            stripeCustomerId = customer.id;
            await prisma.user.update({
                where: { id: user.id },
                data: { stripeCustomerId: stripeCustomerId },
            });  
        }

        const result  = await prisma.$transaction(async (tx) => {
            const existingEnrollment = await tx.enrollment.findUnique({
                where: {
                    courseId_userId: {
                        courseId: course.id,
                        userId: user.id,
                    },
                },
            });
        });

        return {
            status: "success",
            message: "Enrolled successfully.",
        }

    } catch (error) {
        console.error("Stripe enrollment error:", error); // <-- Added error logging
        return {
            status: "error",
            message: "Failed to enroll in course."
        }
    }
}