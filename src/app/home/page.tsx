"use client"

import { useState, useEffect } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { PlusSquare, CalendarDays, BarChart3, CheckCircle, Clock, Info, FileText } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/app/(components)/ui/dialog"
import { Button } from "@/app/(components)/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/(components)/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/app/(components)/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/(components)/ui/table"
import { useToast } from "@/app/(components)/ui/use-toast"
import StatCard from "@/app/(components)/StatCard"
import DashboardCard from "@/app/(components)/DashboardCard"
import PriorityTaskList from "@/app/(components)/PriorityTaskList"
import TaskEditor from "@/app/(components)/TaskEditor"
import type { Task, Project } from "@/app/projects/types/dashboard"
import {
  calculateTaskPriorityDistribution,
  calculateProjectStatus,
  calculateDashboardStats,
  getUpcomingTasks,
  formatDateFr,
  translateStatus,
  getProjectById,
  getStatusColorClass,
} from "@/lib/utils"
import { formatISO } from "date-fns"
import { useUser } from "@clerk/nextjs"
import { useCreateProjectMutation, useGetUserProjectsQuery } from "../state/api"

// Formulaire de création de projet
const NewProjectForm = ({
  onClose,
  onProjectCreated,
}: { onClose: () => void; onProjectCreated: (project: Project) => void }) => {
  const [createProject, { isLoading, isError }] = useCreateProjectMutation()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Gestion de la liste des emails invités
  const [memberEmail, setMemberEmail] = useState("")
  const [invitedMembers, setInvitedMembers] = useState<string[]>([])

  // Récupération de l'utilisateur connecté via Clerk
  const { user, isLoaded } = useUser()
  if (!isLoaded) return <p>Loading...</p>

  const clerkUserId = user?.id || ""

  const handleAddMember = () => {
    const trimmedEmail = memberEmail.trim()
    if (trimmedEmail && !invitedMembers.includes(trimmedEmail)) {
      setInvitedMembers([...invitedMembers, trimmedEmail])
      setMemberEmail("")
    }
  }

  const handleRemoveMember = (emailToRemove: string) => {
    setInvitedMembers(invitedMembers.filter((email) => email !== emailToRemove))
  }

  const handleSubmit = async () => {
    // Vérification de la complétude du formulaire
    if (!name || !description || !startDate || !endDate || !clerkUserId) return

    try {
      const formattedStartDate = formatISO(new Date(startDate), {
        representation: "complete",
      })
      const formattedEndDate = formatISO(new Date(endDate), {
        representation: "complete",
      })

      // La méthode .unwrap() permet de récupérer directement l'erreur si la mutation échoue
      await createProject({
        name,
        description,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        clerkUserId,
        invitedMembers,
      }).unwrap()

      onClose() // Fermer la modal après succès
    } catch (err) {
      console.error("Erreur lors de la création du projet:", err)
      // Vous pouvez afficher ici un message d'erreur à l'utilisateur
    }
  }

  const isFormValid = () => name && description && startDate && endDate && clerkUserId

  const inputStyles =
    "w-full rounded border border-gray-300 p-2 shadow-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none"

  return (
    <form
      className="mt-4 space-y-6"
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit()
      }}
    >
      <input
        type="text"
        className={inputStyles}
        placeholder="Project Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        className={inputStyles}
        placeholder="Project Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-2">
        <input type="date" className={inputStyles} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" className={inputStyles} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>

      {/* Zone pour inviter des membres */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Inviter des membres</label>
        <div className="flex gap-2 mt-1">
          <input
            type="email"
            placeholder="Email du membre"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
            className={inputStyles}
          />
          <button
            type="button"
            onClick={handleAddMember}
            className="px-3 py-2 rounded-md border border-transparent bg-blue-primary text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            Ajouter
          </button>
        </div>
        {invitedMembers.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {invitedMembers.map((email, index) => (
              <div key={index} className="inline-flex items-center gap-1 rounded-full bg-gray-200 px-2 py-1 text-sm">
                <span>{email}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveMember(email)}
                  className="text-red-500 hover:text-red-700"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        className={`mt-4 flex w-full justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
          !isFormValid() || isLoading ? "cursor-not-allowed opacity-50" : ""
        }`}
        disabled={!isFormValid() || isLoading}
      >
        {isLoading ? "Creating..." : "Create Project"}
      </button>

      {isError && <p className="text-red-500 mt-2">Une erreur est survenue lors de la création du projet.</p>}
    </form>
  )
}

// Composant principal
const Index = () => {
  const { toast } = useToast()
  const [isModalNewProjectOpen, setIsModalNewProjectOpen] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false)
  const [isProjectsDetailOpen, setIsProjectsDetailOpen] = useState(false)
  const [isEditingTask, setIsEditingTask] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")
  const [projectFilter, setProjectFilter] = useState<"all" | "active">("all")

  // Données fictives pour démonstration
  const [staticUser, setStaticUser] = useState({
    id: "user_123",
    firstName: "user1",
    lastName: "Dupont",
  })

  // Get the current user
  const { user, isLoaded } = useUser()
  const clerkUserId = user?.id || ""

  // Fetch user projects from the API
  const {
    data: projectsData,
    isLoading: isLoadingProjects,
    error: projectsError,
  } = useGetUserProjectsQuery(clerkUserId, {
    skip: !clerkUserId,
  })

  // Initialize projects and tasks state
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  // Process the projects data when it's loaded
  useEffect(() => {
    if (projectsData) {
      // Combine manager and invited projects
      const allProjects = [...(projectsData.managerProjects || []), ...(projectsData.invitedProjects || [])].map(
        (project) => ({
          id: project.id,
          title: project.name,
          description: project.description,
          startDate: project.start_date,
          endDate: project.end_date,
          clerkUserId: project.clerk_user_id,
          status: project.end_date ? "TERMINÉ" : "ACTIF",
          progress: calculateProjectProgress(project), // Calculate actual progress
        }),
      )

      setProjects(allProjects)

      // Fetch tasks for each project
      const fetchAllProjectDetails = async () => {
        const allTasks: Task[] = []

        // For each project, fetch its details including tasks
        for (const project of allProjects) {
          try {
            const projectDetails = await fetch(`http://localhost:8000/api/projects/${project.id}`).then((res) =>
              res.json(),
            )

            if (projectDetails && projectDetails.columns) {
              // Extract tasks from all columns
              projectDetails.columns.forEach((column: { tasks: any[]; title: string }) => {
                if (column.tasks && column.tasks.length > 0) {
                  const mappedTasks = column.tasks.map(
                    (task: {
                      id: any
                      title: any
                      description: any
                      priority: any
                      due_date: any
                      assignee_id: any
                      status: any
                    }) => ({
                      id: task.id,
                      title: task.title,
                      description: task.description,
                      // Map the status based on column title or task status
                      status: task.status || column.title || "À faire",
                      priority: mapPriority(task.priority), // Convert priority format
                      dueDate: task.due_date,
                      userId: task.assignee_id,
                      projectId: project.id,
                      columnName: column.title,
                    }),
                  )
                  allTasks.push(...mappedTasks)
                }
              })
            }
          } catch (error) {
            console.error(`Error fetching details for project ${project.id}:`, error)
          }
        }

        setTasks(allTasks)
        setIsDataLoaded(true)
      }

      fetchAllProjectDetails()
    }
  }, [projectsData, clerkUserId])

  // Add these helper functions after the useEffect but before the next hook or function

  // Function to calculate project progress based on task completion
  const calculateProjectProgress = (project: any): number => {
    if (project.end_date) return 100

    // If we have columns data, calculate based on completed tasks
    if (project.columns && project.columns.length > 0) {
      const allTasks = project.columns.flatMap((col: any) => col.tasks || [])
      const totalTasks = allTasks.length

      if (totalTasks === 0) return 0

      const completedTasks = allTasks.filter(
        (task: any) => task.status === "terminé" || task.column_title === "terminé" || task.column_title === "Terminé",
      ).length

      return Math.round((completedTasks / totalTasks) * 100)
    }

    // Default progress if we can't calculate
    return 30
  }

  // Function to standardize priority values
  const mapPriority = (priority: string): string => {
    if (!priority) return "MEDIUM"

    const priorityLower = priority.toLowerCase()
    if (priorityLower.includes("haute") || priorityLower.includes("high") || priorityLower.includes("urgente")) {
      return "HIGH"
    } else if (priorityLower.includes("basse") || priorityLower.includes("low")) {
      return "LOW"
    } else {
      return "MEDIUM"
    }
  }

  useEffect(() => {
    setAnimateIn(true)
  }, [])

  // Add a loading state
  if (!isLoaded || isLoadingProjects || !isDataLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-lg">Chargement de vos données...</p>
        </div>
      </div>
    )
  }

  // Handle error state
  if (projectsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erreur de chargement</h2>
          <p className="mb-4">Impossible de charger vos projets. Veuillez réessayer plus tard.</p>
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </div>
      </div>
    )
  }

  // Animation à l'entrée

  // Ajouter un nouveau projet
  const handleAddProject = (newProject: Project) => {
    setProjects((prev) => [...prev, newProject])
    // Refresh the projects data
    setTimeout(() => {
      if (clerkUserId) {
        // This will trigger a refetch of the projects
        // The useGetUserProjectsQuery hook will automatically refetch
      }
    }, 500)
  }

  // Mettre à jour une tâche
  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prev) => prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
    toast({
      title: "Tâche mise à jour",
      description: "Les modifications ont été enregistrées avec succès.",
    })
  }

  // Préparation des données
  const taskPriorityData = calculateTaskPriorityDistribution(tasks)
  const projectStatusData = calculateProjectStatus(projects)
  const dashboardStats = calculateDashboardStats(tasks, projects)
  const upcomingTasks = getUpcomingTasks(tasks)

  // Filtrer les tâches en fonction du statut
  const filteredTasks =
    filterStatus === "all"
      ? tasks
      : filterStatus === "HIGH"
        ? tasks.filter((task) => task.priority === filterStatus)
        : tasks.filter(
            (task) =>
              task.status.toLowerCase() === filterStatus.toLowerCase() ||
              task.columnName?.toLowerCase() === filterStatus.toLowerCase(),
          )

  // Filtrer les projets
  const filteredProjects = projectFilter === "all" ? projects : projects.filter((project) => !project.endDate)

  // Obtenir les détails d'une tâche sélectionnée
  const selectedTask = selectedTaskId ? tasks.find((t) => t.id === selectedTaskId) : null
  const selectedTaskProject = selectedTask ? getProjectById(selectedTask.projectId, projects) : null

  // Obtenir les détails d'un projet sélectionné
  const selectedProject = selectedProjectId ? projects.find((p) => p.id === selectedProjectId) : null
  const projectTasks = selectedProject ? tasks.filter((t) => t.projectId === selectedProject.id) : []

  // Colonnes pour le tableau des tâches
  const taskColumns = [
    { id: "title", span: "Titre", minWidth: 170 },
    { id: "status", span: "Statut", minWidth: 100 },
    { id: "priority", span: "Priorité", minWidth: 100 },
    { id: "dueDate", span: "Échéance", minWidth: 120 },
  ]

  // Fonction pour afficher les détails du projet en fonction du filtre
  const showProjectDetails = (filter: "active" | "all") => {
    setProjectFilter(filter)
    setIsProjectsDetailOpen(true)
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-opacity duration-1000 ${animateIn ? "opacity-100" : "opacity-0"}`}
    >
      {/* En-tête créatif */}
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
              Tableau de Bord
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
            Bienvenue, {user?.firstName || "Utilisateur"} |{" "}
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              className="flex items-center rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 px-5 py-3 text-white shadow-2xl transition transform hover:scale-105"
              onClick={() => setIsModalNewProjectOpen(true)}
            >
              <PlusSquare className="mr-2 h-6 w-6" /> New Project
            </button>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 opacity-0 animate-fade-in"
          style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
        >
          <StatCard
            title="Projets actifs"
            value={dashboardStats.activeProjects}
            icon={<BarChart3 size={24} />}
            trend={{ value: 12, isPositive: true }}
            className="cursor-pointer"
            onClick={() => showProjectDetails("active")}
          />
          <StatCard
            title="Taux de complétion"
            value={`${dashboardStats.taskCompletionRate}%`}
            icon={<CheckCircle size={24} />}
            trend={{ value: 5, isPositive: true }}
            className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20"
          />
          <StatCard
            title="Tâches urgentes"
            value={dashboardStats.urgentTasks}
            icon={<Clock size={24} />}
            trend={{ value: 3, isPositive: false }}
            className="cursor-pointer"
            onClick={() => {
              setFilterStatus("HIGH")
              window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
            }}
          />
          <StatCard
            title="Total des projets"
            value={dashboardStats.totalProjects}
            icon={<FileText size={24} />}
            className="cursor-pointer"
            onClick={() => showProjectDetails("all")}
          />
        </div>

        {/* Grille de cartes */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6">
          {/* Distribution des tâches par priorité */}
          <div
            className="md:col-span-1 xl:col-span-6 opacity-0 animate-fade-in"
            style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
          >
            <DashboardCard title="Distribution des priorités">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={taskPriorityData}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e0e0e0" />
                  <XAxis dataKey="name" stroke="#718096" />
                  <YAxis stroke="#718096" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "none",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value) => [`${value} tâches`, "Quantité"]}
                    labelFormatter={(name) => `Priorité: ${name}`}
                  />
                  <Legend formatter={(value) => `${value}`} />
                  <Bar dataKey="count" name="Nombre de tâches">
                    {taskPriorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </DashboardCard>
          </div>

          {/* Statut des projets */}
          <div
            className="md:col-span-1 xl:col-span-6 opacity-0 animate-fade-in"
            style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}
          >
            <DashboardCard title="Statut des projets">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    dataKey="count"
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {projectStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} projets`, "Quantité"]}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "none",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend formatter={(value) => `${value}`} />
                </PieChart>
              </ResponsiveContainer>
            </DashboardCard>
          </div>

          {/* Tâches à venir */}
          <div
            className="md:col-span-1 xl:col-span-6 opacity-0 animate-fade-in"
            style={{ animationDelay: "0.8s", animationFillMode: "forwards" }}
          >
            <DashboardCard title="Tâches à venir (7 jours)">
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {upcomingTasks.length > 0 ? (
                  upcomingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => {
                        setSelectedTaskId(task.id)
                        setIsTaskDetailsOpen(true)
                      }}
                    >
                      <div
                        className={`mt-1 h-3 w-3 flex-shrink-0 rounded-full ${
                          task.priority === "HIGH"
                            ? "bg-red-500"
                            : task.priority === "MEDIUM"
                              ? "bg-amber-500"
                              : "bg-green-500"
                        }`}
                      />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{task.title}</h4>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{formatDateFr(task.dueDate)}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${
                              task.priority === "HIGH"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                : task.priority === "MEDIUM"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                                  : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            }`}
                          >
                            {translateStatus(task.priority)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-[250px] text-gray-500">
                    <CalendarDays className="h-10 w-10 mb-2 text-gray-400" />
                    <p className="text-center">Aucune tâche à venir cette semaine</p>
                  </div>
                )}
              </div>
            </DashboardCard>
          </div>

          {/* Tâches prioritaires */}
          <div
            className="md:col-span-1 xl:col-span-6 opacity-0 animate-fade-in"
            style={{ animationDelay: "0.9s", animationFillMode: "forwards" }}
          >
            <PriorityTaskList
              tasks={tasks.filter((task) => task.priority === "HIGH")} // Only show high priority tasks
              projects={projects}
              onTaskClick={(taskId) => {
                setSelectedTaskId(taskId)
                setIsTaskDetailsOpen(true)
              }}
            />
          </div>

          {/* Tableau des tâches */}
          <div
            className="md:col-span-2 xl:col-span-12 opacity-0 animate-fade-in"
            style={{ animationDelay: "1.0s", animationFillMode: "forwards" }}
          >
            <DashboardCard title="Vos Tâches">
              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`px-3 py-1 text-sm rounded-full ${
                    filterStatus === "all"
                      ? "bg-violet-600 text-white"
                      : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  Toutes
                </button>
                <button
                  onClick={() => setFilterStatus("à faire")}
                  className={`px-3 py-1 text-sm rounded-full ${
                    filterStatus === "à faire"
                      ? "bg-yellow-500 text-white"
                      : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  À faire
                </button>
                <button
                  onClick={() => setFilterStatus("en cours")}
                  className={`px-3 py-1 text-sm rounded-full ${
                    filterStatus === "en cours"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  En cours
                </button>
                <button
                  onClick={() => setFilterStatus("terminé")}
                  className={`px-3 py-1 text-sm rounded-full ${
                    filterStatus === "terminé"
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  Terminées
                </button>
                <button
                  onClick={() => setFilterStatus("HIGH")}
                  className={`px-3 py-1 text-sm rounded-full ${
                    filterStatus === "HIGH"
                      ? "bg-red-500 text-white"
                      : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  Urgentes
                </button>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {taskColumns.map((column) => (
                        <TableHead key={column.id} style={{ minWidth: column.minWidth }}>
                          {column.span}
                        </TableHead>
                      ))}
                      <TableHead>Colonne</TableHead>
                      <TableHead>Projet</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.map((task) => {
                      const project = projects.find((p) => p.id === task.projectId)
                      return (
                        <TableRow key={task.id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <TableCell className="font-medium">{task.title}</TableCell>
                          <TableCell>
                            <div
                              className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${getStatusColorClass(task.status, task.columnName)}`}
                            >
                              {task.columnName || task.status}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div
                              className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
                                task.priority === "HIGH"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                  : task.priority === "MEDIUM"
                                    ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                                    : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              }`}
                            >
                              {translateStatus(task.priority)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <CalendarDays size={16} className="mr-2 text-gray-500" />
                              <span>{formatDateFr(task.dueDate)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-700 dark:text-gray-300">{task.columnName || "—"}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-700 dark:text-gray-300">{project?.title || "—"}</span>
                          </TableCell>
                          <TableCell>
                            <button
                              onClick={() => {
                                setSelectedTaskId(task.id)
                                setIsTaskDetailsOpen(true)
                              }}
                              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Info size={16} className="text-violet-600 dark:text-violet-400" />
                            </button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </DashboardCard>
          </div>
        </div>
      </div>

      {/* Footer */}

      {/* Modal Nouveau Projet */}
      <Dialog open={isModalNewProjectOpen} onOpenChange={setIsModalNewProjectOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
              Créer un nouveau projet
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Complétez le formulaire ci-dessous pour créer votre projet.
            </DialogDescription>
          </DialogHeader>
          <NewProjectForm onClose={() => setIsModalNewProjectOpen(false)} onProjectCreated={handleAddProject} />
        </DialogContent>
      </Dialog>

      {/* Détails de tâche */}
      <Sheet open={isTaskDetailsOpen} onOpenChange={setIsTaskDetailsOpen}>
        <SheetContent className="w-[90%] sm:w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
              {isEditingTask ? "Modifier la tâche" : "Détails de la tâche"}
            </SheetTitle>
          </SheetHeader>
          {selectedTask && (
            <div className="mt-6 space-y-6">
              {isEditingTask ? (
                <TaskEditor
                  task={selectedTask}
                  projects={projects}
                  onClose={() => setIsEditingTask(false)}
                  onSave={handleUpdateTask}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <div
                        className={`mr-2 h-3 w-3 rounded-full ${
                          selectedTask.priority === "HIGH"
                            ? "bg-red-500"
                            : selectedTask.priority === "MEDIUM"
                              ? "bg-amber-500"
                              : "bg-green-500"
                        }`}
                      />
                      {selectedTask.title}
                    </CardTitle>
                    <CardDescription>Créée le {formatDateFr(new Date().toISOString())}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Description</h4>
                      <p className="mt-1">{selectedTask.description || "Aucune description disponible."}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Statut</h4>
                        <div
                          className={`mt-1 px-3 py-1 rounded-full text-xs font-medium inline-block ${getStatusColorClass(selectedTask.status, selectedTask.columnName)}`}
                        >
                          {selectedTask.columnName || selectedTask.status}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Priorité</h4>
                        <div
                          className={`mt-1 px-3 py-1 rounded-full text-xs font-medium inline-block ${
                            selectedTask.priority === "HIGH"
                              ? "bg-red-100 text-red-800"
                              : selectedTask.priority === "MEDIUM"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {translateStatus(selectedTask.priority)}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Date d'échéance</h4>
                      <p className="mt-1 flex items-center">
                        <CalendarDays size={16} className="mr-2 text-gray-500" />
                        {formatDateFr(selectedTask.dueDate)}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Projet associé</h4>
                      {selectedTaskProject ? (
                        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <h5 className="font-medium">{selectedTaskProject.title}</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTaskProject.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Du {formatDateFr(selectedTaskProject.startDate)}
                            {selectedTaskProject.endDate ? ` au ${formatDateFr(selectedTaskProject.endDate)}` : ""}
                          </p>
                        </div>
                      ) : (
                        <p className="mt-1 text-gray-500">Aucun projet associé</p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => setIsTaskDetailsOpen(false)}>
                      Fermer
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                      onClick={() => setIsEditingTask(true)}
                    >
                      Modifier
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Liste des projets */}
      <Sheet open={isProjectsDetailOpen} onOpenChange={setIsProjectsDetailOpen}>
        <SheetContent className="w-[90%] sm:w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
              {selectedProject
                ? `Projet: ${selectedProject.title}`
                : projectFilter === "active"
                  ? "Projets actifs"
                  : "Tous les projets"}
            </SheetTitle>
            <SheetDescription>
              {selectedProject
                ? selectedProject.description
                : projectFilter === "active"
                  ? `${projects.filter((p) => !p.endDate).length} projets actifs`
                  : `${projects.length} projets au total, dont ${projects.filter((p) => !p.endDate).length} actifs`}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Vue détaillée d'un projet */}
            {selectedProject ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedProject.title}</CardTitle>
                    <CardDescription>
                      {selectedProject.endDate
                        ? `Complété: ${formatDateFr(selectedProject.startDate)} - ${formatDateFr(selectedProject.endDate)}`
                        : `Démarré le ${formatDateFr(selectedProject.startDate)}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">{selectedProject.description}</p>

                    <h4 className="font-medium mb-2 flex items-center">
                      <FileText size={16} className="mr-2" />
                      Tâches du projet ({projectTasks.length})
                    </h4>

                    <div className="space-y-3 mt-4">
                      {projectTasks.length > 0 ? (
                        projectTasks.map((task) => (
                          <div
                            key={task.id}
                            className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => {
                              setSelectedTaskId(task.id)
                              setIsProjectsDetailOpen(false)
                              setTimeout(() => setIsTaskDetailsOpen(true), 100)
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <h5 className="font-medium flex items-center">
                                <div
                                  className={`mr-2 h-2 w-2 rounded-full ${
                                    task.priority === "HIGH"
                                      ? "bg-red-500"
                                      : task.priority === "MEDIUM"
                                        ? "bg-amber-500"
                                        : "bg-green-500"
                                  }`}
                                />
                                {task.title}
                              </h5>
                              <div
                                className={`px-2 py-1 text-xs rounded-full ${getStatusColorClass(task.status, task.columnName)}`}
                              >
                                {task.columnName || task.status}
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{formatDateFr(task.dueDate)}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center p-6 text-gray-500">Aucune tâche trouvée pour ce projet</div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => setSelectedProjectId(null)}>
                      Retour aux projets
                    </Button>
                    <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">Modifier</Button>
                  </CardFooter>
                </Card>
              </div>
            ) : (
              /* Liste de tous les projets */
              <div className="space-y-4">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <Card
                      key={project.id}
                      className="cursor-pointer hover:shadow-md transition-all"
                      onClick={() => setSelectedProjectId(project.id)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center">
                          <div
                            className={`mr-2 h-3 w-3 rounded-full ${project.endDate ? "bg-green-500" : "bg-blue-500"}`}
                          />
                          {project.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm line-clamp-2">{project.description}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">
                            {project.endDate
                              ? `Terminé le ${formatDateFr(project.endDate)}`
                              : `Démarré le ${formatDateFr(project.startDate)}`}
                          </span>
                          <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                            {tasks.filter((t) => t.projectId === project.id).length} tâches
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center p-10 text-gray-500">
                    <p>Aucun projet {projectFilter === "active" ? "actif" : ""} trouvé</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default Index
