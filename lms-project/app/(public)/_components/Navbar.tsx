"use client"

import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/favicon.png";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { UserDropdown } from "./UserDropdown";

const navigationItems = [
    { name: "Home", href: "/" },
    { name: "Courses", href: "/courses" },
    { name: "Dashboard", href: "/dashboard" },
]
export function Navbar() {
    const { data: session, isPending } = authClient.useSession()
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-[backdrop:filter]:bg-background/60">
            <div className="container flex min-h-16 items-center mx-auto md:px-6 lg:px-8">
                <Link href="/" className="flex items-center space-x-2 mr-4">
                    <Image src={Logo} alt="Logo" className="size-9" />
                    <span className="font-bold">NeoLMS</span>
                </Link>

                {/*Desktop Navigation*/}
                <nav className="hidden md:flex md:flex-1 md:items-center md:justify-between">
                    <div className="flex items-center space-x-2">
                        {navigationItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="text-sm font-medium hover:text-primary transition-colors"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                    <div className="flex items-center space-x-4">
                        <ThemeToggle />
                        {isPending ? null : session ? (
                            <UserDropdown
                                name={session?.user?.name && session.user.name.length > 0
                                    ? session.user.name
                                    : session?.user.email.split("@")[0]}
                                email={session.user.email || ""}
                                image={session?.user?.image ?? `https://avatar.vercel.sh/${session?.user?.name}`} />
                        ) : (
                            <>
                                <Button variant="secondary" asChild>
                                    <Link href="/login">
                                        Login
                                    </Link>
                                </Button>
                                <Button asChild>
                                    <Link href="/login">
                                        Get Started
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    )
}
