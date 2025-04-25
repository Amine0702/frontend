"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { useGetProjectsByClerkUserQuery } from "@/app/state/api"
import { usePathname } from "next/navigation"
import {
  Briefcase,
  ChevronDown,
  ChevronUp,
  FileLineChartIcon as FileChartLine,
  NotebookTabs,
  Home,
  Inbox,
  Users,
  Video,
} from "lucide-react"
import { useAppSelector } from "../redux" // pour accéder à l'état global de la sidebar

const Sidebar = () => {
  // État local pour le survol
  const [isHovered, setIsHovered] = useState(false)

  // Lecture de l'état global pour la sidebar (par défaut elle est ouverte, donc isSidebarCollapsed = false)
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed)

  // Les sections "Vos Projets" et "Projets Invitée"
  const [showProjects, setShowProjects] = useState(true)
  const [showProjects2, setShowProjects2] = useState(true)

  const { user, isLoaded: userLoaded } = useUser()
  const clerkUserId = user?.id || ""

  const {
    data: projects,
    error,
    isLoading,
  } = useGetProjectsByClerkUserQuery(clerkUserId, { skip: !userLoaded || !clerkUserId })

  const pathname = usePathname()

  // La sidebar est ouverte si le state global indique "non collapsée"
  const isExpanded = !isSidebarCollapsed
  // Si l'utilisateur survole la sidebar, on force son ouverture (ajoute une marge temporaire)
  const effectiveExpanded = isExpanded || isHovered

  return (
    <aside
      className={`fixed top-0 left-0 h-screen border-r border-gray-200 dark:border-gray-800 dark:bg-gray-900 bg-white transition-all duration-300
        ${effectiveExpanded ? "w-[290px]" : "w-[90px]"}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col h-full">
        {/* Header / Logo avec le bouton pouvant également déclencher le survol */}
        <div
          className="py-6 px-5 cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
        >
          <Link href="/">
            <div className={`flex items-center ${effectiveExpanded ? "justify-start" : "justify-center"}`}>
              {effectiveExpanded ? (
                <>
                  <Image src="/maison.png" alt="Logo" width={154} height={32} className="dark:hidden" />
                  <Image src="/images/logo/maison.png" alt="Logo" width={154} height={32} className="hidden dark:block" />
                </>
              ) : (
                <Image src="/images/logo/mdw.ico" alt="Logo" width={32} height={32} />
              )}
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-5 hide-scrollbar">
          {effectiveExpanded && (
            <h2 className="mb-3 text-xs uppercase text-gray-400 font-medium">MENU</h2>
          )}

          <ul className="flex flex-col gap-1">
            <SidebarLink
              icon={Home}
              label="Accueil"
              href="/home"
              isActive={pathname === "/home"}
              showText={effectiveExpanded}
            />
            <SidebarLink
              icon={Inbox}
              label="Boîte Réception"
              href="/chat"
              isActive={pathname === "/chat"}
              showText={effectiveExpanded}
            />
            <SidebarLink
              icon={FileChartLine}
              label="Rapport"
              href="/rapport"
              isActive={pathname === "/rapport"}
              showText={effectiveExpanded}
            />
            <SidebarLink
              icon={Video}
              label="Réunion"
              href="/meeting"
              isActive={pathname === "/meeting"}
              showText={effectiveExpanded}
            />
            <SidebarLink
              icon={Users}
              label="Équipes"
              href="/teams"
              isActive={pathname === "/teams"}
              showText={effectiveExpanded}
            />
            <SidebarLink
              icon={NotebookTabs}
              label="Notes"
              href="/notes"
              isActive={pathname === "/notes"}
              showText={effectiveExpanded}
            />
          </ul>

          {/* Section "Vos Projets" */}
          <div className="mt-4">
            <button
              onClick={() => setShowProjects(!showProjects)}
              className="w-full flex items-center justify-between py-2 text-purple-600 font-medium"
            >
              {effectiveExpanded && <span>Vos Projets</span>}
              {effectiveExpanded && (
                showProjects ? (
                  <ChevronUp className="h-5 w-5 text-purple-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-purple-600" />
                )
              )}
            </button>

            {showProjects && (
              <ul className="flex flex-col gap-1 mt-1">
                {isLoading && <div className="px-4 py-2 text-gray-500 text-sm">Chargement...</div>}
                {error && <div className="px-4 py-2 text-red-500 text-sm">Erreur lors du chargement des projets.</div>}
                {projects?.map((project) => (
                  <ProjectLink
                    key={project.id}
                    name={project.name}
                    href={`/projects/${project.id}`}
                    isActive={pathname === `/projects/${project.id}`}
                    showText={effectiveExpanded}
                  />
                ))}
                {/* Fallback en l'absence de données */}
                {!isLoading && !error && (!projects || projects.length === 0) && (
                  <>
                    <ProjectLink name="douda" href="/projects/douda" isActive={pathname === "/projects/douda"} showText={effectiveExpanded} />
                    <ProjectLink name="ddeeee" href="/projects/ddeeee" isActive={pathname === "/projects/ddeeee"} showText={effectiveExpanded} />
                    <ProjectLink name="h" href="/projects/h" isActive={pathname === "/projects/h"} showText={effectiveExpanded} />
                  </>
                )}
              </ul>
            )}
          </div>

          {/* Section "Projets Invitée" */}
          <div className="mt-4">
            <button
              onClick={() => setShowProjects2(!showProjects2)}
              className="w-full flex items-center justify-between py-2 text-purple-600 font-medium"
            >
              {effectiveExpanded && <span>Projets Invitée</span>}
              {effectiveExpanded && (
                showProjects2 ? (
                  <ChevronUp className="h-5 w-5 text-purple-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-purple-600" />
                )
              )}
            </button>

            {showProjects2 && (
              <ul className="flex flex-col gap-1 mt-1">
                {isLoading && <div className="px-4 py-2 text-gray-500 text-sm">Chargement...</div>}
                {error && <div className="px-4 py-2 text-red-500 text-sm">Erreur lors du chargement des projets.</div>}
                {projects?.map((project) => (
                  <ProjectLink
                    key={project.id}
                    name={project.name}
                    href={`/projects/${project.id}`}
                    isActive={pathname === `/projects/${project.id}`}
                    showText={effectiveExpanded}
                  />
                ))}
                {/* Fallback en l'absence de données */}
                {!isLoading && !error && (!projects || projects.length === 0) && (
                  <>
                    <ProjectLink name="douda" href="/projects/douda" isActive={pathname === "/projects/douda"} showText={effectiveExpanded} />
                    <ProjectLink name="ddeeee" href="/projects/ddeeee" isActive={pathname === "/projects/ddeeee"} showText={effectiveExpanded} />
                    <ProjectLink name="h" href="/projects/h" isActive={pathname === "/projects/h"} showText={effectiveExpanded} />
                  </>
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}

interface SidebarLinkProps {
  href: string
  icon: React.ElementType
  label: string
  isActive: boolean
  showText: boolean
}

const SidebarLink = ({ href, icon: Icon, label, isActive, showText }: SidebarLinkProps) => {
  return (
    <li>
      <Link href={href} className="w-full">
        <div
          className={`flex items-center gap-3 px-3 py-2 rounded-md ${
            isActive ? "bg-purple-50 text-purple-600" : "text-gray-700 hover:bg-gray-100"
          } ${showText ? "justify-start" : "justify-center"}`}
        >
          <Icon className={`h-5 w-5 ${isActive ? "text-purple-600" : "text-gray-500"}`} />
          {showText && <span className="text-sm font-medium">{label}</span>}
        </div>
      </Link>
    </li>
  )
}

interface ProjectLinkProps {
  href: string
  name: string
  isActive: boolean
  showText: boolean
}

const ProjectLink = ({ href, name, isActive, showText }: ProjectLinkProps) => {
  return (
    <li>
      <Link href={href} className="w-full">
        <div
          className={`flex items-center gap-3 px-3 py-2 rounded-md ${
            isActive ? "bg-purple-50 text-purple-600" : "text-gray-700 hover:bg-gray-100"
          } ${showText ? "justify-start" : "justify-center"}`}
        >
          <Briefcase className={`h-5 w-5 ${isActive ? "text-purple-600" : "text-gray-500"}`} />
          {showText && <span className="text-sm font-medium">{name}</span>}
        </div>
      </Link>
    </li>
  )
}

export default Sidebar
