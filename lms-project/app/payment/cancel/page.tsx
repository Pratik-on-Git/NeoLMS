import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CircleChevronLeft, XIcon } from "lucide-react";
import Link from "next/link";

export default function PaymentCancelled() {
    return (
        <div className="w-full min-h-screen flex flex-1 justify-center items-center">
            <Card className="w-[380px]">
                <CardContent>
                    <div className="w-full flex justify-center">
                        <XIcon className="size-14 p-2 bg-red-500/30 text-red-500 rounded-full" />
                    </div>
                    <div className="mt-3 text-center sm:mt-5 w-full">
                        <h1 className="text-center text-xl font-semibold">Payment Cancelled</h1>
                        <p className="text-center mt-2 text-sm text-muted-foreground tracking-tight">Your payment was not completed. You can try again or contact support if the issue persists.</p>
                        <Link href="/" className={buttonVariants({className: "mt-4 w-full"})}>
                            <CircleChevronLeft className="size-4"/>Go Back to Home Page
                        </Link>
                    </div>
                </CardContent>

            </Card>
        </div>
    );
}

