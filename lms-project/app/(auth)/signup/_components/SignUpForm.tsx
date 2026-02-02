"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import Link from "next/link";

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
        <Card>
                <CardHeader>
                <CardTitle className="text-xl">Create An Account</CardTitle>
                <CardDescription>Sign Up To Get Started With NeoLMS</CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
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
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
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
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
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
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
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
                            Password Must Be At Least 8 Characters Long
                        </p>
                    </div>

                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                <span>Creating Account...</span>
                            </>
                        ) : (
                            <span>Create Account</span>
                        )}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                        Already Have An Account?{" "}
                        <Link href="/login" className="text-primary hover:underline">
                            Log In
                        </Link>
                    </p>
                </form>
            </CardContent>
        </Card>
    );
}