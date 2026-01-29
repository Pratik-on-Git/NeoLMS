import { Ban, PlusCircle } from "lucide-react";
import { Button, buttonVariants } from "../ui/button";
import Link from "next/link";

interface iAppProps {
    title?: string;
    description?: string;
    buttonText?: string;
    href?: string;
}

export function EmptyState({ title = "No items yet", description = "There is nothing to show here.", buttonText = "Create", href }: iAppProps) {
    return (
        <div className="flex flex-col w-full h-full items-center justify-center rounded-md border-2 border-dashed border-muted p-8 text-center animate-in fade-in-50">
            <div className="flex size-24 items-center justify-center rounded-full bg-red-600/15">
                <Ban className="size-14 text-primary text-red-600"  />
            </div>
            <h2 className="mt-6">
                {title}
            </h2>
            <p className="text-sm text-muted-foreground">
                {description}
            </p>
            {href ? (
                <Link href={href}>
                    <Button className={buttonVariants({variant: "default", className: "mt-4 cursor-pointer"})}>
                        <PlusCircle />{buttonText}
                    </Button>
                </Link>
            ) : null}
        </div>
    )
}