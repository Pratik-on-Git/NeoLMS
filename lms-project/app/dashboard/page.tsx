import { EmptyState } from "@/components/general/EmptyState";
import { getAllCourses } from "../data/course/get-all-courses";
import { getEnrolledCourses } from "../data/user/get-enrolled-courses";
import { PublicCourseCard } from "../(public)/_components/PublicCourseCard";
import Link from "next/link";
import { CourseProgressCard } from "./_components/CourseProgressCard";

export default async function DashboardPage() {
    const [courses, enrolledCourses] = await Promise.all([
        getAllCourses(), getEnrolledCourses()
    ]);
    return (
        <>
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold">Enrolled Courses</h1>
                <p className="text-muted-foreground">{enrolledCourses.length} Courses Enrolled. Click on a Course to View Details.</p>
            </div>
            {enrolledCourses.length === 0 ? (
                <EmptyState title="No Enrolled Courses" description="You have not enrolled in any courses yet. Browse our courses and start learning today!" buttonText="Browse Courses" href="/courses"/>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {enrolledCourses.map(( course ) => (
                        <CourseProgressCard key={course.Course.id} data={course} />
                    ))}
                </div>
            )}

            <section className="mt-10">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold">Available Courses</h1>
                    <p className="text-muted-foreground">
                        Here you can see all the courses you can purchase
                    </p>
                </div>

                {courses.filter((course) => 
                !enrolledCourses.some(({Course: enrolled}) => enrolled.id === course.id)
                ).length === 0 ? (
                    <EmptyState title="No Available Courses" description="You have enrolled in all available courses. Check back later for new courses!" buttonText="Browse Courses" href="/courses" />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {courses.filter(
                            (course) =>
                                !enrolledCourses.some(({ Course: enrolled }) => enrolled.id === course.id)
                        ).map((course) => (
                            <PublicCourseCard key={course.id} data={course} />
                        ))}
                    </div>
                )}
            </section>
        </>
    );
}