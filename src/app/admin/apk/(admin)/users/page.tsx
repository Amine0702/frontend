"use client"

import type React from "react"

import { useState, useEffect, type JSX } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  UserIcon,
  TableCellsIcon,
  TrashIcon,
  DocumentChartBarIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserPlusIcon,
  AdjustmentsHorizontalIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { Toaster, toast } from "sonner"

// Palette de couleurs
const primaryColor = "#b03ff3" // mauve dominant
const accentYellow = "#FFC107"
const accentGreen = "#4CAF50"
const accentOrange = "#FF9800"

// --- Données simulées pour le graphique
const performanceData = [
  { jour: "Lun", tâches: 5 },
  { jour: "Mar", tâches: 7 },
  { jour: "Mer", tâches: 10 },
  { jour: "Jeu", tâches: 8 },
  { jour: "Ven", tâches: 12 },
  { jour: "Sam", tâches: 3 },
  { jour: "Dim", tâches: 2 },
]

// --- Types et données initiales

// Type pour un membre de l'équipe
type Member = {
  id: number
  name: string
  email: string
  role: "Admin" | "Manager" | "Membre"
  status: "active" | "pending" | "inactive"
  photo: string
  dateAdded?: Date
}

// Type pour un projet
type Project = {
  id: string
  name: string
  startDate: Date
  manager: string
  team: Member[]
}

// Données simulées pour les projets
const initialProjects: Project[] = [
  {
    id: "alpha",
    name: "Projet Alpha",
    startDate: new Date("2024-01-10"),
    manager: "Alice Dupont",
    team: [
      {
        id: 1,
        name: "Alex Dupont",
        email: "alex@example.com",
        role: "Admin",
        status: "active",
        photo: "https://via.placeholder.com/48",
        dateAdded: new Date("2024-01-15"),
      },
      {
        id: 2,
        name: "Marie Leroy",
        email: "marie@example.com",
        role: "Manager",
        status: "active",
        photo: "https://via.placeholder.com/48",
        dateAdded: new Date("2024-01-20"),
      },
      {
        id: 3,
        name: "Jean Martin",
        email: "jean.m@domain.com",
        role: "Membre",
        status: "inactive",
        photo: "https://via.placeholder.com/48",
        dateAdded: new Date("2024-02-05"),
      },
    ],
  },
  {
    id: "beta",
    name: "Projet Beta",
    startDate: new Date("2024-02-15"),
    manager: "Bob Martin",
    team: [
      {
        id: 4,
        name: "Sophie Lambert",
        email: "soph.lambert@mail.com",
        role: "Membre",
        status: "active",
        photo: "https://via.placeholder.com/48",
        dateAdded: new Date("2024-02-20"),
      },
      {
        id: 5,
        name: "Luc Bernard",
        email: "luc.bernard@mail.com",
        role: "Manager",
        status: "active",
        photo: "https://via.placeholder.com/48",
        dateAdded: new Date("2024-02-25"),
      },
    ],
  },
  {
    id: "gamma",
    name: "Projet Gamma",
    startDate: new Date("2024-03-01"),
    manager: "Claire Legrand",
    team: [
      {
        id: 6,
        name: "Emma Durand",
        email: "emma.durand@mail.com",
        role: "Membre",
        status: "active",
        photo: "https://via.placeholder.com/48",
        dateAdded: new Date("2024-03-05"),
      },
    ],
  },
]

// --- Composant Statistique (rectangle)
// Affiche un titre, une valeur et une icône avec un fond coloré
const StatsCard = ({
  title,
  value,
  icon,
  bgClass,
}: {
  title: string
  value: number
  icon: JSX.Element
  bgClass: string
}) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className={`flex items-center p-4 ${bgClass} text-gray-800 rounded-xl shadow-lg`}
  >
    <div className="p-3 bg-white bg-opacity-50 rounded-full mr-4">{icon}</div>
    <div>
      <p className="text-sm">{title}</p>
      <p className="font-bold text-xl">{value}</p>
    </div>
  </motion.div>
)

// --- Composants

