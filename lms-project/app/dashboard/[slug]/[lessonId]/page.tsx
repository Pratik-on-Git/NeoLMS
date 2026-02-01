import { getLessonContent } from "@/app/data/course/get-lesson-content";
import { CourseContent } from "./_components/CourseContent";

type Params = Promise<{ lessonId: string; slug: string }>;

export default async function LessonContentPage({params}: { params: Params }){
    const { lessonId, slug } = await params;
    const data = await getLessonContent(lessonId);
    return (
        <CourseContent data={data} slug={slug} />
    );
}
