import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="shadow">
        <div className="max-w-5xl mx-auto h-14 p-3 flex items-center justify-between font-medium">
            <Link href="/meeting">New meeting</Link>
            <SignedIn>
                <div className="flex items-center gap-5">
                    <Link href = "/meeting/meetings">Meetings</Link>
                    <UserButton />
                </div>
            <SignedOut>
                <SignInButton />
            </SignedOut>
            </SignedIn>
        </div>
    </header>
  )
}

