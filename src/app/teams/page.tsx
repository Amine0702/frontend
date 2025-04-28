"use client"

import React, { useState, useEffect } from "react"
import {
  Users,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Download,
  UserCheck,
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit,
} from "lucide-react"

// Import ThemeProvider from projects
import { ThemeProvider } from "../projects/components/theme-provider"

import { Card, CardContent, CardHeader, CardTitle } from "@/app/(components)/ui/card"
import { Button } from "@/app/(components)/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/(components)/ui/table"
import { Badge } from "@/app/(components)/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/app/(components)/ui/popover"
import { Checkbox } from "@/app/(components)/ui/checkbox"
import { Slider } from "@/app/(components)/slider"
import { useToast } from "@/app/(components)/ui/use-toast"
import { useUser } from "@clerk/nextjs"
import { useGetUserProjectsQuery, useGetProjectQuery } from "@/app/state/api"
import type { Team, TeamMember, Task } from "./types/team"
import type { BackendProject, BackendColumn, BackendTask } from "../projects/types/kanban"
import { Skeleton } from "@/app/(components)/ui/skeleton"

// === Composant ReportMetric ===
type ReportMetricProps = {
  icon: React.ReactNode
  title: string
  value: number | string
  isLoading?: boolean
}

const ReportMetric = ({ icon, title, value, isLoading = false }: ReportMetricProps): JSX.Element => {
  return (
    <Card className="border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
      <CardContent className="p-6">
        <div className="flex justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{value}</p>
            )}
          </div>
          <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// === Fonctions utilitaires ===
const getProgressColor = (progress: number): string => {
  if (progress < 30) return "bg-amber-500"
  if (progress < 70) return "bg-blue-500"
  return "bg-green-500"
}

const getStatusDisplay = (status: string): JSX.Element => {
  switch (status) {
    case "active":
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800"
        >
          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Actif
        </Badge>
      )
    case "paused":
      return (
        <Badge
          variant="outline"
          className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800"
        >
          <Clock className="w-3.5 h-3.5 mr-1" /> En pause
        </Badge>
      )
    case "completed":
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800"
        >
          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Terminé
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300">
          {status}
        </Badge>
      )
  }
}

const getPriorityDisplay = (priority: string): JSX.Element => {
  switch (priority) {
    case "high":
    case "haute":
    case "urgente":
      return <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border-0">Haute</Badge>
    case "medium":
    case "moyenne":
      return (
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-0">Moyenne</Badge>
      )
    case "low":
    case "basse":
      return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300 border-0">Basse</Badge>
    default:
      return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300">{priority}</Badge>
  }
}

// Interface for projects with extended properties
interface ExtendedBackendProject extends BackendProject {
  status?: string
  priority?: string
  pivot?: {
    team_member_id: number
    project_id: number
    role: string
    created_at: string
    updated_at: string
  }
}

