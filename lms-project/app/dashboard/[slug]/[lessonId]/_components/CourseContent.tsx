"use client";

import { LessonContentType } from "@/app/data/course/get-lesson-content";
import { RenderDescription } from "@/components/rich-text-editor/RenderDescription";
import { Button } from "@/components/ui/button";
import { useConstructUrl } from "@/hooks/use-construct";
import { BookIcon, CheckCircle } from "lucide-react";
import { useTransition } from "react";
import { tryCatch } from "@/hooks/try-catch";
import { markLessonComplete } from "../actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface iAppProps {
    data: LessonContentType;
    slug: string;
}

function VideoPlayer({
    thumbnailKey,
    videoKey,
}: {
    thumbnailKey: string;
    videoKey: string;
}) {
    const videoUrl = useConstructUrl(videoKey);
    const thumbnailUrl = useConstructUrl(thumbnailKey);

    if (!videoKey) {
        return (
            <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center">
                <BookIcon className="size-16 text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">
                    This lesson does not have a video yet
                </p>
            </div>
        );
    }

    return (
        <div className="aspect-video bg-black rounded-lg relative overflow-hidden">
            <video
                poster={thumbnailUrl}
                controls
                className="w-full h-full object-cover"
            >
                <source src={videoUrl} type="video/mp4" />
                <source src={videoUrl} type="video/webm" />
                <source src={videoUrl} type="video/mov" />
                <source src={videoUrl} type="video/m4v" />
                <source src={videoUrl} type="video/avi" />
                <source src={videoUrl} type="video/ogg" />
                Your browser does not support the video.
            </video>
        </div>
    )
}

export function CourseContent({ data, slug }: iAppProps) {
    const [pending, startTransition] = useTransition();
    const router = useRouter();

    function onSubmit() {
        startTransition(async () => {
            const { data: result, error } = await tryCatch(markLessonComplete(data.id, slug));
            if (error) {
                toast.error("Unexpected error occurred. Please try again.");
                return;
            }

            if (result.status === "success") {
                toast.success(result.message);
                router.refresh();

            } else if (result.status === "error") {
                toast.error(result.message);
            }
        });
    }

    return (
        <div className="flex flex-col h-full bg-background pl-6">
            <VideoPlayer thumbnailKey={data.thumbnailKey ?? ""} videoKey={data.videoKey ?? ""} />

            <div className="py-4 border-b">
                {data.lessonProgress.length > 0 ? (
                    <Button variant="outline" className="bg-green-500/10 text-green-500 hover:text-green-600">
                        <CheckCircle className="size-4 mr-2 text-green-500" />
                        Lesson Completed
                    </Button>
                ) : (
                    <Button variant="outline" onClick={onSubmit} disabled={pending}>
                        <CheckCircle className="size-4 mr-2 text-green-500" />
                        Mark as Complete
                    </Button>
                )
                }
            </div>
            <div className="space-y-3 pt-3">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{data.title}</h1>
                {data.description && (
                    data.description.startsWith('{') ?
                        <RenderDescription json={JSON.parse(data.description)} /> :
                        <p className="text-muted-foreground">{data.description}</p>
                )}
            </div>
        </div>
    );
}