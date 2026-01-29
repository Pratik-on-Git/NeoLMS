"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import {
  courseSchema,
  CourseFormData,
  mapFormToPrisma,
  ChapterSchemaType,
  chapterSchema,
  lessonSchema,
  LessonSchemaType,
} from "@/lib/zodSchemas";
import { adminGetCourse } from "@/app/data/admin/admin-get-course";
import arcjet, { fixedWindow, request } from "@arcjet/next";
import { env } from "@/lib/env";
import { revalidatePath } from "next/cache";

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

export async function editCourse({
  data,
  courseId,
}: {
  data: CourseFormData;
  courseId: string;
}): Promise<ApiResponse> {
  const user = await requireAdmin();
  try {
    const req = await request();
    const decision = await aj.protect(req, {
      fingerprint: user.user.id,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return {
          status: "error",
          message: "Too many requests. Please try again later.",
        };
      } else {
        return {
          status: "error",
          message:
            "Request blocked. If this is an error, please contact support.",
        };
      }
    }

    const result = courseSchema.safeParse(data);
    if (!result.success) {
      return {
        status: "error",
        message: "Invalid form data",
      };
    }

    // Map UI values to Prisma enum values
    const prismaData = mapFormToPrisma(result.data);

    await prisma.course.update({
      where: {
        id: courseId,
        userId: user.user.id,
      },
      data: {
        ...prismaData,
      },
    });

    // Fetch the updated course data
    const updatedCourse = await adminGetCourse(courseId);

    return {
      status: "success",
      message: "Course updated successfully",
      data: updatedCourse,
    };
  } catch (error) {
    console.error("Error updating course:", error);
    return {
      status: "error",
      message: "An error occurred while updating the course",
    };
  }
}

export async function reorderLessons(
  chapterId: string,
  lessons: { id: string; position: number }[],
  courseId: string,
): Promise<ApiResponse> {
  await requireAdmin();
  try {
    if (!lessons || lessons.length === 0) {
      return {
        status: "error",
        message: "No lessons provided for reordering",
      };
    }

    const updates = lessons.map((lesson) =>
      prisma.lesson.update({
        where: { id: lesson.id, chapterId: chapterId },
        data: { position: lesson.position },
      }),
    );

    await prisma.$transaction(updates);
    revalidatePath(`/admin/courses/${courseId}/edit`);
    return {
      status: "success",
      message: "Lessons reordered successfully",
    };
  } catch {
    return {
      status: "error",
      message: "An error occurred while reordering lessons",
    };
  }
}

export async function reorderChapters(
  courseId: string,
  chapters: { id: string; position: number }[],
): Promise<ApiResponse> {
  await requireAdmin();
  try {
    if (!chapters || chapters.length === 0) {
      return {
        status: "error",
        message: "No chapters provided for reordering",
      };
    }
    const updates = chapters.map((chapter) =>
      prisma.chapter.update({
        where: { id: chapter.id, courseId: courseId },
        data: { position: chapter.position },
      }),
    );

    await prisma.$transaction(updates);
    revalidatePath(`/admin/courses/${courseId}/edit`);
    return {
      status: "success",
      message: "Chapters reordered successfully",
    };
  } catch {
    return {
      status: "error",
      message: "An error occurred while reordering chapters",
    };
  }
}

export async function createChapter(
  values: ChapterSchemaType,
): Promise<ApiResponse> {
  await requireAdmin();
  try {
    const result = chapterSchema.safeParse(values);
    if (!result.success) {
      return {
        status: "error",
        message: "Invalid chapter data",
      };
    }

    await prisma.$transaction(async (tx) => {
      const maxPos = await tx.chapter.findFirst({
        where: { courseId: result.data.courseId },
        orderBy: { position: "desc" },
        select: { position: true },
      });
      await tx.chapter.create({
        data: {
          title: result.data.name,
          courseId: result.data.courseId,
          position: (maxPos?.position ?? 0) + 1,
        },
      });
    });
    revalidatePath(`/admin/courses/${result.data.courseId}/edit`);
    return {
      status: "success",
      message: "Chapter created successfully",
    };
  } catch {
    return {
      status: "error",
      message: "An error occurred while creating the chapter",
    };
  }
}

