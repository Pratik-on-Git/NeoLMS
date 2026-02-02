import { getLessonContent } from "@/app/data/course/get-lesson-content";
import { CourseContent } from "./_components/CourseContent";
import { Suspense } from "react";
import { LessonSkeleton } from "./_components/LessonSkeleton";

type Params = Promise<{ lessonId: string; slug: string }>;

export default async function LessonContentPage({params}: { params: Params }){
    const { lessonId, slug } = await params;

    return (
        <Suspense fallback={<LessonSkeleton />}>
        <LessonContentLoader lessonId={lessonId} slug={slug} />
        </Suspense>
    );
}

async function LessonContentLoader({lessonId, slug}: {lessonId: string; slug: string}){
    const data = await getLessonContent(lessonId);
    return <CourseContent data={data} slug={slug} />;
}
