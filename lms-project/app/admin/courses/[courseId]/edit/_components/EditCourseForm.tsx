"use client"
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useTransition } from "react";
import { tryCatch } from "@/hooks/try-catch";
import { editCourse } from "../actions";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import { courseCategories, CourseFormData, courseLevels, courseSchema, courseStatuses } from "@/lib/zodSchemas";
import { PlusIcon, SparkleIcon } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import slugify from "slugify";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RichTextEditor from "@/components/rich-text-editor/Editor";
import { Uploader } from "@/components/file-uploader/Uploader";
import { AdminCourseSingularType } from "@/app/data/admin/admin-get-course";

interface iAppProps {
    data:AdminCourseSingularType;
}

export function EditCourseForm({data}:iAppProps) {

    const [pending, startTransition] = useTransition();
    const router = useRouter();
    const params = useParams();
    const courseId = params.courseId as string;
    
    const form = useForm<CourseFormData>({
            resolver: zodResolver(courseSchema) as Resolver<CourseFormData>,
            defaultValues: {
                title: data.title,
                description: data.description,
                fileKey: data.fileKey,
                price: data.price,
                duration: data.duration,
                category: data.category as CourseFormData["category"],
                smallDescription: data.smallDescription,
                slug: data.slug,
                level: data.level as CourseFormData["level"],
                status: data.status as CourseFormData["status"],
            },
        })

        function onSubmit(values: CourseFormData) {
                startTransition(async() => {
                    const {data: result, error} = await tryCatch(editCourse({ data: values, courseId }));
        
                    if(error){
                        toast.error("Unexpected error occurred. Please try again.");
                        return;
                    }
        
                    const typedResult = result as { status: string; message: string; data: AdminCourseSingularType };
                    
                    if(typedResult.status === "success"){
                        toast.success(typedResult.message);
                        form.reset({
                            title: typedResult.data.title,
                            description: typedResult.data.description,
                            fileKey: typedResult.data.fileKey,
                            price: typedResult.data.price,
                            duration: typedResult.data.duration,
                            category: typedResult.data.category as CourseFormData["category"],
                            smallDescription: typedResult.data.smallDescription,
                            slug: typedResult.data.slug,
                            level: typedResult.data.level as CourseFormData["level"],
                            status: typedResult.data.status as CourseFormData["status"],
                        });
                        router.push("/admin/courses");
                    } else if (typedResult.status === "error"){
                        toast.error(typedResult.message);
                    }
                });
            }
    return (
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
                                            <Uploader onChange={field.onChange} value={field.value} fileType="image"/>
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
                                    Updating
                                    <Loader2 className="animate-spin ml-1" />
                                    </>
                                ) : (<>
                                    <PlusIcon className="ml-1 size-4" />
                                    Update Course
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>
    )
}