export async function createLesson(
  values: LessonSchemaType,
): Promise<ApiResponse> {
  await requireAdmin();
  try {
    const result = lessonSchema.safeParse(values);
    if (!result.success) {
      return {
        status: "error",
        message: "Invalid lesson data",
      };
    }
    await prisma.$transaction(async (tx) => {
      const maxPos = await tx.lesson.findFirst({
        where: { chapterId: result.data.chapterId },
        orderBy: { position: "desc" },
        select: { position: true },
      });
      await tx.lesson.create({
        data: {
          title: result.data.name,
          description: result.data.description,
          videoKey: result.data.videoKey,
          thumbnailKey: result.data.thumbnailKey,
          chapterId: result.data.chapterId,
          position: (maxPos?.position ?? 0) + 1,
        },
      });
    });
    revalidatePath(`/admin/courses/${result.data.courseId}/edit`);
    return {
      status: "success",
      message: "Lesson created successfully",
    };
  } catch {
    return {
      status: "error",
      message: "An error occurred while creating the lesson",
    };
  }
}

export async function deleteLesson({
  lessonId,
  chapterId,
  courseId,
}: {
  lessonId: string;
  chapterId: string;
  courseId: string;
}): Promise<ApiResponse> {
  await requireAdmin();
  try {
    const chapterWithLesson = await prisma.chapter.findUnique({
      where: {
        id: chapterId,
      },
      select: {
        lessons: {
          orderBy: { position: "asc" },
          select: { id: true, position: true },
        },
      },
    });

    if (!chapterWithLesson) {
      return {
        status: "error",
        message: "Chapter not found",
      };
    }

    const lessons = chapterWithLesson.lessons;
    const lessonToDelete = lessons.find((lesson) => lesson.id === lessonId);
    if (!lessonToDelete) {
      return {
        status: "error",
        message: "Lesson not found in the specified chapter",
      };
    }

    const remainingLessons = lessons.filter((lesson) => lesson.id !== lessonId);

    const updates = remainingLessons.map((lesson, index) => {
      return prisma.lesson.update({
        where: { id: lesson.id },
        data: { position: index + 1 },
      });
    });

    await prisma.$transaction([
      ...updates,
      prisma.lesson.delete({
        where: { id: lessonId, chapterId: chapterId },
      }),
    ]);
    revalidatePath(`/admin/courses/${courseId}/edit`);
    return {
      status: "success",
      message: "Lesson deleted successfully",
    };
  } catch {
    return {
      status: "error",
      message: "An error occurred while deleting the lesson",
    };
  }
}

export async function deleteChapter({
  chapterId,
  courseId,
}: {
  chapterId: string;
  courseId: string;
}): Promise<ApiResponse> {
  await requireAdmin();
  try {
    const courseWithChapters = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        chapter: {
          orderBy: { position: "asc" },
          select: { id: true, position: true },
        },
      },
    });

    if (!courseWithChapters) {
      return {
        status: "error",
        message: "Course not found",
      };
    }

    const chapters = courseWithChapters.chapter;
    const chapterToDelete = chapters.find((chapter) => chapter.id === chapterId);
    if (!chapterToDelete) {
      return {
        status: "error",
        message: "Chapter not found in the specified course",
      };
    }

    const remainingChapters = chapters.filter((chapter) => chapter.id !== chapterId);

    const updates = remainingChapters.map((chapter, index) => {
      return prisma.chapter.update({
        where: { id: chapter.id },
        data: { position: index + 1 },
      });
    });

    await prisma.$transaction([
      ...updates,
      prisma.chapter.delete({
        where: { id: chapterId },
      }),
    ]);
    revalidatePath(`/admin/courses/${courseId}/edit`);
    return {
      status: "success",
      message: "Chapter deleted successfully",
    };
  } catch {
    return {
      status: "error",
      message: "An error occurred while deleting the chapter",
    };
  }
}