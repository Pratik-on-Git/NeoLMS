"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { tryCatch } from "@/hooks/try-catch";
import { CreateCourse } from "./actions";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import { courseCategories, CourseFormData, courseLevels, courseSchema, courseStatuses } from "@/lib/zodSchemas";
import { ArrowLeft, PlusIcon, SparkleIcon } from "lucide-react";
import Link from "next/link";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import slugify from "slugify";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RichTextEditor from "@/components/rich-text-editor/Editor";
import { Uploader } from "@/components/file-uploader/Uploader";

export default function CourseCreationPage() {

    const [pending, startTransition] = useTransition();
    const router = useRouter();

    const form = useForm<CourseFormData>({
        resolver: zodResolver(courseSchema) as Resolver<CourseFormData>,
        defaultValues: {
            title: "",
            description: "",
            fileKey: "",
            price: 0,
            duration: 0,
            category: "IT & Software",
            smallDescription: "",
            slug: "",
            level: "Beginner",
            status: "Draft",
        },
    })

    function onSubmit(values: CourseFormData) {
        startTransition(async() => {
            const {data: result, error} = await tryCatch(CreateCourse(values));

            if(error){
                toast.error("Unexpected error occurred. Please try again.");
                return;
            }

            if(result.status === "success"){
                toast.success(result.message);
                form.reset();
                router.push("/admin/courses");
            } else if (result.status === "error"){
                toast.error(result.message);
            }
        });
    }

    void form;

    return (
        <>
            <div className="flex items-center gap-4">
                <Link href="/admin/courses" className={buttonVariants({
                    variant: "outline",
                    size: "icon",
                })}>
                    <ArrowLeft className="size-4" />
                </Link>
                <h1 className="text-2xl font-bold ">Create Course</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Enter the basic details for the new course.</CardDescription>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form className="space-y-6"
                            onSubmit={form.handleSubmit(onSubmit)}>
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Course Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Title" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                            <div className="flex gap-4 items-end ">
                                <FormField
                                    control={form.control}
                                    name="slug"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>Slug</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Slug" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="button" className="w-fit" onClick={() => {
                                    const titleValue = form.getValues("title")
                                    const slug = slugify(titleValue, { lower: true, strict: true });
                                    form.setValue("slug", slug, { shouldValidate: true })
                                }}>
                                    Generate Slug <SparkleIcon className="ml-1" size={16} />
                                </Button>
                            </div>

                            <FormField
                                control={form.control}
                                name="smallDescription"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Add a Small Description</FormLabel>
                                        <FormControl>
                                            <Textarea className="min-h-20" placeholder="Small Description" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Add Course Details</FormLabel>
                                        <FormControl>
                                            <RichTextEditor field={field} />
                                            {/*<Textarea className="min-h-[150px]" placeholder="Description" {...field} />*/}
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                            <FormField
                                control={form.control}
                                name="fileKey"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Thumbnail Image</FormLabel>
                                        <FormControl>
                                            <Uploader onChange={field.onChange} value={field.value} fileType="image" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Add Category</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select a Category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {courseCategories.map((category) => (
                                                        <SelectItem key={category} value={category}>
                                                            {category}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                <FormField
                                    control={form.control}
                                    name="level"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Add Level</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select a Level" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {courseLevels.map((level) => (
                                                        <SelectItem key={level} value={level}>
                                                            {level}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                <FormField
                                    control={form.control}
                                    name="duration"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Duration (hours)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Duration" type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Add Price ($)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Price" type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                            </div>
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Add Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select a Status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {courseStatuses.map((status) => (
                                                    <SelectItem key={status} value={status}>
                                                        {status}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                            <Button type="submit" disabled={pending}>
                                {pending ? (
                                    <>
                                    Creating
                                    <Loader2 className="animate-spin ml-1" />
                                    </>
                                ) : (<>
                                    <PlusIcon className="ml-1 size-4" />
                                    Create Course
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </>
    )
}