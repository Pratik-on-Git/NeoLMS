"use client";
import { MotionMain } from "@/components/ui/animated";
import { buttonVariants } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Card, CardContentNoPadding, CardHeader, CardTitle } from "@/components/ui/card";
import { ShaderAnimation } from "@/components/ui/shader-animation";

interface featureProps {
    title: string;
    description: string;
    icon: string;
}
const features: featureProps[] = [
    {
        title: "Comprehensive Courses",
        description:
            "Access A Wide Range Of Carefully Curated Courses Designed By Industry Experts.",
        icon: "📚"},
    {
        title: "Interactive Learning",
        description:
            "Engage With Interactive Content, Quizzes, And Assignments To Enhance Your Learning Experience.", 
        icon: "⚡",
    },
    {
        title: "Progress Tracking",
        description: "Monitor Your Progress With Detailed Analytics And Personalized Feedback To Stay Motivated And Achieve Your Learning Goals.",
        icon: "📊"
    },
    {
        title: "Community Support",
        description:
            "Join A Vibrant Community Of Learners And Instructors To Share Knowledge, Ask Questions, And Collaborate On Projects.",
        icon: "👥"
    }    
]

export default function Home() {
    const { data: session } = authClient.useSession()
    const router = useRouter();

    function handleLogin() {
        router.push("/login"); // redirect to login page
    }

    return (
        <>
            <section className="relative py-20 overflow-hidden min-h-screen flex items-center">
                <ShaderAnimation />
                {/* Vignette fade overlay at the bottom */}
                <div 
                    className="absolute inset-x-0 bottom-0 h-72 z-[5] pointer-events-none bg-gradient-to-b from-transparent via-background/70 to-background"
                />
                <MotionMain className="relative z-10 w-full">
                    <div className="flex flex-col items-center text-center space-y-8">
                        <Badge variant="outline" className="bg-black/20 backdrop-blur-sm border-white/20">
                            The Future Of Online Education
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
                            Elevate Your Learning Experience
                        </h1>
                        <p className="max-w-[700px] text-white/80 md:text-xl">
                            Discover A New Way To Learn With Our Modern, Interactive Learning
                            Management System. Access High-Quality Courses Anytime, Anywhere.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mt-8">
                            <Link
                                className={buttonVariants({
                                    size: "lg",
                                })}
                                href="/courses"
                            >
                                Explore Courses
                            </Link>
                            {session ? (
                                <Link
                                    className={buttonVariants({
                                        size: "lg",
                                        variant: "outline",
                                    })}
                                    href="/dashboard"
                                >
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    className={buttonVariants({
                                        size: "lg",
                                        variant: "outline",
                                    })}
                                    onClick={handleLogin}
                                >
                                    Sign In
                                </button>
                            )}
                        </div>
                    </div>
                </MotionMain>
            </section>

            <section className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow"> 
                            <CardHeader>
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <CardTitle className="">{feature.title}</CardTitle>
                                <CardContentNoPadding>
                                    <p className="text-muted-foreground px-0">{feature.description}</p>
                                </CardContentNoPadding>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </section>
        </>
    )
}
