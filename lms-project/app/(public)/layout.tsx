import { ReactNode } from "react"
import { Navbar } from "./_components/Navbar"

export default function LayoutPublic({children}: {children: ReactNode}) {
    return (
        <div>
            <Navbar/>
            <main>{children}</main>
        </div>
    )
}