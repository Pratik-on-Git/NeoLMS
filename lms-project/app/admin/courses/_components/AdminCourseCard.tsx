import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { AdminCourseType } from "@/app/data/admin/admin-get-courses";
import { getLevelDisplay } from "@/lib/zodSchemas";
import { useConstructUrl } from "@/hooks/use-construct";
import Link from "next/link";
import { ArrowRight, Eye, MoreVertical, Pencil, School2, TimerIcon, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

interface iAppProps {
    data: AdminCourseType;
}

export function AdminCourseCard({ data }: iAppProps) {
    const thumbnailUrl = useConstructUrl(data.fileKey);
    return (
        <Card className="group relative py-0 gap-0">
            <div className="relative w-full rounded-t-lg h-[250px] bg-muted overflow-hidden">
                <div className="absolute top-2 right-2 z-10">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="secondary"
                                size="icon"
                            >
                                <MoreVertical className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem asChild>
                                <Link href={`/admin/courses/${data.id}/edit`} className="flex items-center">
                                    <Pencil className="size-4 mr-2"/> Edit Course
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/courses/${data.slug}`} className="flex items-center">
                                    <Eye className="size-4 mr-2"/> Preview
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href={`/admin/courses/${data.id}/delete`} className="flex items-center">
                                    <Trash2 className="size-4 mr-2 text-destructive"/> Delete Course
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                {thumbnailUrl ? (
                    <Image
                        src={thumbnailUrl}
                        alt={data.title ?? "Course Image"}
                        fill
                        className="object-cover w-full h-full"
                        sizes="(min-width: 1024px) 600px, 100vw"
                        priority
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        No Image
                    </div>
                )}
            </div>
            <CardContent className="p-4">
                <Link
                    href={`/admin/courses/${data.id}/edit`}
                    className="text-lg font-medium line-clamp-2 hover:underline group-hover:text-primary transition-colors"
                >
                    {data.title}
                </Link>
                <p className="line-clamp-2 text-sm text-muted-foreground leading-tight">{data.smallDescription}</p>
                <div className="mt-4 flex items-center gap-x-5">
                    <div className="flex items-center gap-x-2">
                        <TimerIcon className="size-6 p-1 rounded-md text-primary bg-primary/10" />
                        <p className="text-sm text-muted-foreground">{data.duration} Hrs.</p>
                    </div>
                    <div className="flex items-center gap-x-2">
                        <School2 className="size-6 p-1 rounded-md text-primary bg-primary/10" />
                        <p className="text-sm text-muted-foreground">{getLevelDisplay(data.level)}</p>
                    </div>
                </div>
                <Link
                    href={`/admin/courses/${data.id}/edit`}
                    className={buttonVariants({
                        className: "w-full mt-4 justify-center h-10",
                    })}
                >
                    Edit Course <ArrowRight className="size-4" />
                </Link>
            </CardContent>
        </Card>
    );
}


export function AdminCourseCardSkeleton() {
    return (
        <Card className="group relative py-0 gap-0 animate-pulse">
            <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="size-8 rounded-md" />
            </div>
            <div className="w-full relative h-fit">
                <Skeleton className="w-full relative h-fit"/>
                <Skeleton className="w-full rounded-t-lg aspect-video h-[250px] object-cover"/>
            </div>
            <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2 rounded" />
                <Skeleton className="h-4 w-full mb-4 rounded" />
                <div className="mt-4 flex items-center gap-x-5">
                    <div className="flex items-center gap-x-2">
                        <Skeleton className="size-6 rounded-md" />
                        <Skeleton className="h-4 w-10 rounded" />
                    </div>
                    <div className="flex items-center gap-x-2">
                        <Skeleton className="size-6 rounded-md" />
                        <Skeleton className="h-4 w-10 rounded" />
                    </div>
                </div>
                <Skeleton className="mt-4 h-10 w-full rounded"/>
            </CardContent>
        </Card>
    )
}