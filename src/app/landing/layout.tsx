import { ClerkProvider } from "@clerk/nextjs";
import "./landing.css";

export default function LandingLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <html lang="en">
        <head>
          <title>Landing Page</title>
        </head>
        <body>
          {children}
        </body>
      </html>
    );
  }
  