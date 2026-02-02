"use client";

import { GradientMesh } from "@/components/ui/gradient-mesh";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field-1";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import logo from "@/public/favicon.png";

export function SignUpForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    });

    async function handleSignUp(e: React.FormEvent) {
        e.preventDefault();

        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
            toast.error("Please fill in all fields");
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        if (formData.password.length < 8) {
            toast.error("Password must be at least 8 characters long");
            return;
        }

        startTransition(async () => {
            try {
                // Sign up with email and password
                const signUpResult = await authClient.signUp.email({
                    email: formData.email,
                    password: formData.password,
                    name: `${formData.firstName} ${formData.lastName}`,
                });

                if (signUpResult.error) {
                    toast.error(signUpResult.error.message || "Failed to create account");
                    return;
                }

                toast.success("Account created successfully!");

                // Send OTP for verification
                const otpResult = await authClient.emailOtp.sendVerificationOtp({
                    email: formData.email,
                    type: "sign-in",
                });

                if (otpResult.error) {
                    toast.error("Account created but failed to send OTP. Please try logging in.");
                    router.push("/login");
                    return;
                }

                toast.success("OTP sent to your email!");

                // Redirect to OTP verification page
                router.push(`/verify-request?email=${encodeURIComponent(formData.email)}`);

            } catch {
                toast.error("An error occurred during sign up");
            }
        });
    }

    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <Link href="/" aria-label="home" className="flex gap-2 items-center font-medium">
                        <Image
                            src={logo}
                            alt="NeoLMS Logo"
                            height={40}
                            width={40}
                            className="h-10 w-10 object-contain"
                            priority
                        />
                        <span className="text-lg font-semibold">NeoLMS</span>
                    </Link>
                </div>
                <div className="flex flex-1 w-full items-center justify-center">
                    <div className="w-full max-w-md">
                        <form onSubmit={handleSignUp} className="flex flex-col gap-6">
                            <FieldGroup>
                                <div className="flex flex-col items-center gap-1 text-center">
                                    <h1 className="text-2xl font-bold">Create An Account</h1>
                                    <p className="text-muted-foreground text-sm text-balance">
                                        Sign up to get started with NeoLMS
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Field>
                                        <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                                        <Input
                                            id="firstName"
                                            type="text"
                                            placeholder="John"
                                            value={formData.firstName}
                                            onChange={(e) =>
                                                setFormData({ ...formData, firstName: e.target.value })
                                            }
                                            required
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                                        <Input
                                            id="lastName"
                                            type="text"
                                            placeholder="Doe"
                                            value={formData.lastName}
                                            onChange={(e) =>
                                                setFormData({ ...formData, lastName: e.target.value })
                                            }
                                            required
                                        />
                                    </Field>
                                </div>

                                <Field>
                                    <FieldLabel htmlFor="email">Email</FieldLabel>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="john.doe@example.com"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({ ...formData, email: e.target.value })
                                        }
                                        required
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="password">Password</FieldLabel>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) =>
                                            setFormData({ ...formData, password: e.target.value })
                                        }
                                        required
                                        minLength={8}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Password must be at least 8 characters long
                                    </p>
                                </Field>

                                <Field>
                                    <Button type="submit" disabled={isPending}>
                                        {isPending ? (
                                            <>
                                                <Loader2 className="size-4 animate-spin" />
                                                <span>Creating Account...</span>
                                            </>
                                        ) : (
                                            <span>Create Account</span>
                                        )}
                                    </Button>
                                    <FieldDescription className="text-center">
                                        Already have an account?{" "}
                                        <Link href="/login" className="underline underline-offset-4">
                                            Log In
                                        </Link>
                                    </FieldDescription>
                                </Field>
                            </FieldGroup>
                        </form>
                        <div className="mt-6 text-balance text-center text-xs text-muted-foreground">
                            By clicking Continue, you agree to our{" "}
                            <span className="hover:text-primary hover:underline font-medium cursor-pointer">
                                Terms and Conditions
                            </span>
                            .
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-muted relative hidden lg:block">
                <GradientMesh
                    colors={["#010804", "#00bc7d", "#008891"]}
                    distortion={8}
                    swirl={0.2}
                    speed={1}
                    rotation={90}
                    waveAmp={0.2}
                    waveFreq={20}
                    waveSpeed={0.2}
                    grain={0.06}
                />
            </div>
        </div>
    );
}