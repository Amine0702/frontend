"use client";
import "@/app/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import AuthWrapper from "@/app/AuthWrapper";
import StoreProvider from "./(components)/redux";
import { SidebarProvider } from "./admin/context/SidebarContext";
import { ThemeProvider } from "./admin/context/ThemeContext"; // Add ThemeProvider
import { useAppSelector } from "./(components)/redux";

const inter = Inter({ subsets: ["latin"] });

interface RootLayoutProps {
  children: React.ReactNode;
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);
  const marginLeft = isSidebarCollapsed ? "ml-[290px]" : "ml-[35px]";
  return <div className={`${marginLeft} p-0`}>{children}</div>;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} bg-gray-50 text-gray-900 dark:bg-dark-bg dark:text-white`}>
          <StoreProvider>
            <ThemeProvider> {/* Add ThemeProvider here */}
              <SidebarProvider>
                <LayoutContent>
                  <AuthWrapper>{children}</AuthWrapper>
                </LayoutContent>
              </SidebarProvider>
            </ThemeProvider>
          </StoreProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}