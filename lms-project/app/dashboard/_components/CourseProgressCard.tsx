"use client";
import { Badge } from "@/components/ui/badge";
import { getLevelDisplay } from "@/lib/zodSchemas";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useConstructUrl } from "@/hooks/use-construct";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { EnrolledCourseType } from "@/app/data/user/get-enrolled-courses";
import { useCourseProgress } from "@/hooks/use-course-progress";
import { Progress } from "@/components/ui/progress";

interface iAppProps {
    data: EnrolledCourseType;
}

const cardClassName = "group relative py-0 gap-0";
const badgeClassName = "absolute top-2 right-2 z-10";
const imageClassName = "w-full rounded-t-xl aspect-video h-full object-cover";
const cardContentClassName = "p-4";

export function CourseProgressCard({ data }: iAppProps) {
    const thumbnailUrl = useConstructUrl(data.Course.fileKey);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const {totalLessons, completedLessons, progressPercentage} = useCourseProgress({ courseData: data.Course as any });
    return (
        <Card className={cardClassName}>
            <Badge className={badgeClassName}>{getLevelDisplay(data.Course.level)}</Badge>
                <Image
                width={600}
                height={400}
                src={thumbnailUrl}
                alt="Thumbnail Image Of Course"
                className={imageClassName}
            />
            <CardContent className={cardContentClassName}>
                <Link
                    href={`/dashboard/${data.Course.slug}`}
                    className="text-lg font-semibold line-clamp-2 hover:underline group-hover:text-primary transition-colors "
                >
                    {data.Course.title}
                </Link>
                <p className="line-clamp-2 text-sm text-muted-foreground leading-tight mt-2">
                    {data.Course.smallDescription}
                </p>
                <div className="space-y-4 mt-2">
                    <div className="flex justify-between mb-1 text-sm">
                        <p>Progress:</p>
                        <p className="font-medium">{progressPercentage}%</p>
                    </div>
                    <Progress value={progressPercentage} className="h-1.5 rounded-lg mt-4" />
                    <p className="text-xs text-muted-foreground">{completedLessons}/{totalLessons} lessons completed</p>
                </div>
                <Link
                    href={`/dashboard/${data.Course.slug}`}
                    className={buttonVariants({
                        className: "w-full mt-4 justify-center h-10",
                    })}
                >
                    Learn More
                </Link>
            </CardContent>
        </Card>
    );
}
