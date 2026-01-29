import { prisma } from "@/lib/db";
import { CourseLevel } from "@prisma/client";

export async function getAllCourses() {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  const data = await prisma.course.findMany({
    where: {
      status: "PUBLISHED",
    },
    orderBy:{
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      slug: true,
      smallDescription: true,
      fileKey: true,
      duration: true,
      level: true,
      category: true,
    },
  });

  return data;
}

export type PublicCourseType = Awaited<ReturnType<typeof getAllCourses>>[0];
