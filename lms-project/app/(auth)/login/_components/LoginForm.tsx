"use client";

import { GradientMesh } from "@/components/ui/gradient-mesh";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field-1";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Github } from "@aliimam/logos";
import { authClient } from "@/lib/auth-client";
import { Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import logo from "@/public/favicon.png";

export function LoginForm() {
    const router = useRouter();
    const [githubPending, startGithubTransition] = useTransition();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailPending, startEmailTransition] = useTransition();
    const [passwordPending, startPasswordTransition] = useTransition();

    async function signInWithGithub() {
        startGithubTransition(async () => {
            await authClient.signIn.social({
                provider: "github",
                callbackURL: "/",
                fetchOptions: {
                    onSuccess: () => { toast.success("Successfully logged in with GitHub!") },
                    onError: () => { toast.error("Something went wrong during GitHub login.") }
                },
            });
        });
    }

    async function signInWithEmail() {
        if (!email) {
            toast.error("Please enter your email");
            return;
        }

        startEmailTransition(async () => {
            const { error } = await authClient.emailOtp.sendVerificationOtp({
                email: email,
                type: "sign-in",
            });

            if (error) {
                toast.error(error.message || "Failed to send OTP");
                return;
            }

            toast.success("OTP sent to your email!");
            router.push(`/verify-request?email=${encodeURIComponent(email)}`);
        });
    }

    async function signInWithPassword(e: React.FormEvent) {
        e.preventDefault();

        if (!email || !password) {
            toast.error("Please enter both email and password");
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        startPasswordTransition(async () => {
            await authClient.signIn.email({
                email: email,
                password: password,
                fetchOptions: {
                    onSuccess: () => {
                        toast.success("Successfully logged in!");
                        router.push("/");
                    },
                    onError: (ctx) => {
                        toast.error(ctx.error.message || "Failed to log in");
                    }
                },
            });
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
                        <form className="flex flex-col gap-6">
                            <FieldGroup>
                                <div className="flex flex-col items-center gap-1 text-center">
                                    <h1 className="text-2xl font-bold">Welcome Back!</h1>
                                    <p className="text-muted-foreground text-sm text-balance">
                                        Please log in to your account
                                    </p>
                                </div>

                                <Tabs defaultValue="password" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="password">Password</TabsTrigger>
                                        <TabsTrigger value="otp">OTP</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="password" className="space-y-4 mt-4">
                                        <Field>
                                            <FieldLabel htmlFor="email-password">Email</FieldLabel>
                                            <Input
                                                id="email-password"
                                                type="email"
                                                placeholder="your-email@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </Field>
                                        <Field>
                                            <div className="flex items-center">
                                                <FieldLabel htmlFor="password">Password</FieldLabel>
                                            </div>
                                            <Input
                                                id="password"
                                                placeholder="••••••••"
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                        </Field>
                                        <Field>
                                            <Button
                                                type="submit"
                                                onClick={signInWithPassword}
                                                disabled={passwordPending}
                                            >
                                                {passwordPending ? (
                                                    <>
                                                        <Loader2 className="size-4 animate-spin" />
                                                        <span>Logging In...</span>
                                                    </>
                                                ) : (
                                                    <span>Log In</span>
                                                )}
                                            </Button>
                                        </Field>
                                    </TabsContent>

                                    <TabsContent value="otp" className="space-y-4 mt-4">
                                        <Field>
                                            <FieldLabel htmlFor="email-otp">Email</FieldLabel>
                                            <Input
                                                id="email-otp"
                                                type="email"
                                                placeholder="your-email@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </Field>
                                        <Field>
                                            <Button
                                                type="button"
                                                onClick={signInWithEmail}
                                                disabled={emailPending}
                                            >
                                                {emailPending ? (
                                                    <>
                                                        <Loader2 className="size-4 animate-spin" />
                                                        <span>Sending...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="size-4" />
                                                        <span>Continue With Email</span>
                                                    </>
                                                )}
                                            </Button>
                                        </Field>
                                    </TabsContent>
                                </Tabs>

                                <FieldSeparator>Or continue with</FieldSeparator>

                                <Field>
                                    <Button
                                        className="flex gap-2"
                                        variant="outline"
                                        type="button"
                                        onClick={signInWithGithub}
                                        disabled={githubPending}
                                    >
                                        {githubPending ? (
                                            <>
                                                <Loader2 className="size-4 animate-spin" />
                                                <span>Loading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Github />
                                                <span>Login with GitHub</span>
                                            </>
                                        )}
                                    </Button>
                                    <FieldDescription className="text-center">
                                        Don&apos;t have an account?{" "}
                                        <Link href="/signup" className="underline underline-offset-4">
                                            Sign up
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
                    colors={["#010804", "#3fb983", "#2b9fbf"]}
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