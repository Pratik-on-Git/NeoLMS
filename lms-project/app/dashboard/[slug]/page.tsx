
import { getCoursesSidebarData } from "@/app/data/course/get-course-sidebar-data";
import { redirect } from "next/navigation";

interface iAppProps {
    params: Promise<{ slug: string }>;
}

export default async function CourseSlugRoute({ params }: iAppProps) {
    const { slug } = await params;
    
    // Get course data to find the first lesson
    const course = await getCoursesSidebarData(slug);
    
    // Find the first lesson in the first chapter
    const firstChapter = course.course.chapter[0];
    if (firstChapter && firstChapter.lessons.length > 0) {
        const firstLesson = firstChapter.lessons[0];
        redirect(`/dashboard/${slug}/${firstLesson.id}`);
    }
    
    // If no lessons found, show empty state
    return (
        <div className="flex items-center justify-center h-full">
            <div className="text-center">
                <h2 className="text-xl font-semibold text-muted-foreground">No lessons available</h2>
                <p className="text-sm text-muted-foreground mt-2">This course doesn&apos;t have any lessons yet.</p>
            </div>
        </div>
    );
}