// Composant affichant la liste des projets
const ProjectList = ({
  projects,
  onSelect,
}: {
  projects: Project[]
  onSelect: (project: Project) => void
}) => {
  return (
    <div
      className="p-6 bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 
      dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 rounded-xl shadow-2xl space-y-6"
    >
      <h1
        className="flex items-center text-4xl font-extrabold bg-gradient-to-r from-purple-500 to-blue-500 
        bg-clip-text text-transparent"
      >
        <div className="p-3 rounded-xl" style={{ backgroundColor: primaryColor + "20" }}></div>
        <span className="ml-4">Sélectionnez un projet</span>
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            whileHover={{ scale: 1.03 }}
            onClick={() => onSelect(project)}
            className="p-6 bg-gray-50 dark:bg-slate-700 rounded-2xl shadow-xl cursor-pointer 
              border border-transparent hover:border-[3px] hover:border-[#b03ff3] transition"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{project.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Début : {project.startDate.toLocaleDateString("fr-FR")}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Chef de projet : {project.manager}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Membres : {project.team.length}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Composant affichant le graphique simple d'activité de l'équipe
const TeamPerformanceChart = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="p-5 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 rounded-xl shadow-lg mt-8"
  >
    <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-3 flex items-center space-x-2">
      <DocumentChartBarIcon className="w-6 h-6 text-purple-600 mr-2" />
      <span>Activité Hebdomadaire</span>
    </h2>
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={performanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis dataKey="jour" stroke="#888" />
          <YAxis stroke="#888" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              border: "none",
            }}
          />
          <Line
            type="monotone"
            dataKey="tâches"
            stroke="#b03ff3"
            strokeWidth={3}
            dot={{ r: 4, fill: "#b03ff3" }}
            activeDot={{ r: 6 }}
            name="Tâches complétées"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
)

// Composant pour afficher et gérer les membres d'un projet
const ProjectDetails = ({
  project,
  onBack,
  onUpdateProject,
}: {
  project: Project
  onBack: () => void
  onUpdateProject: (updatedProject: Project) => void
}) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "pending" | "inactive">("all")
  const [isLoading, setIsLoading] = useState(false)

  // Statistiques sur les membres
  const totalMembers = project.team.length
  const activeMembers = project.team.filter((m) => m.status === "active").length
  const pendingMembers = project.team.filter((m) => m.status === "pending").length
  const inactiveMembers = project.team.filter((m) => m.status === "inactive").length

  // Filtrage des membres
  const filteredTeam = project.team.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = filterStatus === "all" || member.status === filterStatus

    return matchesSearch && matchesFilter
  })

  // Mise à jour du rôle d'un membre
  const handleRoleChange = async (memberId: number, newRole: Member["role"]) => {
    // Find the member whose role is being changed
    const member = project.team.find((m) => m.id === memberId)
    if (!member) return

    // Store the old role for the notification
    const oldRole = member.role

    // Only proceed with notification if the role is actually changing
    if (oldRole === newRole) {
      return
    }

    // Update the team with the new role
    const updatedTeam = project.team.map((m) => (m.id === memberId ? { ...member, role: newRole } : m))
    onUpdateProject({ ...project, team: updatedTeam })

    // Show loading state
    setIsLoading(true)

    try {
      // Send email notification about role change
      const response = await fetch("/api/send-role-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: member.email,
          name: member.name,
          projectName: project.name,
          oldRole: oldRole,
          newRole: newRole,
        }),
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        toast.success(`Rôle mis à jour avec succès et notification envoyée à ${member.email}`)
      } else {
        // Role was updated but notification failed
        toast.warning(`Rôle mis à jour, mais l'envoi de la notification a échoué: ${data.message}`)
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de la notification:", error)
      toast.warning("Rôle mis à jour, mais l'envoi de la notification a échoué")
    } finally {
      setIsLoading(false)
    }
  }

  // Suppression d'un membre
  const handleDeleteMember = (memberId: number) => {
    const memberToDelete = project.team.find((m) => m.id === memberId)
    if (!memberToDelete) return

    const updatedTeam = project.team.filter((member) => member.id !== memberId)
    onUpdateProject({ ...project, team: updatedTeam })
    toast.success(`${memberToDelete.name} a été retiré du projet`)
  }

  // Renvoyer une invitation
  const handleResendInvitation = async (memberId: number) => {
    const member = project.team.find((m) => m.id === memberId)
    if (!member) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/send-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: member.email,
          name: member.name,
          projectName: project.name,
          role: member.role,
        }),
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        toast.success(`Invitation renvoyée à ${member.email}`)
      } else {
        toast.error(`Échec de l'envoi: ${data.message}`)
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'invitation:", error)
      toast.error("Erreur lors de l'envoi de l'invitation")
    } finally {
      setIsLoading(false)
    }
  }

  // Ajout d'un nouveau membre
  const addMember = async (newMember: Omit<Member, "id">) => {
    setIsLoading(true)

    try {
      // Envoi de l'invitation par email
      const response = await fetch("/api/send-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: newMember.email,
          name: newMember.name,
          projectName: project.name,
          role: newMember.role,
        }),
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        const nextId = project.team.length ? Math.max(...project.team.map((m) => m.id)) + 1 : 1
        const memberWithDate = {
          ...newMember,
          dateAdded: new Date(),
        }

        onUpdateProject({
          ...project,
          team: [...project.team, { id: nextId, ...memberWithDate }],
        })

        toast.success(`Invitation envoyée à ${newMember.email}`)
      } else {
        toast.error(`Échec de l'envoi: ${data.message}`)
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'invitation:", error)
      toast.error("Erreur lors de l'envoi de l'invitation")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-2xl space-y-6">
      <Toaster position="top-right" richColors />

      <button onClick={onBack} className="flex items-center text-sm hover:underline" style={{ color: primaryColor }}>
        <ArrowLeftIcon className="w-4 h-4 mr-1" /> Retour à la liste des projets
      </button>

      <div className="mb-6">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold flex items-center gap-3"
          style={{ color: primaryColor }}
        >
          <div className="p-3 rounded-xl" style={{ backgroundColor: primaryColor + "20" }}>
            <TableCellsIcon className="w-8 h-8" style={{ color: primaryColor }} />
          </div>
          <span
            className="flex items-center text-4xl font-extrabold bg-gradient-to-r from-purple-500 to-blue-500 
            bg-clip-text text-transparent"
          >
            {project.name}
          </span>
        </motion.h1>
        <p className="text-gray-600 dark:text-gray-300">
          Début : {project.startDate.toLocaleDateString("fr-FR")} • Chef de projet : {project.manager}
        </p>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatsCard
          title="Total Membres"
          value={totalMembers}
          icon={<UserGroupIcon className="w-6 h-6" style={{ color: accentOrange }} />}
          bgClass="bg-orange-100"
        />
        <StatsCard
          title="Membres Actifs"
          value={activeMembers}
          icon={<CheckCircleIcon className="w-6 h-6" style={{ color: accentGreen }} />}
          bgClass="bg-green-100"
        />
        <StatsCard
          title="Invitations en Attente"
          value={pendingMembers}
          icon={<EnvelopeIcon className="w-6 h-6" style={{ color: primaryColor }} />}
          bgClass="bg-purple-100"
        />
        <StatsCard
          title="Membres Inactifs"
          value={inactiveMembers}
          icon={<XCircleIcon className="w-6 h-6" style={{ color: accentYellow }} />}
          bgClass="bg-yellow-100"
        />
      </div>

      {/* Barre de recherche, filtres et bouton d'ajout */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
        <div className="flex flex-1 gap-3 items-center">
          <div className="relative flex-1 max-w-xs">
            <input
              type="text"
              placeholder="Rechercher un membre..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-[#b03ff3] focus:border-[#b03ff3]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400 dark:text-gray-300" />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className=" w-40  rounded-lg border border-gray-300 dark:border-gray-600 
              bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-[#b03ff3] focus:border-[#b03ff3] py-2 px-3"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="pending">En attente</option>
            <option value="inactive">Inactifs</option>
          </select>

          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1 rounded ${viewMode === "grid" ? "bg-white dark:bg-gray-600 shadow" : ""}`}
              title="Vue en grille"
            >
              <TableCellsIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1 rounded ${viewMode === "list" ? "bg-white dark:bg-gray-600 shadow" : ""}`}
              title="Vue en liste"
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md shadow hover:from-purple-700 hover:to-pink-700 transition flex items-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <UserPlusIcon className="w-5 h-5" />
          )}
          Inviter un membre
        </motion.button>
      </div>

      {/* Liste des membres */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {filteredTeam.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onRoleChange={handleRoleChange}
              onDelete={handleDeleteMember}
              onResendInvitation={handleResendInvitation}
              isLoading={isLoading}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Membre
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Rôle
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Statut
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Date d'ajout
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTeam.map((member) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  onRoleChange={handleRoleChange}
                  onDelete={handleDeleteMember}
                  onResendInvitation={handleResendInvitation}
                  isLoading={isLoading}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredTeam.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <UserIcon className="w-12 h-12 mx-auto text-gray-400" />
          <p className="mt-4 text-gray-500 dark:text-gray-300">Aucun membre trouvé</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
          >
            Inviter un membre
          </button>
        </div>
      )}

      {/* Graphique de performance simplifié */}
      <TeamPerformanceChart />

      <AnimatePresence>
        {isModalOpen && (
          <AddMemberModal onClose={() => setIsModalOpen(false)} onSubmit={addMember} isLoading={isLoading} />
        )}
      </AnimatePresence>
    </div>
  )
}

