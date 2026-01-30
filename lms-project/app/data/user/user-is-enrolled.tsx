import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { EnrollmentStatus } from "@prisma/client";

export async function checkIfCourseBought(courseId: string): Promise<boolean> {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) return false;

	const enrollment = await prisma.enrollment.findFirst({
		where: {
			userId: session.user.id,
			courseId: courseId,
		},
		select: {
			status: true,
		},
	});

	return enrollment?.status === EnrollmentStatus.Completed ? true : false;
}