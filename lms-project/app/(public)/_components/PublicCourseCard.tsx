import { PublicCourseType } from "@/app/data/course/get-all-courses";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { School2Icon, TimerIcon } from "lucide-react";
import Image from "next/image";
import { useConstructUrl } from "@/hooks/use-construct";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface iAppProps {
    data: PublicCourseType;
}

const cardClassName = "group relative py-0 gap-0";
const badgeClassName = "absolute top-2 right-2 z-10";
const imageClassName = "w-full rounded-t-xl aspect-video h-full object-cover";
const cardContentClassName = "p-4";

export function PublicCourseCard({ data }: iAppProps) {
    const thumbnailUrl = useConstructUrl(data.fileKey);
    return (
        <Card className={cardClassName}>
            <Badge className={badgeClassName}>{data.level}</Badge>
            <Image
                width={600}
                height={400}
                src={thumbnailUrl}
                alt="Thumbnail Image of Course"
                className={imageClassName}
            />
            <CardContent className={cardContentClassName}>
                <Link
                    href={`/courses/${data.slug}`}
                    className="text-lg font-semibold line-clamp-2 hover:underline group-hover:text-primary transition-colors "
                >
                    {data.title}
                </Link>
                <p className="line-clamp-2 text-sm text-muted-foreground leading-tight mt-2">
                    {data.smallDescription}
                </p>

                <div className="mt-4 flex items-center gap-x-5">
                    <div className="flex items-center gap-x-2">
                        <TimerIcon className="size-6 p-1 rounded-md text-primary bg-primary/10" />
                        <p className="text-sm text-muted-foreground">{data.duration}h</p>
                    </div>
                    <div className="flex items-center gap-x-2">
                        <School2Icon className="size-6 p-1 rounded-md text-primary bg-primary/10" />
                        <p className="text-sm text-muted-foreground">{data.category}</p>
                    </div>
                </div>

                <Link
                    href={`/courses/${data.slug}`}
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

export function PublicCourseCardSkeleton() {
    return (
        <Card className={cardClassName}>
            <div className={`${badgeClassName} flex items-center `}>
                <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="w-full relative h-fit">
                <Skeleton className={imageClassName} />
            </div>
            <CardContent className={cardContentClassName}>
                <div className="space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                </div>

                <div className="mt-4 flex items-center gap-x-5">
                    <div className="flex items-center gap-x-2">
                        <Skeleton className="size-6 rounded-md" />
                        <Skeleton className="h-4 w-8" />
                    </div>
                    <div className="flex items-center gap-x-2">
                        <Skeleton className="size-6 rounded-md" />
                        <Skeleton className="h-4 w-8" />
                    </div>
                </div>
                <Skeleton className="mt-4 h-10 w-full rounded-md" />
            </CardContent>
        </Card>
    );
}

