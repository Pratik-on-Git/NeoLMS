import "server-only";
import { requireUser } from "./require-user";
import { prisma } from "@/lib/db";


export async function getEnrolledCourses() {
	const user = await requireUser();

	const data = await prisma.enrollment.findMany({
		where: {
			userId: user.id,
			status: "Completed",
		},
		select: {
            Course: {
                select: {
                    id: true,
                    title: true,
                    smallDescription: true,
                    fileKey: true,
                    slug: true,
                    duration: true,
                    level: true,
                    chapter: {
                        select: {
                            id: true,
                            lessons: {
                                select: {
                                    id: true,
                                }
                            }
                        }
                    }
                }
            }
		}
	});

	return data;
}

