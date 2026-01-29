
import z from "zod";


export const courseLevels = ["Beginner", "Intermediate", "Advanced"] as const;

export const courseStatuses = ["Draft", "Published", "Archived"] as const;

export const courseCategories = [
    "Development",
    "Business",
    "Finance",
    "IT & Software",
    "Office Productivity",
    "Personal Development",
    "Design",
    "Marketing",
    "Lifestyle",
    "Photography",
    "Health & Fitness",
    "Music",
    "Teaching & Academics",
] as const;

export const courseSchema = z.object({
    title: z.string().min(3, {message: "Title must be at least 3 characters long"})
    .max(100, {message: "Title must be at most 100 characters long"}),
    description: z.string().min(10, {message: "Description must be at least 10 characters long"}),

    fileKey: z.string().min(1, {message: "File key is required"}),
    price: z.coerce.number().min(1, {message: "Price must be a positive number"}),

    duration: z.coerce.number().min(1, {message: "Duration must be at least 1 hour"})
    .max(500, {message: "Duration must be at most 500 hours"}),
    level: z.enum(courseLevels, {message: "Level is required"}).default("Beginner"),
    category: z.enum(courseCategories, {message: "Category is required"}),
    smallDescription: z.string().min(10, {message: "Small description must be at least 10 characters long"})
    .max(200, {message: "Small description must be at most 200 characters long"}),
    
    slug: z.string().min(3, {message: "Slug must be at least 3 characters long"}),
    status: z.enum(courseStatuses, {message: "Status is required"}),
})

export const chapterSchema = z.object({
    name: z.string().min(3, {message: "Chapter Name must be at least 3 characters long"}).max(100, {message: "Chapter name must be at most 100 characters long"}),
    courseId: z.string().uuid({message: "Invalid Course ID"}),
});

export const lessonSchema = z.object({
    name: z.string().min(3, { message: "Name must be at least 3 characters long" }),
    courseId: z.string().uuid({ message: "Invalid Course ID" }),
    chapterId: z.string().uuid({ message: "Invalid Chapter ID" }),
    description: z.string().min(3, { message: "Description must be at least 3 characters long" }).optional(),
    thumbnailKey: z.string().optional(),
    videoKey: z.string().optional(),
});

export type CourseFormData = z.infer<typeof courseSchema>;

export type ChapterSchemaType = z.infer<typeof chapterSchema>;

export type LessonSchemaType = z.infer<typeof lessonSchema>;
// Helper function to map UI values to Prisma enum values
export function mapFormToPrisma(data: CourseFormData) {
    const levelMap: Record<typeof data.level, "BEGINNER" | "INTERMEDIATE" | "ADVANCED"> = {
        "Beginner": "BEGINNER",
        "Intermediate": "INTERMEDIATE",
        "Advanced": "ADVANCED",
    };

    const statusMap: Record<typeof data.status, "DRAFT" | "PUBLISHED" | "ARCHIVED"> = {
        "Draft": "DRAFT",
        "Published": "PUBLISHED",
        "Archived": "ARCHIVED",
    };

    return {
        ...data,
        level: levelMap[data.level],
        status: statusMap[data.status],
    };
}

// Utility to map DB enum to display value
export function getLevelDisplay(level: string): string {
    switch (level) {
        case "BEGINNER": return "Beginner";
        case "INTERMEDIATE": return "Intermediate";
        case "ADVANCED": return "Advanced";
        default: return level;
    }
}