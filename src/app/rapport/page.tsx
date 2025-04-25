"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { useToast } from "@/app/(components)/ui/use-toast"
import { FileText, Calendar, Download, TrendingUp, Briefcase, CheckCircle, X, Loader2 } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/(components)/ui/card"
import { Button } from "@/app/(components)/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/(components)/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/(components)/ui/tabs"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/app/(components)/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/app/(components)/ui/dialog"
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts"
import ReportMetric from "../(components)/ReportMetric"
import {
  useGetUserProjectsQuery,
  useGetProjectsReportQuery,
  useGetHistoricalReportsQuery,
  useGenerateReportMutation,
  useScheduleReportMutation,
} from "../state/api"
import type { ReportParams, HistoricalReport } from "./types"

// Couleurs pour les graphiques
const COLORS = ["#9B85F6", "#B3A1F9", "#C9BCFC", "#DED7FE"]
const STATUS_COLORS = {
  à_faire: "#f97316",
  en_cours: "#3b82f6",
  en_révision: "#eab308",
  terminé: "#22c55e",
}

const AutomatedReport = () => {
  // États de configuration
  const [project, setProject] = useState<string>("all")
  const [period, setPeriod] = useState<string>("month")
  const [reportType, setReportType] = useState<string>("summary")
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [reportGenerated, setReportGenerated] = useState<boolean>(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState<boolean>(false)
  const [scheduleDate, setScheduleDate] = useState<string>("")
  const { toast } = useToast()

  // Récupérer l'ID utilisateur de Clerk depuis le localStorage
  const [clerkUserId, setClerkUserId] = useState<string | null>(null)

  useEffect(() => {
    const userId = localStorage.getItem("currentUserId")
    if (userId) {
      setClerkUserId(userId)
    }
  }, [])

  // Add this near the top of the component
  useEffect(() => {
    // Debug log to check if the component is loading
    console.log("Report page loaded", { clerkUserId, project, period, reportType })

    // Check if the API is accessible
    if (clerkUserId) {
      fetch("http://localhost:8000/api/reports/debug", {
        headers: {
          "X-Clerk-User-Id": clerkUserId,
        },
      })
        .then((res) => res.json())
        .then((data) => console.log("API Debug:", data))
        .catch((err) => console.error("API Debug Error:", err))
    }
  }, [clerkUserId, project, period, reportType])

  // Requêtes API
  const { data: userProjects, isLoading: isLoadingProjects } = useGetUserProjectsQuery(clerkUserId || "", {
    skip: !clerkUserId,
  })

  const reportParams: ReportParams = {
    projectId: project,
    period: period as "week" | "month" | "quarter" | "year",
    reportType: reportType as "summary" | "detailed" | "analytics",
  }

  const {
    data: reportData,
    isLoading: isLoadingReport,
    refetch: refetchReport,
  } = useGetProjectsReportQuery(reportParams, {
    skip: !clerkUserId,
  })

  // Add this to log report data when it changes
  useEffect(() => {
    if (reportData) {
      console.log("Report data received:", reportData)
    }
  }, [reportData])

  const { data: historicalReports, isLoading: isLoadingHistory } = useGetHistoricalReportsQuery(clerkUserId || "", {
    skip: !clerkUserId,
  })

  const [generateReport] = useGenerateReportMutation()
  const [scheduleReport] = useScheduleReportMutation()

  // Gestionnaire appelé lors du clic sur le bouton de génération
  const handleGenerate = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault()
    if (!clerkUserId) return

    setIsGenerating(true)

    try {
      // Use the correct API endpoint with query parameters instead of body
      await refetchReport()
      setReportGenerated(true)

      toast({
        title: "Rapport généré avec succès",
        description: "Votre rapport est prêt à être consulté et téléchargé",
        variant: "default",
      })
    } catch (error) {
      console.error("Error generating report:", error)
      toast({
        title: "Erreur lors de la génération du rapport",
        description: "Une erreur est survenue, veuillez réessayer",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePlanifier = () => setShowScheduleDialog(true)

  const handleConfirmSchedule = async () => {
    if (!scheduleDate || !clerkUserId) return

    try {
      await scheduleReport({
        clerkUserId,
        scheduledDate: scheduleDate,
        ...reportParams,
      }).unwrap()

      toast({
        title: "Rapport planifié",
        description: `Le rapport est planifié pour le ${new Date(scheduleDate).toLocaleString()}`,
        variant: "default",
      })
      setShowScheduleDialog(false)
      setScheduleDate("")
    } catch (error) {
      toast({
        title: "Erreur lors de la planification",
        description: "Une erreur est survenue, veuillez réessayer",
        variant: "destructive",
      })
    }
  }

  const handleDownload = async (reportId?: number) => {
    try {
      // Ici, vous pourriez implémenter un appel API pour télécharger le rapport
      // Pour l'instant, nous simulons le téléchargement
      const reportContent = reportId
        ? `Rapport historique ID: ${reportId}`
        : `Rapport ${reportType} généré pour ${project} sur ${period}`

      const blob = new Blob([reportContent], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "rapport.txt"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Téléchargement démarré",
        description: "Votre rapport est en cours de téléchargement",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Erreur lors du téléchargement",
        description: "Une erreur est survenue, veuillez réessayer",
        variant: "destructive",
      })
    }
  }

  // Préparation des données pour les sélecteurs
  const projectOptions = [
    { value: "all", span: "Tous les projets" },
    ...(userProjects?.managerProjects || []).map((project: { id: { toString: () => any }; name: any }) => ({
      value: project.id.toString(),
      span: project.name,
    })),
    ...(userProjects?.invitedProjects || []).map((project: { id: { toString: () => any }; name: any }) => ({
      value: project.id.toString(),
      span: project.name,
    })),
  ]

  const periodOptions = [
    { value: "week", span: "Dernière semaine" },
    { value: "month", span: "Dernier mois" },
    { value: "quarter", span: "Dernier trimestre" },
    { value: "year", span: "Dernière année" },
  ]

  const reportOptions = [
    { value: "summary", span: "Synthèse" },
    { value: "detailed", span: "Détaillé" },
    { value: "analytics", span: "Analytique" },
  ]

  // Fonctions utilitaires
  const getProjectspan = () => projectOptions.find((opt) => opt.value === project)?.span || ""
  const getPeriodspan = () => periodOptions.find((opt) => opt.value === period)?.span || ""

  // Préparation des données pour les graphiques
  const getPerformanceData = () => {
    if (!reportData?.stats?.performanceData) {
      return []
    }
    return reportData.stats.performanceData
  }

  const getBudgetData = () => {
    if (!reportData?.stats?.budgetData) {
      return []
    }
    return reportData.stats.budgetData
  }

  const getTaskStatusData = () => {
    if (!reportData?.stats?.tasksByStatus) {
      return []
    }

    const { tasksByStatus } = reportData.stats
    return [
      { status: "Complétées", count: tasksByStatus.terminé, color: STATUS_COLORS.terminé },
      { status: "En cours", count: tasksByStatus.en_cours, color: STATUS_COLORS.en_cours },
      { status: "En révision", count: tasksByStatus.en_révision, color: STATUS_COLORS.en_révision },
      { status: "À faire", count: tasksByStatus.à_faire, color: STATUS_COLORS.à_faire },
    ]
  }

  const getCompletionRate = () => {
    if (!reportData?.stats) {
      return "0%"
    }
    return `${Math.round(reportData.stats.completionRate * 100)}%`
  }

  const getTasksCompletedText = () => {
    if (!reportData?.stats) {
      return "0/0"
    }
    return `${reportData.stats.completedTasks}/${reportData.stats.totalTasks}`
  }

  return (
    // Wrapper global
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto p-4 space-y-6 max-w-7xl">
        {/* Bandeau d'introduction */}
        <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 shadow-sm border border-indigo-100 dark:border-gray-700 animate-fade-in">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
              Générateur de Rapports Automatiques
            </h1>
            <p className="mt-2 text-black dark:text-white">
              Créez des rapports détaillés et professionnels en quelques clics pour tous vos projets
            </p>
          </div>
        </div>

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
                  Configurez les options pour générer votre rapport personnalisé
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-black dark:text-white">Projet</span>
                    <Select value={project} onValueChange={setProject} disabled={isLoadingProjects}>
                      <SelectTrigger className="text-black dark:text-white">
                        <SelectValue placeholder="Sélectionnez un projet" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingProjects ? (
                          <SelectItem value="loading" disabled>
                            <span className="flex items-center">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Chargement...
                            </span>
                          </SelectItem>
                        ) : (
                          projectOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <span className="text-black dark:text-white">{option.span}</span>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-black dark:text-white">Période</span>
                    <Select value={period} onValueChange={setPeriod}>
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
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-black dark:text-white">Type de Rapport</span>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger className="text-black dark:text-white">
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                      <SelectContent>
                        {reportOptions.map((option) => (
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
                  disabled={isGenerating || !clerkUserId}
                >
                  {isGenerating ? (
                    <span className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Génération en cours...
                    </span>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4 text-white" /> Générer le Rapport
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Affichage du rapport généré */}
          <div className="animate-fade-in lg:col-span-2">
            {reportGenerated ? (
              <Card className="shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-2xl text-black dark:text-white">
                      Rapport {reportOptions.find((opt) => opt.value === reportType)?.span}
                    </CardTitle>
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
                    >
                      <Calendar className="mr-2 h-4 w-4 text-black dark:text-white" /> Planifier
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
                <CardContent className="pt-6">
                  {isLoadingReport ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    </div>
                  ) : (
                    <Tabs defaultValue="overview">
                      <TabsList className="mb-4">
                        <TabsTrigger value="overview" className="text-black dark:text-white">
                          Aperçu
                        </TabsTrigger>
                        <TabsTrigger value="performance" className="text-black dark:text-white">
                          Performance
                        </TabsTrigger>
                        <TabsTrigger value="tasks" className="text-black dark:text-white">
                          Tâches
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-4 text-black dark:text-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <ReportMetric
                            icon={<TrendingUp className="h-5 w-5 text-black dark:text-white" />}
                            title="Progression"
                            value={getCompletionRate()}
                            trend={`${reportData?.stats?.completionRate && reportData.stats.completionRate > 0.5 ? "+" : ""}${Math.round((reportData?.stats?.completionRate || 0) * 100 - 50)}% vs précédent`}
                            trendDirection={
                              reportData?.stats?.completionRate && reportData.stats.completionRate > 0.5 ? "up" : "down"
                            }
                          />
                          <ReportMetric
                            icon={<CheckCircle className="h-5 w-5 text-black dark:text-white" />}
                            title="Tâches Complétées"
                            value={getTasksCompletedText()}
                            trend={`${getCompletionRate()} d'achèvement`}
                            trendDirection="up"
                          />
                        </div>

                        <Card className="shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium text-black dark:text-white">
                              Répartition du Budget
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="h-60">
                              <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart>
                                  <Pie
                                    data={getBudgetData()}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#9B85F6"
                                    dataKey="value"
                                  >
                                    {getBudgetData().map((entry: any, index: number) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <RechartsTooltip formatter={(value) => [`${value} €`, "Budget"]} />
                                  <RechartsLegend />
                                </RechartsPieChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="performance" className="text-black dark:text-white">
                        <Card className="shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium text-black dark:text-white">
                              Performance sur la période
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="h-72">
                              <ResponsiveContainer width="100%" height="100%">
                                <RechartsBarChart
                                  data={getPerformanceData()}
                                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="name" className="text-black dark:text-white" />
                                  <YAxis className="text-black dark:text-white" />
                                  <RechartsTooltip />
                                  <RechartsLegend />
                                  <Bar dataKey="precedent" name="Période précédente" fill="#DED7FE" />
                                  <Bar dataKey="actuel" name="Période actuelle" fill="#9B85F6" />
                                </RechartsBarChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="tasks" className="text-black dark:text-white">
                        <Card className="shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium text-black dark:text-white">
                              Tâches par statut
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {getTaskStatusData().map((item, index) => (
                                <div
                                  key={index}
                                  className={`p-3 rounded-md border`}
                                  style={{
                                    backgroundColor: `${item.color}20`,
                                    borderColor: `${item.color}40`,
                                  }}
                                >
                                  <h4 className="font-medium text-black dark:text-white">
                                    {item.status}: {item.count}
                                  </h4>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
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
                  Configurez les paramètres et générez votre premier rapport pour visualiser les données ici.
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
                Choisissez quand vous souhaitez recevoir ce rapport automatiquement
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
                disabled={!scheduleDate}
                className="bg-indigo-500 hover:bg-indigo-600 text-white"
              >
                Planifier
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
            {/* Bouton de fermeture placé en haut à droite */}
            <SheetClose asChild>
              <Button variant="ghost" className="absolute top-2 right-2 p-1 text-black dark:text-white">
                <X className="h-6 w-6" />
              </Button>
            </SheetClose>
            <SheetHeader>
              <SheetTitle className="text-black dark:text-white">Historique des rapports</SheetTitle>
              <SheetDescription className="text-black dark:text-white">
                Liste des derniers rapports générés pour vos projets
              </SheetDescription>
            </SheetHeader>
            <div className="py-6 space-y-4">
              {isLoadingHistory ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                </div>
              ) : historicalReports && historicalReports.length > 0 ? (
                historicalReports.map((report: HistoricalReport, index: number) => (
                  <Card
                    key={index}
                    className="transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900 border border-gray-200 dark:border-gray-700"
                  >
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-black dark:text-white">{report.name}</h4>
                        <p className="text-xs text-black dark:text-white">
                          Généré le {new Date(report.date).toLocaleDateString()}
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
                <div className="text-center py-8 text-black dark:text-white">
                  <p>Aucun rapport historique disponible</p>
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