// Composant affichant une carte de membre avec gestion du rôle et suppression
const MemberCard = ({
  member,
  onRoleChange,
  onDelete,
  onResendInvitation,
  isLoading,
}: {
  member: Member
  onRoleChange: (id: number, role: Member["role"]) => void
  onDelete: (id: number) => void
  onResendInvitation: (id: number) => void
  isLoading: boolean
}) => {
  const [showActions, setShowActions] = useState(false)

  const getStatusBadge = () => {
    switch (member.status) {
      case "active":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="w-3 h-3 mr-1" /> Actif
          </span>
        )
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <EnvelopeIcon className="w-3 h-3 mr-1" /> En attente
          </span>
        )
      case "inactive":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="w-3 h-3 mr-1" /> Inactif
          </span>
        )
    }
  }

  const getRoleBadge = () => {
    switch (member.role) {
      case "Admin":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
            Admin
          </span>
        )
      case "Manager":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Manager
          </span>
        )
      case "Membre":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Membre
          </span>
        )
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setShowActions(true)}
      onHoverEnd={() => setShowActions(false)}
      className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-shadow border border-transparent hover:border-purple-200 dark:hover:border-purple-800"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 relative">
          <img
            src={member.photo || "/placeholder.svg"}
            alt={member.name}
            className="h-14 w-14 rounded-full object-cover border-2 border-purple-200"
          />
          <div className="absolute -bottom-1 -right-1">
            {member.status === "active" && (
              <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            )}
            {member.status === "pending" && (
              <div className="w-4 h-4 bg-yellow-500 rounded-full border-2 border-white"></div>
            )}
            {member.status === "inactive" && (
              <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">{member.name}</h3>
            {getRoleBadge()}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">{member.email}</p>
          <div className="mt-1 text-xs text-gray-500">
            {member.dateAdded && `Ajouté le ${member.dateAdded.toLocaleDateString("fr-FR")}`}
          </div>
          <div className="mt-2 flex items-center gap-2">{getStatusBadge()}</div>

          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-3 flex items-center gap-3"
              >
                <select
                  value={member.role}
                  onChange={(e) => onRoleChange(member.id, e.target.value as Member["role"])}
                  className="block rounded-md border-gray-300 dark:border-gray-600 
                    bg-white dark:bg-gray-700 dark:text-white shadow-sm focus:border-[#b03ff3] focus:ring-[#b03ff3] text-xs py-1"
                >
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Membre">Membre</option>
                </select>

                {member.status === "pending" ? (
                  <button
                    onClick={() => onResendInvitation(member.id)}
                    className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
                    title="Renvoyer l'invitation"
                    disabled={isLoading}
                  >
                    {isLoading ? "Envoi..." : "Renvoyer"}
                  </button>
                ) : (
                  <div className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">
                    {member.status === "active" ? "Actif" : "Inactif"}
                  </div>
                )}

                <button
                  onClick={() => onDelete(member.id)}
                  className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                  title="Supprimer"
                  disabled={isLoading}
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

// Composant pour afficher un membre dans une ligne de tableau
const MemberRow = ({
  member,
  onRoleChange,
  onDelete,
  onResendInvitation,
  isLoading,
}: {
  member: Member
  onRoleChange: (id: number, role: Member["role"]) => void
  onDelete: (id: number) => void
  onResendInvitation: (id: number) => void
  isLoading: boolean
}) => {
  const getStatusBadge = () => {
    switch (member.status) {
      case "active":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="w-3 h-3 mr-1" /> Actif
          </span>
        )
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <EnvelopeIcon className="w-3 h-3 mr-1" /> En attente
          </span>
        )
      case "inactive":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="w-3 h-3 mr-1" /> Inactif
          </span>
        )
    }
  }

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 relative">
            <img className="h-10 w-10 rounded-full" src={member.photo || "/placeholder.svg"} alt={member.name} />
            <div className="absolute -bottom-1 -right-1">
              {member.status === "active" && (
                <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
              {member.status === "pending" && (
                <div className="w-3 h-3 bg-yellow-500 rounded-full border-2 border-white"></div>
              )}
              {member.status === "inactive" && (
                <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
              )}
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{member.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <select
          value={member.role}
          onChange={(e) => onRoleChange(member.id, e.target.value as Member["role"])}
          className="block rounded-md border-gray-300 dark:border-gray-600 
            bg-white dark:bg-gray-700 dark:text-white shadow-sm focus:border-[#b03ff3] focus:ring-[#b03ff3] text-xs py-1"
        >
          <option value="Admin">Admin</option>
          <option value="Manager">Manager</option>
          <option value="Membre">Membre</option>
        </select>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge()}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {member.dateAdded ? member.dateAdded.toLocaleDateString("fr-FR") : "-"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end gap-2">
          {member.status === "pending" ? (
            <button
              onClick={() => onResendInvitation(member.id)}
              className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
              title="Renvoyer l'invitation"
              disabled={isLoading}
            >
              {isLoading ? "Envoi..." : "Renvoyer"}
            </button>
          ) : (
            <div className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">
              {member.status === "active" ? "Actif" : "Inactif"}
            </div>
          )}
          <button
            onClick={() => onDelete(member.id)}
            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded"
            title="Supprimer"
            disabled={isLoading}
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}

// Modal d'ajout d'un nouveau membre
const AddMemberModal = ({
  onClose,
  onSubmit,
  isLoading,
}: {
  onClose: () => void
  onSubmit: (member: Omit<Member, "id">) => void
  isLoading: boolean
}) => {
  const [newMember, setNewMember] = useState<Omit<Member, "id">>({
    name: "",
    email: "",
    role: "Membre",
    status: "pending",
    photo: "https://via.placeholder.com/48",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewMember((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(newMember)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
          <UserPlusIcon className="w-6 h-6 text-purple-600" />
          <span>Inviter un nouveau membre</span>
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom</label>
            <input
              name="name"
              type="text"
              value={newMember.name}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-[#b03ff3] focus:border-[#b03ff3] dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              name="email"
              type="email"
              value={newMember.email}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-[#b03ff3] focus:border-[#b03ff3] dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rôle</label>
            <select
              name="role"
              value={newMember.role}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-[#b03ff3] focus:border-[#b03ff3] dark:bg-gray-700 dark:text-white"
            >
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Membre">Membre</option>
            </select>
          </div>
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Un email d'invitation sera envoyé à l'adresse indiquée avec un lien pour rejoindre le projet.
            </p>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-4 px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <EnvelopeIcon className="w-5 h-5" />
                  <span>Inviter</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// --- Composant principal ProjectsPage

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects((prev) => prev.map((proj) => (proj.id === updatedProject.id ? updatedProject : proj)))
    if (selectedProject && selectedProject.id === updatedProject.id) {
      setSelectedProject(updatedProject)
    }
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-slate-900">
      {!selectedProject ? (
        <ProjectList projects={projects} onSelect={(proj) => setSelectedProject(proj)} />
      ) : (
        <ProjectDetails
          project={selectedProject}
          onBack={() => setSelectedProject(null)}
          onUpdateProject={handleUpdateProject}
        />
      )}
    </div>
  )
}
