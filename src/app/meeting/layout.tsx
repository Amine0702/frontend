import type React from "react";
import type { Metadata } from "next";
import ClientProvider from "@/app/meeting/ClientProvider";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Meetings",
  description: "Video meetings for project management",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function MeetingLayout({ children }: RootLayoutProps) {
  return <ClientProvider>{children}</ClientProvider>;
}
