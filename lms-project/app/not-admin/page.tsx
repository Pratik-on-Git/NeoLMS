import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, ShieldX } from "lucide-react";
import Link from "next/link";

export default function NotAdminRoute() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="bg-destructive/10 rounded-b-full p-4 w-fit mx-auto">
                        <ShieldX className="size-16 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl">Access Denied</CardTitle>
                    <CardDescription className="max-w-xs mx-auto">
                        You Do Not Have The Necessary Permissions To Access This Page.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href="/" className={buttonVariants({
                        className: "w-full",
                    })}>
                        <ArrowLeft className="mr-1 size-4"/>
                        Go Back To Home
                    </Link>
                </CardContent>
            </Card>
        </div>
    )
}