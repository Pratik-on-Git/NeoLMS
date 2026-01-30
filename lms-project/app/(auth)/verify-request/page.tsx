"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export default function VerifyRequest() {
    const router = useRouter();
    const [otp, setOtp] = useState("");
    const [emailPending, startTransition] = useTransition();
    const params = useSearchParams();
    const email = params.get("email") as string;
    const isOtpComplete = otp.length === 6;

    function verifyOtp() {
        startTransition(async () => {
            await authClient.signIn.emailOtp({
                email: email,
                otp: otp,
                fetchOptions: {
                    onSuccess: () => {
                        toast.success("Successfully verified! You are now logged in.");
                        router.push("/");
                    },
                    onError: () => {
                        toast.error("Invalid OTP. Please try again.");
                    },
                },
            });
        });
    }
    return (
        <Card className="w-full mx-auto max-w-sm">
            <CardHeader className="text-center">
                <CardTitle className="text-xl">Check Your Email</CardTitle>
                <CardDescription>We Have Sent A Login Link To Your Email Address. Please Check Your Inbox And Click On The Link To Proceed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-2">
                    <InputOTP
                        maxLength={6}
                        className="gap-2"
                        value={otp}
                        onChange={(value) => setOtp(value)}>
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                        </InputOTPGroup>
                    </InputOTP>
                    <p className="text-sm text-muted-foreground">Please Enter The 6-Digit Code Sent To Your Email.</p>
                </div>

                <Button className="w-full" onClick={verifyOtp} disabled={emailPending || !isOtpComplete}>
                        {emailPending ? (<>
                        <Loader2 className="size-4 animate-spin" />
                        <span>Verifying...</span>
                    </>) : (
                        <>
                            Verify OTP
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    )
}