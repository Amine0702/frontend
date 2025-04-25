"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import DashboardWrapper from "./dashboardWrapper";

interface ConditionalDashboardWrapperProps {
  children: React.ReactNode;
}

const ConditionalDashboardWrapper: React.FC<ConditionalDashboardWrapperProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  const landingPages = ["/", "/landing" ];
  const isLandingPage = landingPages.includes(pathname);

  const adminPages = ["/admin/apk" , "/admin/apk/vue","/admin/apk/profile","/admin/apk/users","/admin/apk/tableau","/admin/apk/sauvgarde","/admin/apk/historique","/admin/apk/analyseretard","/admin/apk/Export","/admin/apk/logs","/admin/apk/cycle", ];
  const isadminPage = adminPages.includes(pathname);


  if (isLandingPage || isadminPage) {
    return <>{children}</>;
  }

  return <DashboardWrapper>{children}</DashboardWrapper>;
};

export default ConditionalDashboardWrapper;
