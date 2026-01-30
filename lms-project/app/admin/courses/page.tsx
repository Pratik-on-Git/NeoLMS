import { adminGetCourses } from "@/app/data/admin/admin-get-courses";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { AdminCourseCard, AdminCourseCardSkeleton } from "./_components/AdminCourseCard";
import { EmptyState } from "@/components/general/EmptyState";
import { Suspense } from "react";

export default function CoursesPage() {
    return (
        <>
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Your Courses</h1>

                <Link href="/admin/courses/create" className={buttonVariants()}>
                    Add New Course
                </Link>
            </div>
            <div>
                <h1>Courses List</h1>
            </div>
            <Suspense fallback={<AdminCourseCardSkeletonLayout />}>
                <RenderCourses />
            </Suspense>
        </>
    );
}

async function RenderCourses() {
    const data = await adminGetCourses();
    return (
        <>
        {data.length === 0 ? (
                <div className="w-full flex">
                    <EmptyState 
                        title="No Courses Found"
                        description="Please Add A New Course To Get Started."
                        buttonText="Add New Course"
                        href="/admin/courses/create"
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-7 w-full">
                    {data.map((course) => (
                        <AdminCourseCard key={course.id} data={course} />
                    ))}
                </div>
            )}
        </>
    )
}

function AdminCourseCardSkeletonLayout() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-7 w-full">
            {Array.from({ length: 4 }).map((_, index) => (
                <AdminCourseCardSkeleton key={index} />
            ))}
        </div>
    )
}
