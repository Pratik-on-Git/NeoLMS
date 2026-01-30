import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckIcon, CircleCheckBig } from "lucide-react";
import Link from "next/link";

export default function PaymentSuccess() {
    return (
        <div className="w-full min-h-screen flex flex-1 justify-center items-center">
            <Card className="w-[380px]">
                <CardContent>
                    <div className="w-full flex justify-center">
                        <CheckIcon className="size-14 p-2 bg-green-500/30 text-green-500 rounded-full" />
                    </div>
                    <div className="mt-3 text-center sm:mt-5 w-full">
                        <h1 className="text-center text-xl font-semibold">Payment Successful</h1>
                        <p className="text-center mt-2 text-sm text-muted-foreground tracking-tight">Thank you for your purchase! Your payment has been processed successfully.</p>
                        <Link href="/dashboard" className={buttonVariants({className: "mt-4 w-full"})}>
                            <CircleCheckBig className="size-4"/>Go to Dashboard
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}