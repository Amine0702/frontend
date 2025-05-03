"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { useToast } from "@/app/(components)/ui/use-toast"
import {
  FileText,
  Calendar,
  Download,
  TrendingUp,
  Briefcase,
  Users,
  User,
  CalendarIcon,
  CheckSquare,
  Loader2,
  AlertTriangle,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/(components)/ui/card"
import { Button } from "@/app/(components)/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/(components)/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/(components)/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/app/(components)/ui/dialog"
import { Progress } from "@/app/(components)/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/app/(components)/ui/accordion"
import { Badge } from "@/app/(components)/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/(components)/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert"

import {
  useGetProjectStatsQuery,
  useGetAllProjectsStatsQuery,
  useGetReportHistoryQuery,
  useGenerateProjectReportMutation,
  useScheduleProjectReportMutation,
} from "@/app/state/api"

// Types pour les données
interface Manager {
  name: string
  email: string
  avatar?: string
  pivot?: {
    role?: string
  }
}

interface Project {
  id: string | number
  name: string
  status?: string
  progress: number
  start_date: string
  end_date: string
  manager?: Manager
  team?: number
}

interface Task {
  id: string | number
  name: string
  status: string
  progress: number
  startDate?: string
  endDate?: string
}

interface TeamMember {
  id: string | number
  name: string
  role?: string
  avatar?: string
  tasks?: Task[]
}

interface ProjectStats {
  totalTasks: number
  completedTasks: number
  completionRate: number
  tasksByStatus: Record<string, number>
  tasksByPriority: Record<string, number>
  teamPerformance?: TeamPerformanceItem[]
  performanceData?: PerformanceDataItem[]
}

interface TeamPerformanceItem {
  memberId: string | number
  name: string
  tasksCompleted: number
  completionRate: number
  averageCompletionTime: number
}

interface PerformanceDataItem {
  name: string
  actuel: number
  precedent: number
}

interface ProjectData {
  project: Project
  stats: ProjectStats
  team: TeamMember[]
}

interface AllProjectsData {
  projects: Project[]
}

interface Report {
  id: string | number
  name: string
  created_at: string
  project_id?: string | number
}

const AutomatedReport = () => {
  // États de configuration
  const [project, setProject] = useState<string>("all")
  const [period, setPeriod] = useState<string>("month")
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [reportGenerated, setReportGenerated] = useState<boolean>(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState<boolean>(false)
  const [scheduleDate, setScheduleDate] = useState<string>("")
  const { toast } = useToast()

  // Récupérer les données des projets
  const {
    data: allProjectsData,
    isLoading: isLoadingAllProjects,
    error: allProjectsError,
  } = useGetAllProjectsStatsQuery({})

  const {
    data: projectData,
    isLoading: isLoadingProject,
    error: projectError,
  } = useGetProjectStatsQuery(project !== "all" ? project : "", {
    skip: project === "all",
  })

  // Récupérer l'historique des rapports
  const { data: reportHistory, isLoading: isLoadingHistory } = useGetReportHistoryQuery({})

  // Mutations pour générer et planifier des rapports
  const [generateReport, { isLoading: isGeneratingReport }] = useGenerateProjectReportMutation()
  const [scheduleReport, { isLoading: isSchedulingReport }] = useScheduleProjectReportMutation()

  // Effet pour définir reportGenerated à true si des données sont disponibles
  useEffect(() => {
    if ((project === "all" && allProjectsData) || (project !== "all" && projectData)) {
      setReportGenerated(true)
    }
  }, [project, allProjectsData, projectData])

  // Gestionnaire appelé lors du clic sur le bouton de génération
  const handleGenerate = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault()
    setIsGenerating(true)

    try {
      // Générer le rapport via l'API
      await generateReport({
        projectId: project !== "all" ? project : undefined,
        reportData: {
          period: period,
          includeAllProjects: project === "all",
        },
      }).unwrap()

      setReportGenerated(true)
      toast({
        title: "Rapport détaillé généré avec succès",
        description: "Votre rapport est prêt à être consulté et téléchargé",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Erreur lors de la génération du rapport",
        description: "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePlanifier = () => setShowScheduleDialog(true)

  const handleConfirmSchedule = async () => {
    if (!scheduleDate) return

    try {
      // Planifier le rapport via l'API
      await scheduleReport({
        projectId: project !== "all" ? project : undefined,
        scheduleData: {
          scheduledDate: scheduleDate,
          period: period,
          includeAllProjects: project === "all",
        },
      }).unwrap()

      toast({
        title: "Rapport planifié",
        description: `Le rapport détaillé est planifié pour le ${new Date(scheduleDate).toLocaleString()}`,
        variant: "default",
      })
      setShowScheduleDialog(false)
      setScheduleDate("")
    } catch (error) {
      toast({
        title: "Erreur lors de la planification",
        description: "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive",
      })
    }
  }

  const handleDownload = (reportId?: string | number) => {
    // Si un ID de rapport spécifique est fourni, télécharger ce rapport
    // Sinon, générer un rapport à partir des données actuelles
    if (reportId) {
      // Utiliser le hook useDownloadReportQuery pour télécharger le rapport
      // Ceci est une simplification, dans une implémentation réelle, vous devriez
      // gérer le téléchargement du blob correctement
      window.open(`${process.env.NEXT_PUBLIC_API_URL}/reports/${reportId}/download`, "_blank")

      toast({
        title: "Téléchargement démarré",
        description: "Votre rapport est en cours de téléchargement",
        variant: "default",
      })
      return
    }

    // Générer un rapport à partir des données actuelles
    let reportTitle = ""
    let reportContent = ""

    reportTitle = project === "all" ? "Tous les projets" : getProjectName() || "Rapport détaillé"
    reportContent = `RAPPORT DÉTAILLÉ: ${reportTitle}\n\n`

    // Ajouter le contenu du rapport
    const projectsToReport =
      project === "all" ? allProjectsData?.projects || [] : projectData ? [projectData.project] : []

    projectsToReport.forEach((proj: Project) => {
      reportContent += `PROJET: ${proj.name}\n`
      reportContent += `Statut: ${getStatusText(proj.status || (proj.progress === 100 ? "completed" : "in-progress"))}\n`
      reportContent += `Période: ${formatDate(proj.start_date)} - ${formatDate(proj.end_date)}\n`
      reportContent += `Progression: ${proj.progress || 0}%\n\n`

      // Ajouter les statistiques si disponibles
      if (projectData?.stats) {
        reportContent += `STATISTIQUES:\n`
        reportContent += `Total des tâches: ${projectData.stats.totalTasks}\n`
        reportContent += `Tâches terminées: ${projectData.stats.completedTasks}\n`
        reportContent += `Taux de complétion: ${projectData.stats.completionRate}%\n\n`
      }

      // Ajouter les informations du chef de projet
      const manager = proj.manager
      if (manager) {
        reportContent += `CHEF DE PROJET:\n`
        reportContent += `Nom: ${manager.name || "Non assigné"}\n`
        reportContent += `Email: ${manager.email || "N/A"}\n\n`
      }

      // Ajouter les informations de l'équipe
      const team = projectData?.team || []
      if (team.length > 0) {
        reportContent += `ÉQUIPE (${team.length} membres):\n`
        team.forEach((member: TeamMember) => {
          reportContent += `- ${member.name}, ${member.role || "Membre"}\n`
          if (member.tasks && member.tasks.length > 0) {
            reportContent += `  Tâches assignées:\n`
            member.tasks.forEach((task: Task) => {
              reportContent += `  * ${task.name} (${getStatusText(task.status)}, ${task.progress}%)\n`
              if (task.startDate && task.endDate) {
                reportContent += `    Période: ${formatDate(task.startDate)} - ${formatDate(task.endDate)}\n`
              }
            })
          }
          reportContent += `\n`
        })
      }

      reportContent += `\n-----------------------------------\n\n`
    })

    const blob = new Blob([reportContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `rapport-detaille-${reportTitle.toLowerCase().replace(/\s+/g, "-")}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Téléchargement démarré",
      description: "Votre rapport détaillé est en cours de téléchargement",
      variant: "default",
    })
  }

  // Fonction pour obtenir le nom du projet sélectionné
  const getProjectName = (): string => {
    if (project === "all") return "Tous les projets"

    if (allProjectsData?.projects) {
      const foundProject = allProjectsData.projects.find((p: Project) => p.id.toString() === project)
      return foundProject?.name || "Projet inconnu"
    }

    return projectData?.project?.name || "Projet inconnu"
  }

  // Générer les options de projets à partir des données
  const getProjectOptions = () => {
    const options = [{ value: "all", span: "Tous les projets" }]

    if (allProjectsData?.projects) {
      allProjectsData.projects.forEach((proj: Project) => {
        options.push({ value: proj.id.toString(), span: proj.name })
      })
    }

    return options
  }

  const periodOptions = [
    { value: "month", span: "Dernier mois" },
    { value: "quarter", span: "Dernier trimestre" },
    { value: "year", span: "Dernière année" },
  ]

  const getProjectspan = () => {
    return project === "all" ? "Tous les projets" : getProjectName()
  }

  const getPeriodspan = () => periodOptions.find((opt) => opt.value === period)?.span || ""

  // Fonction pour formater les dates
  const formatDate = (dateString: string): string => {
    if (!dateString) return "N/A"
    const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }
    return new Date(dateString).toLocaleDateString("fr-FR", options)
  }

  // Fonction pour obtenir la couleur de statut
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "delayed":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "planned":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  // Fonction pour obtenir le texte de statut
  const getStatusText = (status: string): string => {
    switch (status) {
      case "completed":
        return "Terminé"
      case "in-progress":
        return "En cours"
      case "delayed":
        return "En retard"
      case "planned":
        return "Planifié"
      case "terminé":
        return "Terminé"
      case "en_cours":
        return "En cours"
      case "en_révision":
        return "En révision"
      case "à_faire":
        return "À faire"
      default:
        return "Inconnu"
    }
  }

  // Fonction pour changer le projet sélectionné depuis la vue d'ensemble
  const handleSelectProject = (projectId: string) => {
    setProject(projectId)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Déterminer si les données sont en cours de chargement
  const isLoading = isLoadingAllProjects || (project !== "all" && isLoadingProject) || isGeneratingReport

  // Vérifier s'il y a des erreurs
  const hasError = allProjectsError || (project !== "all" && projectError)

  // Filtrer les projets en fonction de la sélection
  const filteredProjects =
    project === "all" ? allProjectsData?.projects || [] : projectData ? [projectData.project] : []

  return (
    // Wrapper global
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto p-4 space-y-6 max-w-7xl">
        {/* Bandeau d'introduction */}
        <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 shadow-sm border border-indigo-100 dark:border-gray-700 animate-fade-in">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
              Générateur de Rapports Détaillés
            </h1>
            <p className="mt-2 text-black dark:text-white">
              Créez des rapports détaillés et professionnels en quelques clics pour tous vos projets
            </p>
          </div>
        </div>

        {/* Afficher les erreurs s'il y en a */}
        {hasError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>
              Une erreur s'est produite lors du chargement des données. Veuillez réessayer.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire de configuration du rapport */}
          <div className="animate-fade-in lg:col-span-1">
            <Card className="h-full shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                  <FileText className="h-5 w-5 text-black dark:text-white" />
                  Paramètres du Rapport
                </CardTitle>
                <CardDescription className="text-black dark:text-white">
                  Configurez les options pour générer votre rapport détaillé
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-black dark:text-white">Projet</span>
                    <Select value={project} onValueChange={setProject} disabled={isLoading}>
                      <SelectTrigger className="text-black dark:text-white">
                        <SelectValue placeholder="Sélectionnez un projet" />
                      </SelectTrigger>
                      <SelectContent>
                        {getProjectOptions().map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <span className="text-black dark:text-white">{option.span}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-black dark:text-white">Période</span>
                    <Select value={period} onValueChange={setPeriod} disabled={isLoading}>
                      <SelectTrigger className="text-black dark:text-white">
                        <SelectValue placeholder="Sélectionnez une période" />
                      </SelectTrigger>
                      <SelectContent>
                        {periodOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <span className="text-black dark:text-white">{option.span}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:bg-indigo-600 text-white"
                  onClick={handleGenerate}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Génération en cours...
                    </span>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4 text-white" /> Générer le Rapport Détaillé
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Affichage du rapport généré */}
          <div className="animate-fade-in lg:col-span-2">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
                <h3 className="text-xl font-medium text-black dark:text-white">Chargement des données...</h3>
              </div>
            ) : reportGenerated ? (
              <Card className="shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-2xl text-black dark:text-white">Rapport Détaillé</CardTitle>
                    <CardDescription className="text-black dark:text-white">
                      {getProjectspan()} | {getPeriodspan()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePlanifier}
                      className="border-indigo-200 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900 text-black dark:text-white"
                      disabled={isSchedulingReport}
                    >
                      {isSchedulingReport ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Calendar className="mr-2 h-4 w-4 text-black dark:text-white" />
                      )}{" "}
                      Planifier
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDownload()}
                      className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:bg-indigo-600 text-white"
                    >
                      <Download className="mr-2 h-4 w-4 text-white" /> Télécharger
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-8">
                  {project === "all" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredProjects.length > 0 ? (
                        filteredProjects.map((proj: Project) => (
                          <Card
                            key={proj.id}
                            className="overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300"
                          >
                            <CardHeader className="pb-2 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-gray-800 dark:to-gray-750">
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-xl text-black dark:text-white">{proj.name}</CardTitle>
                                <Badge
                                  className={getStatusColor(
                                    proj.status || (proj.progress === 100 ? "completed" : "in-progress"),
                                  )}
                                >
                                  {getStatusText(proj.status || (proj.progress === 100 ? "completed" : "in-progress"))}
                                </Badge>
                              </div>
                              <CardDescription className="text-black dark:text-white flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                {formatDate(proj.start_date)} - {formatDate(proj.end_date)}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-500 dark:text-gray-400">Progression:</span>
                                  <div className="flex items-center gap-2">
                                    <Progress value={proj.progress} className="w-32 h-2" />
                                    <span className="text-sm font-medium text-black dark:text-white">
                                      {proj.progress || 0}%
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-500 dark:text-gray-400">Chef de projet:</span>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage
                                        src={proj.manager?.avatar || "/placeholder.svg?height=40&width=40"}
                                        alt={proj.manager?.name || "Manager"}
                                      />
                                      <AvatarFallback>
                                        {proj.manager?.name
                                          ? proj.manager.name
                                              .split(" ")
                                              .map((n: string) => n[0])
                                              .join("")
                                          : "?"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm text-black dark:text-white">
                                      {proj.manager?.name || "Non assigné"}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-500 dark:text-gray-400">Équipe:</span>
                                  <span className="text-sm text-black dark:text-white">{proj.team || 0} membres</span>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
                              <Button
                                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:bg-indigo-600 text-white"
                                onClick={() => handleSelectProject(proj.id.toString())}
                              >
                                Voir les détails
                              </Button>
                            </CardFooter>
                          </Card>
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-12">
                          <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                            <AlertTriangle className="h-6 w-6 text-yellow-500" />
                          </div>
                          <h3 className="text-lg font-medium text-black dark:text-white mb-2">Aucun projet trouvé</h3>
                          <p className="text-gray-500 dark:text-gray-400">
                            Vous n'avez pas encore de projets ou vous n'avez pas accès aux projets existants.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    projectData && (
                      <div className="space-y-6 pb-8 border-b border-gray-200 dark:border-gray-700 last:border-0">
                        {/* En-tête du projet avec design amélioré */}
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-gray-800/50 dark:to-gray-750/50 p-6 shadow-sm border border-indigo-100 dark:border-gray-700">
                          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <h2 className="text-3xl font-bold text-black dark:text-white">
                                {projectData.project.name}
                              </h2>
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <Badge
                                  className={`${getStatusColor(projectData.stats.completionRate === 100 ? "completed" : "in-progress")} px-3 py-1 text-sm font-medium`}
                                >
                                  {getStatusText(
                                    projectData.stats.completionRate === 100 ? "completed" : "in-progress",
                                  )}
                                </Badge>
                                <span className="text-sm text-black dark:text-white flex items-center">
                                  <Calendar className="h-4 w-4 mr-1 inline-block" />
                                  {formatDate(projectData.project.start_date)} -{" "}
                                  {formatDate(projectData.project.end_date)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm">
                              <div className="">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Progression</span>
                                <div className="flex items-center gap-2">
                                  <Progress value={projectData.stats.completionRate} className="w-24 h-2" />
                                  <span className="text-sm font w-24 h-2" />
                                  <span className="text-sm font-bold text-black dark:text-white">\
                                    {projectData.stats.completionRate}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Métriques du projet */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
                            <CardContent className="pt-4">
                              <div className="flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                                  <TrendingUp className="h-6 w-6 text-orange-500 dark:text-orange-400" />
                                </div>
                                <div className="w-full">
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Progression</p>
                                  <div className="flex items-baseline gap-2 mb-2">
                                    <h3 className="text-2xl font-bold text-black dark:text-white">
                                      {projectData.stats.completionRate}%
                                    </h3>
                                    <span
                                      className={`text-xs ${projectData.stats.completionRate > 50 ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}
                                    >
                                      {projectData.stats.completionRate > 50 ? "En bonne voie" : "Attention requise"}
                                    </span>
                                  </div>
                                  <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
                                      style={{ width: `${projectData.stats.completionRate}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
                            <CardContent className="pt-4">
                              <div className="flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
                                  <CheckSquare className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Tâches</p>
                                  <div className="flex items-baseline gap-2">
                                    <h3 className="text-2xl font-bold text-black dark:text-white">
                                      {projectData.stats.completedTasks} / {projectData.stats.totalTasks}
                                    </h3>
                                    <span className="text-xs text-indigo-600 dark:text-indigo-400">terminées</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Informations sur le manager */}
                        {projectData.project.manager && (
                          <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300">
                            <div className="h-1.5 bg-gradient-to-r from-violet-500 to-purple-500"></div>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg flex items-center gap-2 text-black dark:text-white">
                                <User className="h-5 w-5 text-pink-500 dark:text-pink-400" />
                                Chef de Projet
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/10 dark:to-indigo-900/10 rounded-lg">
                                <Avatar className="h-20 w-20 border-4 border-white dark:border-gray-800 shadow-md">
                                  <AvatarImage
                                    src={projectData.project.manager.avatar || "/placeholder.svg?height=40&width=40"}
                                    alt={projectData.project.manager.name}
                                  />
                                  <AvatarFallback className="bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-200 text-xl">
                                    {projectData.project.manager.name
                                      .split(" ")
                                      .map((n: string) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="space-y-2">
                                  <h3 className="text-xl font-bold text-black dark:text-white">
                                    {projectData.project.manager.name}
                                  </h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {projectData.project.manager.pivot?.role || "Manager"}
                                  </p>
                                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm">
                                    <span className="flex items-center text-gray-600 dark:text-gray-300">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 mr-1"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                      </svg>
                                      {projectData.project.manager.email}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Équipe du projet */}
                        {projectData.team && projectData.team.length > 0 && (
                          <Accordion type="single" collapsible className="w-full">
                            <AccordionItem
                              value="team"
                              className="border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                            >
                              <AccordionTrigger className="px-6 py-4 text-lg font-medium text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                                    <Users className="h-5 w-5 text-green-500 dark:text-green-400" />
                                  </div>
                                  <span>Équipe du Projet ({projectData.team.length} membres)</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-6 pt-2 pb-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                  {projectData.team.map((member: TeamMember) => (
                                    <Card
                                      key={member.id}
                                      className="overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300"
                                    >
                                      <CardHeader className="pb-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750">
                                        <div className="flex items-center gap-4">
                                          <Avatar className="h-14 w-14 border-2 border-white dark:border-gray-700 shadow-sm">
                                            <AvatarImage
                                              src={member.avatar || "/placeholder.svg?height=40&width=40"}
                                              alt={member.name}
                                            />
                                            <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                                              {member.name
                                                .split(" ")
                                                .map((n: string) => n[0])
                                                .join("")}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div>
                                            <h4 className="text-lg font-bold text-black dark:text-white">
                                              {member.name}
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">{member.role}</p>
                                          </div>
                                        </div>
                                      </CardHeader>
                                      <CardContent className="pt-4">
                                        {member.tasks && member.tasks.length > 0 ? (
                                          <div className="space-y-4">
                                            <h5 className="text-sm font-medium text-black dark:text-white flex items-center gap-2">
                                              <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                              Tâches assignées:
                                            </h5>
                                            <div className="space-y-3">
                                              {member.tasks.map((task: Task) => (
                                                <div
                                                  key={task.id}
                                                  className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700"
                                                >
                                                  <div className="flex justify-between items-start">
                                                    <h6 className="text-sm font-medium text-black dark:text-white">
                                                      {task.name}
                                                    </h6>
                                                    <Badge className={getStatusColor(task.status)}>
                                                      {getStatusText(task.status)}
                                                    </Badge>
                                                  </div>
                                                  <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                                                    {task.startDate && task.endDate && (
                                                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                                        <CalendarIcon className="h-3 w-3 inline-block mr-1" />
                                                        {formatDate(task.startDate)} - {formatDate(task.endDate)}
                                                      </span>
                                                    )}
                                                    <div className="flex items-center gap-2">
                                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        Progression:
                                                      </span>
                                                      <Progress value={task.progress} className="w-20 h-1.5" />
                                                      <span className="text-xs font-medium text-black dark:text-white">
                                                        {task.progress}%
                                                      </span>
                                                    </div>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        ) : (
                                          <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Aucune tâche assignée
                                          </p>
                                        )}
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        )}

                        {/* Statistiques des tâches */}
                        <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                              <CheckSquare className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                              Répartition des tâches
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="text-sm font-medium mb-2 text-black dark:text-white">Par statut</h4>
                                <div className="space-y-2">
                                  {Object.entries(projectData.stats.tasksByStatus || {}).map(([status, count]) => (
                                    <div key={status} className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span
                                          className={`w-3 h-3 rounded-full ${
                                            status === "terminé"
                                              ? "bg-green-500"
                                              : status === "en_révision"
                                                ? "bg-yellow-500"
                                                : status === "en_cours"
                                                  ? "bg-blue-500"
                                                  : "bg-gray-500"
                                          }`}
                                        ></span>
                                        <span className="text-sm text-black dark:text-white">
                                          {getStatusText(status)}
                                        </span>
                                      </div>
                                      <span className="text-sm font-medium text-black dark:text-white">{String(count)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-2 text-black dark:text-white">Par priorité</h4>
                                <div className="space-y-2">
                                  {Object.entries(projectData.stats.tasksByPriority || {}).map(([priority, count]) => (
                                    <div key={priority} className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span
                                          className={`w-3 h-3 rounded-full ${
                                            priority === "urgente"
                                              ? "bg-red-500"
                                              : priority === "haute"
                                                ? "bg-orange-500"
                                                : priority === "moyenne"
                                                  ? "bg-blue-500"
                                                  : "bg-green-500"
                                          }`}
                                        ></span>
                                        <span className="text-sm text-black dark:text-white">
                                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                        </span>
                                      </div>
                                      <span className="text-sm font-medium text-black dark:text-white">{String(count)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Performance de l'équipe */}
                        {projectData.stats.teamPerformance && projectData.stats.teamPerformance.length > 0 && (
                          <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                                <TrendingUp className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                                Performance de l'équipe
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {projectData.stats.teamPerformance.map((member: TeamPerformanceItem) => (
                                  <div key={member.memberId} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                      <h4 className="text-sm font-medium text-black dark:text-white">{member.name}</h4>
                                      <Badge
                                        className={
                                          member.completionRate > 75
                                            ? "bg-green-100 text-green-800"
                                            : "bg-blue-100 text-blue-800"
                                        }
                                      >
                                        {member.tasksCompleted} tâches terminées
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        Taux de complétion:
                                      </span>
                                      <Progress value={member.completionRate} className="flex-1 h-1.5" />
                                      <span className="text-xs font-medium text-black dark:text-white">
                                        {member.completionRate}%
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-500 dark:text-gray-400">Temps moyen:</span>
                                      <span className="text-xs font-medium text-black dark:text-white">
                                        {member.averageCompletionTime}{" "}
                                        {member.averageCompletionTime === 1 ? "jour" : "jours"}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Tendances de performance */}
                        {projectData.stats.performanceData && projectData.stats.performanceData.length > 0 && (
                          <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                                <TrendingUp className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                                Tendances de performance
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="h-64 flex items-center justify-center">
                                <div className="w-full space-y-4">
                                  <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-sm font-medium text-black dark:text-white">
                                      Tâches complétées par mois
                                    </h4>
                                  </div>
                                  <div className="relative h-40">
                                    <div className="absolute inset-0 flex items-end justify-between px-2">
                                      {projectData.stats.performanceData.map((item: PerformanceDataItem, index: number) => (
                                        <div key={index} className="flex flex-col items-center">
                                          <div className="relative w-12 flex justify-center">
                                            <div
                                              className="w-8 bg-indigo-500 rounded-t-md"
                                              style={{ height: `${(item.actuel / 10) * 100}px` }}
                                            ></div>
                                            <div
                                              className="w-8 bg-gray-300 dark:bg-gray-600 rounded-t-md absolute left-1"
                                              style={{
                                                height: `${(item.precedent / 10) * 100}px`,
                                                opacity: 0.7,
                                                zIndex: -1,
                                              }}
                                            ></div>
                                          </div>
                                          <span className="text-xs mt-2 text-gray-600 dark:text-gray-400">
                                            {item.name}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="flex justify-center gap-6">
                                    <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                                      <span className="text-xs text-gray-600 dark:text-gray-400">Actuel</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                                      <span className="text-xs text-gray-600 dark:text-gray-400">Précédent</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="rounded-full bg-indigo-50 dark:bg-indigo-900 p-4 mb-4">
                  <FileText className="h-10 w-10 text-black dark:text-white" />
                </div>
                <h3 className="text-xl font-medium text-black dark:text-white mb-2">Aucun rapport généré</h3>
                <p className="max-w-sm text-black dark:text-white">
                  Configurez les paramètres et générez votre premier rapport détaillé pour visualiser les données ici.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Dialog de planification */}
        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-black dark:text-white">Planifier le rapport</DialogTitle>
              <DialogDescription className="text-black dark:text-white">
                Choisissez quand vous souhaitez recevoir ce rapport détaillé automatiquement
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <span className="block text-sm font-medium text-black dark:text-white">
                  Sélectionnez la date et l'heure :
                </span>
                <input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="border rounded p-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowScheduleDialog(false)}
                className="text-black dark:text-white"
              >
                Annuler
              </Button>
              <Button
                onClick={handleConfirmSchedule}
                disabled={!scheduleDate || isSchedulingReport}
                className="bg-indigo-500 hover:bg-indigo-600 text-white"
              >
                {isSchedulingReport ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Planification...
                  </span>
                ) : (
                  "Planifier"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Sheet pour l'historique des rapports */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="flex gap-2 ml-auto border-indigo-200 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900 text-black dark:text-white"
            >
              <Briefcase className="h-4 w-4 text-black dark:text-white" /> Rapports précédents
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle className="text-black dark:text-white">Historique des rapports</SheetTitle>
              <SheetDescription className="text-black dark:text-white">
                Liste des derniers rapports détaillés générés pour vos projets
              </SheetDescription>
            </SheetHeader>
            <div className="py-6 space-y-4">
              {isLoadingHistory ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                </div>
              ) : reportHistory && reportHistory.length > 0 ? (
                reportHistory.map((report: Report) => (
                  <Card
                    key={report.id}
                    className="transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900 border border-gray-200 dark:border-gray-700"
                  >
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-black dark:text-white">{report.name}</h4>
                        <p className="text-xs text-black dark:text-white">
                          Généré le {new Date(report.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(report.id)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 hover:bg-indigo-100 dark:hover:bg-indigo-800"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">Aucun rapport dans l'historique</p>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}

export default AutomatedReport
