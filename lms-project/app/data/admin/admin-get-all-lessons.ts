import "server-only";
import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";

// Get all lessons with their creation date
export async function adminGetAllLessons() {
  await requireAdmin();
  const lessons = await prisma.lesson.findMany({
    select: {
      id: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  return lessons.map(l => ({ id: l.id, date: l.createdAt.toISOString() }));
}

export type AdminAllLessonsType = Awaited<ReturnType<typeof adminGetAllLessons>>;
