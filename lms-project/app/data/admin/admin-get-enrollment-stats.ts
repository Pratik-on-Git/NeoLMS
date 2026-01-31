
import "server-only";
import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";

export async function adminGetEnrollmentStats() {
	await requireAdmin();

	const thirtyDaysAgo = new Date();

	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

	const enrollments = await prisma.enrollment.findMany({
		where: {
            createdAt: {
                gte: thirtyDaysAgo,
            },
		},
        select: {
            createdAt: true,
            ammount: true,
        },
        orderBy: {
            createdAt: "asc",
        },
	})

    const last30Days : {date: string; enrollments: number}[] = [];

    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split("T")[0];
        last30Days.push({date: dateString, enrollments: 0});
    }

    enrollments.forEach((enrollment) => {
        const enrollmentDate = enrollment.createdAt.toISOString().split("T")[0];
        const dayIndex = last30Days.findIndex((day) => day.date === enrollmentDate);
        if (dayIndex !== -1) {
            last30Days[dayIndex].enrollments++;
        }
    });

    const map = new Map();
    for (const e of enrollments) {
        const d = e.createdAt.toISOString().slice(0, 10);
        const cur = map.get(d) ?? { enrollments: 0, revenue: 0 };
        cur.enrollments += 1;
        cur.revenue += typeof e.ammount === "number" ? e.ammount : 0;
        map.set(d, cur);
    }

    const points = [];
    const cur = new Date(thirtyDaysAgo);
    while (cur <= new Date()) {
        const key = cur.toISOString().slice(0, 10);
        const v = map.get(key) ?? { enrollments: 0, revenue: 0 };
        points.push({ date: key, enrollments: v.enrollments, revenue: v.revenue });
        cur.setDate(cur.getDate() + 1);
    }

    return points;
}

