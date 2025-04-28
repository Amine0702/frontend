"use client"
import type React from "react"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { useGetUserProjectsQuery } from "@/app/state/api"
import { usePathname } from "next/navigation"
import { useAppDispatch, useAppSelector } from "../redux"
import {
  Briefcase,
  FileLineChartIcon as FileChartLine,
  Home,
  Inbox,
  NotebookTabs,
  Users,
  Video,
  ChevronUp,
  ChevronDown,
  Loader2,
  User,
} from "lucide-react"

const Sidebar = () => {
  const [showManagerProjects, setShowManagerProjects] = useState(true)
  const [showInvitedProjects, setShowInvitedProjects] = useState(true)

  const { user, isLoaded: userLoaded } = useUser()
  const clerkUserId = user?.id || ""

  const { data, error, isLoading } = useGetUserProjectsQuery(clerkUserId, {
    skip: !userLoaded || !clerkUserId,
    pollingInterval: 30000, // Poll every 30 seconds for updates
  })

  const dispatch = useAppDispatch()
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed)

  const sidebarWidth = isSidebarCollapsed ? "w-[90px]" : "w-[255px]"
  const sidebarClassNames = `fixed top-0 left-0 h-screen transition-all duration-300 z-50 border-r border-gray-200 dark:border-gray-800 dark:bg-gray-900 bg-white ${sidebarWidth}`

  return (
    <aside className={sidebarClassNames}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center p-3 border-b border-gray-200 dark:border-gray-800">
          <Link href="/">
            {isSidebarCollapsed ? (
              <Image src="/mdw.ico" alt="Logo" width={32} height={32} />
            ) : (
              <div className="flex items-center">
                <Image src="/maison.png" alt="Logo" width={154} height={32} className="dark:hidden" />
                <Image src="/images/logo/maison.png" alt="Logo" width={154} height={32} className="hidden dark:block" />
              </div>
            )}
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-4">
          <div className="mt-4 space-y-1">
            <SidebarLink icon={Home} label="Home" href="/home" isCollapsed={isSidebarCollapsed} />
            <SidebarLink icon={Inbox} label="BoiteRéception" href="/chat" isCollapsed={isSidebarCollapsed} />
            <SidebarLink icon={FileChartLine} label="Rapport" href="/rapport" isCollapsed={isSidebarCollapsed} />
            <SidebarLink icon={Video} label="Join Meet" href="/meeting" isCollapsed={isSidebarCollapsed} />
            <SidebarLink icon={Users} label="Teams" href="/teams" isCollapsed={isSidebarCollapsed} />
            <SidebarLink icon={NotebookTabs} label="Notes" href="/notes" isCollapsed={isSidebarCollapsed} />
            <SidebarLink icon={User} label="Profile" href="/profile" isCollapsed={isSidebarCollapsed} />
          </div>

          <div className="mt-6">
            <button
              onClick={() => setShowManagerProjects((prev) => !prev)}
              className="flex items-center justify-between w-full px-4 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {!isSidebarCollapsed && <span>Vos projets</span>}
              {showManagerProjects ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
            {showManagerProjects && (
              <div className="flex flex-col space-y-1">
                {isLoading && (
                  <div className="px-4 py-2 text-gray-500 flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Chargement...
                  </div>
                )}
                {error && (
                  <div className="px-4 py-2 text-red-500">
                    Erreur lors du chargement des projets: {JSON.stringify(error)}
                  </div>
                )}
                {data?.managerProjects && data.managerProjects.length === 0 && (
                  <div className="px-4 py-2 text-gray-500">Aucun projet trouvé</div>
                )}
                {data?.managerProjects?.map((project) => (
                  <SidebarLink
                    key={project.id}
                    icon={Briefcase}
                    label={project.name}
                    href={`/projects/${project.id}`}
                    isCollapsed={isSidebarCollapsed}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={() => setShowInvitedProjects((prev) => !prev)}
              className="flex items-center justify-between w-full px-4 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {!isSidebarCollapsed && <span>Projets invités</span>}
              {showInvitedProjects ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
            {showInvitedProjects && (
              <div className="flex flex-col space-y-1">
                {isLoading && (
                  <div className="px-4 py-2 text-gray-500 flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Chargement...
                  </div>
                )}
                {error && (
                  <div className="px-4 py-2 text-red-500">
                    Erreur lors du chargement des projets: {JSON.stringify(error)}
                  </div>
                )}
                {data?.invitedProjects && data.invitedProjects.length === 0 && (
                  <div className="px-4 py-2 text-gray-500">Aucun projet trouvé</div>
                )}
                {data?.invitedProjects?.map((project) => (
                  <SidebarLink
                    key={project.id}
                    icon={Briefcase}
                    label={project.name}
                    href={`/projects/${project.id}`}
                    isCollapsed={isSidebarCollapsed}
                  />
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>
    </aside>
  )
}

interface SidebarLinkProps {
  href: string
  icon: React.ElementType
  label: string
  isCollapsed: boolean
}

const SidebarLink = ({ href, icon: Icon, label, isCollapsed }: SidebarLinkProps) => {
  const pathname = usePathname()
  const isActive = pathname === href || (pathname === "/" && href === "/dashboard")

  return (
    <Link href={href} className="w-full">
      <div
        className={`relative flex items-center gap-3 px-4 py-2 transition-colors cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
          isActive ? "bg-gray-100 text-blue-600 dark:bg-gray-700" : "text-gray-800 dark:text-gray-100"
        }`}
      >
        {isActive && !isCollapsed && <div className="absolute left-0 top-0 h-full w-[5px] bg-blue-500" />}
        <Icon className="h-6 w-6" />
        {!isCollapsed && <span className="font-medium">{label}</span>}
      </div>
    </Link>
  )
}

export default Sidebar
