"use client"

import { AdminLessonType } from "@/app/data/admin/admin-get-lesson";
import { Uploader } from "@/components/file-uploader/Uploader";
import RichTextEditor from "@/components/rich-text-editor/Editor";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { tryCatch } from "@/hooks/try-catch";
import { lessonSchema, LessonSchemaType } from "@/lib/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { Resolver, useForm } from "react-hook-form";
import { updateLesson } from "../actions";
import { toast } from "sonner";
import router from "next/router";

interface iAppProps {
    data: AdminLessonType;
    chapterId: string;
    courseId: string;
}

export function LessonForm({ data, chapterId, courseId }: iAppProps) {
    const [pending, startTransition] = useTransition();
    const form = useForm<LessonSchemaType>({
        resolver: zodResolver(lessonSchema) as Resolver<LessonSchemaType>,
        defaultValues: {
            name: data.title,
            chapterId: chapterId,
            courseId: courseId,
            description: data.description ?? undefined,
            videoKey: data.videoKey ?? undefined,
            thumbnailKey: data.thumbnailKey ?? undefined,
        },
    })
    async function onSubmit(values: LessonSchemaType) {
        startTransition(async () => {
            const { data: result, error } = await tryCatch(updateLesson(values, data.id));

            if (error) {
                toast.error("Unexpected error occurred. Please try again.");
                return;
            }

            if (result.status === "success") {
                toast.success(result.message);
            } else if (result.status === "error") {
                toast.error(result.message);
            }
        });
    }

    return (
        <div>
            <Link href={`/admin/courses/${courseId}/edit`} className={buttonVariants({ variant: "outline", className: "mb-4" })}>
                <ArrowLeft className="size-4" />
                <span>Back to Course</span>
            </Link>

            <Card>
                <CardHeader>
                    <CardTitle>Lesson Configuration</CardTitle>
                    <CardDescription>Configure the details of the lesson here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Lesson Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Lesson Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <RichTextEditor field={field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="thumbnailKey" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Thumbnail Image</FormLabel>
                                    <FormControl>
                                        <Uploader onChange={field.onChange} value={field.value} fileType="image" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="videoKey" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Video</FormLabel>
                                    <FormControl>
                                        <Uploader onChange={field.onChange} value={field.value} fileType="video" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <Button type="submit" disabled={pending}>{
                                pending ? "Saving..." : "Save Lesson"
                            }</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}