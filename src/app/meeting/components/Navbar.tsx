import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="shadow">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between p-3 font-medium">
        <Link href="/meeting">Nouvelle réunion</Link>
        <SignedIn>
          <div className="flex items-center gap-5">
            <Link href="/meeting/meetings">Mes réunions</Link>
            <UserButton />
          </div>
          <SignedOut>
            <SignInButton />
          </SignedOut>
        </SignedIn>
      </div>
    </header>
  );
}