// Replace the TeamsContent component with this updated version
const TeamsContent = (): JSX.Element => {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null)
  const [expandedMember, setExpandedMember] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // States for filters
  const [statusFilter, setStatusFilter] = useState<{ active: boolean; paused: boolean }>({
    active: true,
    paused: true,
  })
  const [completionFilter, setCompletionFilter] = useState<[number, number]>([0, 100])

  // Get the connected user
  const { user, isLoaded: userLoaded } = useUser()
  const clerkUserId = user?.id || ""

  // State for teams and loading
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch user projects as a fallback
  const {
    data: projectsData,
    isLoading: isLoadingProjects,
    error: projectsError,
  } = useGetUserProjectsQuery(clerkUserId, {
    skip: !userLoaded || !clerkUserId,
  })

  // Get details of the selected project (to display team members)
  const { data: selectedProjectData, isLoading: isLoadingProjectDetails } = useGetProjectQuery(
    expandedTeam ? teams.find((t) => t.id.toString() === expandedTeam)?.project_id?.toString() || "" : "",
    {
      skip: !expandedTeam,
    },
  )

  // Fonction pour extraire les équipes à partir des projets
  const extractTeamsFromProjects = (projectsData: any) => {
    if (!projectsData) return

    // Extract all projects
    const allProjects = [
      ...(projectsData.managerProjects || []),
      ...(projectsData.invitedProjects || []),
    ] as ExtendedBackendProject[]

    console.log("Extraction des équipes à partir des projets:", allProjects)

    // Extract teams from projects
    const extractedTeams = allProjects.map((project: ExtendedBackendProject) => {
      // Create a team from project data
      let members: TeamMember[] = []

      // If the project has team members, use them
      if (project.team_members && Array.isArray(project.team_members)) {
        // Convertir BackendTeamMember en TeamMember en ajoutant le statut manquant
        members = project.team_members.map((member: any) => ({
          ...member,
          status: "active", // Ajouter un statut par défaut
          // Assurons-nous que le pivot est correctement formaté
          pivot: member.pivot
            ? {
                ...member.pivot,
                // Ajoutons team_id si nécessaire pour la compatibilité
                team_id: member.pivot.team_id || project.id,
              }
            : undefined,
        })) as TeamMember[]

        console.log(`Trouvé ${members.length} membres d'équipe pour le projet ${project.id}:`, members)
      } else {
        console.log(`Aucun membre d'équipe trouvé pour le projet ${project.id}`)
      }

      // Find the leader (first manager or first member)
      // Recherchons spécifiquement les membres avec le rôle "manager"
      const managers = members.filter(
        (m) => m.pivot?.role === "manager" || m.role === "manager" || m.pivot?.role === "leader" || m.role === "leader",
      )

      console.log(`Managers trouvés pour le projet ${project.id}:`, managers)

      // Si nous avons des managers, prenons le premier, sinon le premier membre
      const leader = managers.length > 0 ? managers[0] : members.length > 0 ? members[0] : null

      if (leader) {
        console.log(`Leader sélectionné pour le projet ${project.id}:`, leader)
      } else {
        console.log(`Aucun leader trouvé pour le projet ${project.id}`)
      }

      // Calculate completion rate based on tasks
      let completedTasks = 0
      let totalTasks = 0

      if (project.columns) {
        project.columns.forEach((column: BackendColumn) => {
          if (column.tasks) {
            totalTasks += column.tasks.length
            completedTasks += column.tasks.filter(
              (task: BackendTask) => task.status === "terminé" || task.completed_at !== null,
            ).length
          }
        })
      }

      const completionRate = totalTasks > 0 ? Math.floor((completedTasks / totalTasks) * 100) : 0

      // Create the team object with all required properties
      const team: Team = {
        id: project.id,
        name: `Équipe ${project.name}`,
        description: project.description || "",
        status: project.status || "active",
        priority: project.priority || "medium",
        leader_id: leader?.id,
        leader: leader as TeamMember | undefined,
        members: members,
        completion_rate: completionRate,
        last_updated_at: project.updated_at || "",
        project_id: project.id,
        active_projects_count: 1,
        // Ajouter les propriétés manquantes pour la compatibilité
        active_projects: 1,
        last_updated: project.updated_at || "",
        created_at: project.created_at || "",
        updated_at: project.updated_at || "",
      }

      return team
    })

    console.log("Équipes extraites:", extractedTeams)

    if (extractedTeams.length === 0) {
      console.warn("Aucune équipe n'a été extraite des données de projets!")
    }

    setTeams(extractedTeams)
  }

  // Fonction pour récupérer les membres d'une équipe
  const fetchTeamMembers = async (teamId: string) => {
    try {
      // First check if we already have team members in the project data
      if (selectedProjectData && selectedProjectData.team_members && selectedProjectData.team_members.length > 0) {
        // Convertir les membres d'équipe en ajoutant le statut manquant
        const teamMembers = selectedProjectData.team_members.map((member: any) => ({
          ...member,
          status: "active", // Ajouter un statut par défaut
          // Assurons-nous que le pivot est correctement formaté
          pivot: member.pivot
            ? {
                ...member.pivot,
                // Ajoutons team_id si nécessaire pour la compatibilité
                team_id: member.pivot.team_id || Number.parseInt(teamId),
              }
            : undefined,
        })) as TeamMember[]

        // Update the team with the members from the project data
        setTeams((prevTeams) =>
          prevTeams.map((team) => (team.id.toString() === teamId ? { ...team, members: teamMembers } : team)),
        )
        return
      }

      // If not, try to fetch them from the API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/projects/${teamId}/members`,
      )

      if (!response.ok) {
        throw new Error("Échec de la récupération des membres de l'équipe")
      }

      const data = await response.json()
      console.log(`Membres récupérés pour l'équipe ${teamId}:`, data)

      if (data && Array.isArray(data)) {
        // Convertir les membres d'équipe en ajoutant le statut manquant
        const teamMembers = data.map((member: any) => ({
          ...member,
          status: "active", // Ajouter un statut par défaut
          // Assurons-nous que le pivot est correctement formaté
          pivot: member.pivot
            ? {
                ...member.pivot,
                // Ajoutons team_id si nécessaire pour la compatibilité
                team_id: member.pivot.team_id || Number.parseInt(teamId),
              }
            : undefined,
        })) as TeamMember[]

        // Update the team with the fetched members
        setTeams((prevTeams) =>
          prevTeams.map((team) => (team.id.toString() === teamId ? { ...team, members: teamMembers } : team)),
        )
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération des membres de l'équipe ${teamId}:`, error)
    }
  }

  // Fonction pour récupérer les équipes
  const fetchTeams = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/teams`)

      if (!response.ok) {
        throw new Error("Échec de la récupération des équipes")
      }

      const data = await response.json()
      console.log("Données d'équipes reçues:", data)

      // If we got teams from the API, use them
      if (data && Array.isArray(data) && data.length > 0) {
        // Transform the data to match our Team interface
        const transformedTeams = data.map((team: any) => ({
          id: team.id,
          name: team.name,
          description: team.description || "",
          status: team.status || "active",
          priority: team.priority || "medium",
          leader_id: team.leader_id,
          leader: team.leader ? { ...team.leader, status: "active" } : undefined,
          members: (team.members || []).map((member: any) => ({
            ...member,
            status: "active", // Ajouter un statut par défaut
          })),
          completion_rate: team.completion_rate || 0,
          last_updated_at: team.last_updated_at || team.updated_at || "",
          project_id: team.id, // Using team ID as project ID for now
          active_projects_count: team.active_projects_count || 0,
          // Ajouter les propriétés manquantes pour la compatibilité
          active_projects: team.active_projects_count || 0,
          last_updated: team.last_updated_at || team.updated_at || "",
          created_at: team.created_at || "",
          updated_at: team.updated_at || "",
        })) as Team[]

        setTeams(transformedTeams)
      } else if (projectsData) {
        // If no teams from API but we have projects data, extract teams from projects
        console.log("Pas d'équipes depuis l'API, utilisation des données de projets:", projectsData)
        extractTeamsFromProjects(projectsData)
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des équipes:", error)

      // If API fetch fails but we have projects data, extract teams from projects
      if (projectsData) {
        console.log("Échec de l'API, utilisation des données de projets:", projectsData)
        extractTeamsFromProjects(projectsData)
      } else {
        toast({
          title: "Erreur",
          description: "Échec de la récupération des équipes. Veuillez réessayer plus tard.",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Appeler fetchTeams au chargement
  useEffect(() => {
    // Only fetch if user is loaded
    if (userLoaded && clerkUserId) {
      fetchTeams()
    }
  }, [userLoaded, clerkUserId, projectsData])

  // Mettre à jour les membres d'équipe quand les données du projet sont chargées
  useEffect(() => {
    if (selectedProjectData && expandedTeam) {
      console.log("Données du projet sélectionné:", selectedProjectData)

      // If the project has team members, update the team
      if (selectedProjectData.team_members && Array.isArray(selectedProjectData.team_members)) {
        // Convertir les membres d'équipe en ajoutant le statut manquant
        const teamMembers = selectedProjectData.team_members.map((member) => ({
          ...member,
          status: "active", // Ajouter un statut par défaut
        })) as TeamMember[]

        setTeams((prevTeams) =>
          prevTeams.map((team) => (team.id.toString() === expandedTeam ? { ...team, members: teamMembers } : team)),
        )
      }
    }
  }, [selectedProjectData, expandedTeam])

  // Statistiques des équipes
  const teamStats = {
    total_teams: teams.length,
    active_teams: teams.filter((t) => t.status === "active").length,
    total_members: new Set(teams.flatMap((t) => t.members?.map((m: TeamMember) => m.id) || [])).size,
    total_active_projects: teams.reduce((acc, team) => acc + (team.active_projects_count || 0), 0),
  }

  // Gestion du tri
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortDirection("asc")
    }
  }

  // Affichage de l'icône de tri
  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null
    return sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  // Gestion du clic sur une équipe
  const toggleTeamDetails = (id: string) => {
    const isExpanding = expandedTeam !== id
    setExpandedTeam(isExpanding ? id : null)

    // Reset expanded member when changing team
    setExpandedMember(null)

    // If we're expanding a team, fetch its members
    if (isExpanding) {
      fetchTeamMembers(id)
    }
  }

  // Gestion du clic sur un membre
  const toggleMemberDetails = (id: string) => {
    setExpandedMember(expandedMember === id ? null : id)
  }

  // Réinitialiser les filtres
  const resetFilters = () => {
    setStatusFilter({ active: true, paused: true })
    setCompletionFilter([0, 100])
    setSearchTerm("")
  }

  // Créer une nouvelle équipe
  const handleCreateTeam = () => {
    // Redirect to dashboard to create a project
    window.location.href = "/dashboard"
  }

  // Filtrer les équipes
  const filteredTeams = teams.filter((team) => {
    // Search filter
    if (searchTerm && !team.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Status filter
    if (team.status === "active" && !statusFilter.active) return false
    if (team.status === "paused" && !statusFilter.paused) return false

    // Completion filter
    if (team.completion_rate < completionFilter[0] || team.completion_rate > completionFilter[1]) {
      return false
    }

    return true
  })

  // Trier les équipes
  const sortedTeams = React.useMemo(() => {
    if (!filteredTeams.length) return []

    return [...filteredTeams].sort((a, b) => {
      if (!sortBy) return 0

      const valueA = a[sortBy as keyof Team]
      const valueB = b[sortBy as keyof Team]

      if (typeof valueA === "string" && typeof valueB === "string") {
        return sortDirection === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
      } else if (typeof valueA === "number" && typeof valueB === "number") {
        return sortDirection === "asc" ? valueA - valueB : valueB - valueA
      }
      return 0
    })
  }, [filteredTeams, sortBy, sortDirection])

  // Logs de débogage pour l'équipe sélectionnée et ses membres
  useEffect(() => {
    if (expandedTeam) {
      const selectedTeam = teams.find((t) => t.id.toString() === expandedTeam)
      if (selectedTeam) {
        console.log("Équipe sélectionnée:", selectedTeam)
        console.log("Membres de l'équipe:", selectedTeam.members)
        console.log("Nombre de membres:", selectedTeam.members?.length || 0)
      }
    }
  }, [expandedTeam, teams])

  // Log de débogage pour les données du projet sélectionné
  useEffect(() => {
    if (selectedProjectData) {
      console.log("Données du projet sélectionné:", selectedProjectData)
    }
  }, [selectedProjectData])

  const handleExportTeamMembers = (teamId: string) => {
    console.log(`Exportation des membres pour l'équipe ${teamId}`)
    toast({
      title: "Exportation",
      description: "Exportation des membres de l'équipe en cours...",
    })
  }

  // Ajoutons un useEffect pour déboguer l'affichage du chef d'équipe
  useEffect(() => {
    // Log pour déboguer les chefs d'équipe
    console.log(
      "Toutes les équipes avec leurs chefs:",
      teams.map((team) => ({
        team_id: team.id,
        team_name: team.name,
        leader: team.leader
          ? {
              id: team.leader.id,
              name: team.leader.name,
              role: team.leader.role,
              pivot_role: team.leader.pivot?.role,
            }
          : "Non assigné",
      })),
    )
  }, [teams])

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in dashboard-container">
      {/* En-tête de la page */}
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-3 shadow-sm border border-indigo-100 mb-6 dark:border-gray-700 pt-8 animate-fade-in">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
            Gestion des Équipes
          </h1>
          <p className="text-muted-foreground">Visualisez et explorez toutes les équipes de votre organisation.</p>
        </div>
      </div>

      {/* Cartes métriques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <ReportMetric
          icon={<Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
          title="Équipes Actives"
          value={`${teamStats.active_teams}/${teamStats.total_teams}`}
          isLoading={isLoading}
        />
        <ReportMetric
          icon={<UserCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
          title="Membres"
          value={teamStats.total_members.toString()}
          isLoading={isLoading}
        />
        <ReportMetric
          icon={<Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
          title="Projets Actifs"
          value={teamStats.total_active_projects.toString()}
          isLoading={isLoading}
        />
      </div>

      {/* Barre d'action */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une équipe ou un membre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
          />
        </div>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900/30 flex gap-2 dark:text-white"
              >
                <Filter className="h-4 w-4" /> Filtres
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 filter-popover">
              <h3 className="font-medium mb-4 flex items-center justify-between">
                Filtres
                <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 text-xs">
                  Réinitialiser
                </Button>
              </h3>

              <div className="space-y-4">
                {/* Filtres de statut */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Statut</h4>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center">
                      <Checkbox
                        id="status-active"
                        checked={statusFilter.active}
                        onCheckedChange={(checked) => setStatusFilter({ ...statusFilter, active: !!checked })}
                      />
                      <span className="ml-2">Actif</span>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="status-pause"
                        checked={statusFilter.paused}
                        onCheckedChange={(checked) => setStatusFilter({ ...statusFilter, paused: !!checked })}
                      />
                      <span className="ml-2">En pause</span>
                    </div>
                  </div>
                </div>

                {/* Filtre de complétion */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">Taux de Complétion</h4>
                    <span className="text-xs text-muted-foreground">
                      {completionFilter[0]}% - {completionFilter[1]}%
                    </span>
                  </div>
                  <Slider
                    value={completionFilter}
                    min={0}
                    max={100}
                    step={5}
                    className="mb-6"
                    onValueChange={(value) => setCompletionFilter(value as [number, number])}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="default" className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handleCreateTeam}>
            <Plus className="h-4 w-4 mr-2" /> Nouvelle Équipe
          </Button>
        </div>
      </div>

      {/* Tableau principal */}
      <Card
        className="border-purple-200 dark:border-purple-800 shadow-md animate-fade-in overflow-hidden"
        style={{ animationDelay: "0.3s" }}
      >
        <CardHeader className="bg-purple-50 dark:bg-purple-900/20 border-b border-purple-100 dark:border-purple-800/50 pb-4">
          <CardTitle className="text-purple-900 dark:text-purple-100 text-xl">Liste des Équipes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-purple-50/50 dark:bg-purple-900/10">
                <TableRow>
                  <TableHead className="w-[50px] cursor-pointer" onClick={() => handleSort("id")}>
                    <div className="flex items-center">ID {getSortIcon("id")}</div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                    <div className="flex items-center">Nom de l'Équipe {getSortIcon("name")}</div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("leader_id")}>
                    <div className="flex items-center">Chef d'Équipe {getSortIcon("leader_id")}</div>
                  </TableHead>
                  <TableHead className="cursor-pointer text-center" onClick={() => handleSort("completion_rate")}>
                    <div className="flex items-center justify-center">Complétion {getSortIcon("completion_rate")}</div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                    <div className="flex items-center">Statut {getSortIcon("status")}</div>
                  </TableHead>
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Affichage de chargement
                  Array(5)
                    .fill(0)
                    .map((_, index) => (
                      <TableRow key={`loading-${index}`}>
                        <TableCell>
                          <Skeleton className="h-6 w-10" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-40" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-20" />
                        </TableCell>
                      </TableRow>
                    ))
                ) : sortedTeams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                        <p>Aucune équipe trouvée</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          {searchTerm || !statusFilter.active || !statusFilter.paused
                            ? "Essayez d'ajuster vos filtres."
                            : "Aucune équipe n'a encore été créée."}
                        </p>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Les équipes sont créées automatiquement lorsque vous créez un projet.
                          </p>
                          <Button
                            variant="default"
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={handleCreateTeam}
                          >
                            <Plus className="h-4 w-4 mr-2" /> Créer un Projet
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedTeams.map((team) => (
                    <React.Fragment key={team.id}>
                      <TableRow
                        className={`
                          hover:bg-purple-50/50 
                          dark:hover:bg-purple-900/10 
                          ${expandedTeam === team.id.toString() ? "bg-purple-50 dark:bg-purple-900/20" : ""}
                        `}
                      >
                        <TableCell className="font-medium">
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-100 rounded-md">
                            {team.id}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-purple-900 dark:text-purple-100">{team.name}</div>
                          {team.description && (
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {team.description}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {team.leader ? (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center text-xs font-medium text-purple-800 dark:text-purple-100 overflow-hidden">
                                {team.leader.avatar ? (
                                  <img
                                    src={team.leader.avatar || "/placeholder.svg"}
                                    alt={team.leader.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : team.leader.name ? (
                                  team.leader.name.charAt(0).toUpperCase()
                                ) : (
                                  "?"
                                )}
                              </div>
                              <div>
                                <div className="font-medium">{team.leader.name}</div>
                                <div className="text-xs text-muted-foreground">Chef d'Équipe</div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400">
                                ?
                              </div>
                              <span className="text-muted-foreground">Non assigné</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div
                              className="bg-purple-600 dark:bg-purple-500 h-2.5 rounded-full"
                              style={{ width: `${team.completion_rate}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-center mt-1">{team.completion_rate}%</div>
                        </TableCell>
                        <TableCell>{getStatusDisplay(team.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => toggleTeamDetails(team.id.toString())}
                            >
                              {expandedTeam === team.id.toString() ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Détails de l'équipe et membres */}
                      {expandedTeam === team.id.toString() && (
                        <TableRow className="bg-purple-50/50 dark:bg-purple-900/10">
                          <TableCell colSpan={6} className="p-0">
                            <div className="p-4">
                              <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-purple-800 dark:text-purple-200">
                                  Membres de l'Équipe
                                </h3>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:text-white dark:hover:bg-purple-900/30 flex gap-2"
                                  onClick={() => handleExportTeamMembers(team.id.toString())}
                                >
                                  <Download className="h-3.5 w-3.5" /> Exporter les Membres
                                </Button>
                              </div>

                              {/* Affichage des membres de l'équipe */}
                              {isLoadingProjectDetails ? (
                                <div className="flex justify-center items-center p-8">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
                                </div>
                              ) : team.members && Array.isArray(team.members) && team.members.length > 0 ? (
                                <div className="border rounded-md overflow-hidden dark:border-purple-800/50">
                                  <Table>
                                    <TableHeader className="bg-purple-100/50 dark:bg-purple-900/30">
                                      <TableRow>
                                        <TableHead className="w-[40px]">ID</TableHead>
                                        <TableHead>Nom</TableHead>
                                        <TableHead className="hidden md:table-cell">Rôle</TableHead>
                                        <TableHead className="hidden lg:table-cell">Email</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="w-[60px] text-right">Actions</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {team.members.map((member: TeamMember) => (
                                        <React.Fragment key={member.id}>
                                          <TableRow
                                            className={`hover:bg-purple-100/30 dark:hover:bg-purple-900/20 ${
                                              expandedMember === member.id.toString()
                                                ? "bg-purple-100/40 dark:bg-purple-900/30"
                                                : ""
                                            }`}
                                          >
                                            <TableCell>{member.id}</TableCell>
                                            <TableCell>
                                              <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center text-xs font-medium text-purple-800 dark:text-purple-100 overflow-hidden">
                                                  {member.avatar ? (
                                                    <img
                                                      src={member.avatar || "/placeholder.svg"}
                                                      alt={member.name}
                                                      className="w-full h-full object-cover"
                                                    />
                                                  ) : member.name ? (
                                                    member.name.charAt(0).toUpperCase()
                                                  ) : (
                                                    "?"
                                                  )}
                                                </div>
                                                <span className="font-medium">{member.name}</span>
                                              </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                              {member.pivot?.role === "member" ? (
                                                <Badge
                                                  variant="outline"
                                                  className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                                                >
                                                  Membre
                                                </Badge>
                                              ) : member.pivot?.role === "observer" ? (
                                                <Badge
                                                  variant="outline"
                                                  className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-800"
                                                >
                                                  Observateur
                                                </Badge>
                                              ) : member.pivot?.role === "leader" ||
                                                member.pivot?.role === "manager" ? (
                                                <Badge
                                                  variant="outline"
                                                  className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                                                >
                                                  {member.pivot?.role === "leader" ? "Chef" : "Manager"}
                                                </Badge>
                                              ) : (
                                                <Badge variant="outline">{member.pivot?.role || "Membre"}</Badge>
                                              )}
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell">
                                              {member.email || "N/A"}
                                            </TableCell>
                                            <TableCell>{getStatusDisplay(member.status || "active")}</TableCell>
                                            <TableCell className="text-right">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => toggleMemberDetails(member.id.toString())}
                                              >
                                                {expandedMember === member.id.toString() ? (
                                                  <ChevronUp className="h-4 w-4" />
                                                ) : (
                                                  <ChevronDown className="h-4 w-4" />
                                                )}
                                              </Button>
                                            </TableCell>
                                          </TableRow>

                                          {/* Détails des tâches du membre */}
                                          {expandedMember === member.id.toString() && (
                                            <TableRow className="bg-purple-100/20 dark:bg-purple-900/20">
                                              <TableCell colSpan={6} className="p-4">
                                                <h4 className="text-sm font-medium mb-2 text-purple-700 dark:text-purple-300">
                                                  Tâches Assignées
                                                </h4>
                                                <div className="space-y-3">
                                                  {member.tasks && member.tasks.length > 0 ? (
                                                    member.tasks.map((task: Task) => {
                                                      // Déterminer la progression en fonction du statut ou des dates
                                                      const progress = task.progress || 0

                                                      return (
                                                        <div
                                                          key={task.id}
                                                          className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm border border-gray-200 dark:border-gray-700"
                                                        >
                                                          <div className="flex justify-between items-start">
                                                            <div>
                                                              <h5 className="font-medium">{task.title}</h5>
                                                              <div className="flex gap-2 mt-1">
                                                                {getStatusDisplay(task.status)}
                                                                {getPriorityDisplay(task.priority)}
                                                              </div>
                                                            </div>
                                                            <span className="text-sm font-medium">{progress}%</span>
                                                          </div>
                                                          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                                            <div
                                                              className={`${getProgressColor(progress)} h-1.5 rounded-full`}
                                                              style={{ width: `${progress}%` }}
                                                            ></div>
                                                          </div>
                                                        </div>
                                                      )
                                                    })
                                                  ) : (
                                                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                                                      <p className="text-muted-foreground">Aucune tâche assignée</p>
                                                    </div>
                                                  )}
                                                </div>
                                              </TableCell>
                                            </TableRow>
                                          )}
                                        </React.Fragment>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              ) : (
                                <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-md">
                                  <Users className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                                  <p className="text-muted-foreground">Aucun membre dans cette équipe</p>
                                  <Button variant="outline" size="sm" className="mt-4">
                                    <Plus className="h-4 w-4 mr-2" /> Ajouter des Membres
                                  </Button>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Composant principal avec ThemeProvider
const TeamsPage = (): JSX.Element => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TeamsContent />
    </ThemeProvider>
  )
}

export default TeamsPage
