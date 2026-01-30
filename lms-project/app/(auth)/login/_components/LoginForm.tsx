"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";
import { Loader, Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { SiGithub as GithubIcon } from 'react-icons/si';
import { toast } from "sonner";
import Link from "next/link";

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
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Welcome Back!</CardTitle>
                <CardDescription className="text-sm">Please Log In To Your Account</CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
                <Button
                    onClick={signInWithGithub}
                    variant="github"
                    className="w-full"
                    disabled={githubPending}>
                    {githubPending ? (<>
                        <Loader className="size-4 animate-spin" />
                        <span>Loading...</span>
                    </>) : (<>
                        <GithubIcon className="size-4" />
                        Log In With Github
                    </>)}
                </Button>

                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                    <span className="relative z-10 bg-card px-2 text-muted-foreground">Or Use Your Email Account</span>
                </div>

                <Tabs defaultValue="password" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="password">Password</TabsTrigger>
                        <TabsTrigger value="otp">OTP</TabsTrigger>
                    </TabsList>

                    <TabsContent value="password" className="space-y-4 mt-4">
                        <form onSubmit={signInWithPassword} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email-password">Email</Label>
                                <Input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    type="email"
                                    placeholder="your-email@example.com"
                                    id="email-password"
                                    required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    type="password"
                                    placeholder="••••••••"
                                    id="password"
                                    required />
                            </div>
                            <Button 
                                type="submit" 
                                variant="default" 
                                className="w-full" 
                                disabled={passwordPending}>
                                {passwordPending ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        <span>Logging In...</span>
                                    </>
                                ) : (
                                    <span>Log In</span>
                                )}
                            </Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="otp" className="space-y-4 mt-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email-otp">Email</Label>
                            <Input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
                                placeholder="your-email@example.com"
                                id="email-otp"
                                required />
                        </div>
                        <Button 
                            variant="default" 
                            className="w-full" 
                            onClick={signInWithEmail} 
                            disabled={emailPending}>
                            {emailPending ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    <span>Sending...</span>
                                </>
                            ) : (<>
                                <Send className="size-4" />
                                <span>Continue With Email</span>
                            </>)}
                        </Button>
                    </TabsContent>
                </Tabs>

                <p className="mt-4 text-center text-sm text-muted-foreground">
                    Don&apos;t Have An Account?{" "}
                    <Link href="/signup" className="text-primary hover:underline">
                        Sign Up
                    </Link>
                </p>
            </CardContent>
        </Card>
    );
}