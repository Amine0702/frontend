"use client"

import type React from "react"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { FileText, Calendar, Download, TrendingUp, Briefcase, CheckCircle, X, ArrowLeft } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
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
import {
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  PlayIcon,
  EllipsisHorizontalIcon,
  XMarkIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import ReportMetric from "@/components/ui/ReportMetric"

// Palette de couleurs personnalisée
const primaryColor = "#b03ff3" // Mauve dominant
const accentYellow = "#FFC107"
const accentGreen = "#4CAF50"
const accentOrange = "#FF9800"

// Interface pour les projets
interface Project {
  id: number
  name: string
  dateDebut: string
  chefProjet: string
  equipe: string
}

// Données pour les graphiques
const performanceData = [
  { name: "Jan", actuel: 65, precedent: 50 },
  { name: "Fév", actuel: 59, precedent: 55 },
  { name: "Mar", actuel: 80, precedent: 65 },
  { name: "Avr", actuel: 81, precedent: 70 },
  { name: "Mai", actuel: 78, precedent: 68 },
]

const budgetData = [
  { name: "Développement", value: 400 },
  { name: "Marketing", value: 300 },
  { name: "Support", value: 200 },
  { name: "Infrastructure", value: 150 },
]

const COLORS = ["#9B85F6", "#B3A1F9", "#C9BCFC", "#DED7FE"]

const AnalyseRetard = () => {
  // Liste fictive de projets
  const projects: Project[] = [
    {
      id: 1,
      name: "Projet Alpha",
      dateDebut: "10 Jan 2024",
      chefProjet: "Alice Dupont",
      equipe: "Développement & Design",
    },
    {
      id: 2,
      name: "Projet Beta",
      dateDebut: "15 Feb 2024",
      chefProjet: "Bob Martin",
      equipe: "Marketing & Ventes",
    },
    {
      id: 3,
      name: "Projet Gamma",
      dateDebut: "01 Mar 2024",
      chefProjet: "Claire Dupont",
      equipe: "Innovation",
    },
  ]

  // États pour la sélection de projet
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // États de configuration du rapport
  const [period, setPeriod] = useState("month")
  const [reportType, setReportType] = useState("summary")
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportGenerated, setReportGenerated] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [scheduleDate, setScheduleDate] = useState("")
  const [selectedFormat, setSelectedFormat] = useState("csv")
  const { toast } = useToast()

  // Gestionnaire appelé lors du clic sur le bouton de génération
  const handleGenerate = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault()
    setIsGenerating(true)

    // Simulation de la génération du rapport
    setTimeout(() => {
      setIsGenerating(false)
      setReportGenerated(true)
      toast({
        title: "Rapport généré avec succès",
        description: "Votre rapport est prêt à être consulté et téléchargé",
        variant: "default",
      })
    }, 1500)
  }

  const handlePlanifier = () => setShowScheduleDialog(true)

  const handleConfirmSchedule = () => {
    if (!scheduleDate) return
    toast({
      title: "Rapport planifié",
      description: `Le rapport est planifié pour le ${new Date(scheduleDate).toLocaleString()}`,
      variant: "default",
    })
    setShowScheduleDialog(false)
    setScheduleDate("")
  }
  
  const handleDownload = (reportName = "") => {
    const reportContent = reportName
      ? `Rapport historique: ${reportName}`
      : `Rapport ${reportType} généré pour ${selectedProject?.name || "tous les projets"} sur ${period}`

    const blob = new Blob([reportContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "rapport-retard.txt"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Téléchargement démarré",
      description: "Votre rapport est en cours de téléchargement",
      variant: "default",
    })
  }

  const periodOptions = [
    { value: "month", span: "Dernier mois" },
    { value: "quarter", span: "Dernier trimestre" },
    { value: "year", span: "Dernière année" },
  ]

  const reportOptions = [
    { value: "summary", span: "Synthèse" },
    { value: "detailed", span: "Détaillé" },
    { value: "analytics", span: "Analytique" },
  ]
  
  const formatOptions = [
    { value: "csv", span: "CSV" },
    { value: "pdf", span: "PDF" },
    { value: "excel", span: "Excel" },
  ]

  const historicalReports = [
    { name: "Rapport mensuel - Projet Alpha", date: "10/04/2025" },
    { name: "Rapport annuel - Tous les projets", date: "05/04/2025" },
    { name: "Rapport détaillé - Projet Beta", date: "01/04/2025" },
  ]

  const getPeriodspan = () => periodOptions.find((opt) => opt.value === period)?.span || ""

  // Affichage de la liste des projets si aucun projet n'est sélectionné
  if (!selectedProject) {
    return (
      <section className="p-6 bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 rounded-xl shadow-2xl space-y-6">
        <h1 className="flex items-center text-4xl font-extrabold bg-gradient-to-r from-[#b03ff3] to-blue-500 bg-clip-text text-transparent">
          <div className="p-3 rounded-xl" style={{ backgroundColor: primaryColor + "20" }}></div>
          <span className="ml-4">Sélectionnez un projet pour exporter son rapport</span>
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className="p-6 bg-gray-50 dark:bg-slate-700 rounded-2xl shadow-xl cursor-pointer border border-transparent hover:border-[3px] hover:border-[#b03ff3] transition"
            >
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{project.name}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Début : {project.dateDebut}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Chef : {project.chefProjet}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Équipe : {project.equipe}</p>
            </div>
          ))}
        </div>
      </section>
    )
  }
  const onBack = () => setSelectedProject(null)

  // Affichage du formulaire d'export pour le projet sélectionné
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Bouton de retour en haut de la page */}
      <div className="container mx-auto pt-4 px-4">
      <button
        onClick={onBack}
        className="flex items-center text-sm text-purple-600 hover:underline transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-1" /> Retour à la liste des projets
      </button>
      </div>

      <div className="container mx-auto p-4 space-y-6 max-w-7xl">
        {/* Bandeau d'introduction */}
        <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 shadow-sm border border-indigo-100 dark:border-gray-700 animate-fade-in">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#b03ff3] to-blue-500">
              Analyse des Retards: {selectedProject.name}
            </h1>
            <p className="mt-2 text-black dark:text-white">
              Analysez les retards et générez des rapports détaillés pour ce projet
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
                  Configurez les options pour générer votre rapport d'analyse des retards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-black dark:text-white">Projet</span>
                    <div className="p-2 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <div className="font-medium text-black dark:text-white">{selectedProject.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Chef: {selectedProject.chefProjet}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-black dark:text-white">Période</span>
                    <Select value={period} onValueChange={setPeriod}>
                      <SelectTrigger className="bg-white dark:bg-gray-800 text-black dark:text-white border-gray-200 dark:border-gray-700">
                        <SelectValue placeholder="Sélectionnez une période" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800">
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
                      <SelectTrigger className="bg-white dark:bg-gray-800 text-black dark:text-white border-gray-200 dark:border-gray-700">
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800">
                        {reportOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <span className="text-black dark:text-white">{option.span}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-black dark:text-white">Format d'export</span>
                    <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                      <SelectTrigger className="bg-white dark:bg-gray-800 text-black dark:text-white border-gray-200 dark:border-gray-700">
                        <SelectValue placeholder="Sélectionnez un format" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800">
                        {formatOptions.map((option) => (
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
                  className="w-full"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  style={{ background: primaryColor, color: "white" }}
                >
                  {isGenerating ? (
                    <span className="animate-pulse">Génération en cours...</span>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4 text-white" /> Générer l'Analyse
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
                    <CardTitle className="text-2xl text-black dark:text-white">Analyse des Retards</CardTitle>
                    <CardDescription className="text-black dark:text-white">
                      {selectedProject.name} | {getPeriodspan()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handlePlanifier}
                      style={{ backgroundColor: primaryColor, color: "white" }}
                    >
                      <Calendar className="mr-2 h-4 w-4 text-white" /> Planifier
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDownload()}
                      style={{ backgroundColor: primaryColor, color: "white" }}
                    >
                      <Download className="mr-2 h-4 w-4 text-white" /> Télécharger
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
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
                          icon={<TrendingUp className="h-5 w-5 text-black" />}
                          title="Progression"
                          value="78%"
                          trend="+12% vs précédent"
                          trendDirection="up"
                        />
                        <ReportMetric
                          icon={<CheckCircle className="h-5 w-5 text-black" />}
                          title="Tâches Complétées"
                          value="42/56"
                          trend="87% d'achèvement"
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
                                  data={budgetData}
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={80}
                                  fill="#9B85F6"
                                  dataKey="value"
                                >
                                  {budgetData.map((entry, index) => (
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
                                data={performanceData}
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
                            <div className="bg-green-50 dark:bg-green-900 p-3 rounded-md border border-green-100 dark:border-green-700">
                              <h4 className="font-medium text-black dark:text-white">Complétées: 42</h4>
                            </div>
                            <div className="bg-yellow-50 dark:bg-yellow-900 p-3 rounded-md border border-yellow-100 dark:border-yellow-700">
                              <h4 className="font-medium text-black dark:text-white">En cours: 11</h4>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900 p-3 rounded-md border border-red-100 dark:border-red-700">
                              <h4 className="font-medium text-black dark:text-white">En retard: 3</h4>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
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
          <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800">
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
                  className="border rounded p-2 w-full bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowScheduleDialog(false)}
                className="bg-white dark:bg-gray-700 text-black dark:text-white"
              >
                Annuler
              </Button>
              <Button
                onClick={handleConfirmSchedule}
                disabled={!scheduleDate}
                style={{ background: primaryColor, color: "white" }}
              >
                Planifier
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Sheet pour l'historique des rapports */}
        <Sheet>
          <SheetTrigger asChild>
            <Button className="flex gap-2 ml-auto" style={{ backgroundColor: primaryColor, color: "white" }}>
              <Briefcase className="h-4 w-4 text-white" /> Rapports précédents
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[400px]">
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
              {historicalReports.map((report, index) => (
                <Card
                  key={index}
                  className="transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900 border border-gray-200 dark:border-gray-700"
                >
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-black dark:text-white">{report.name}</h4>
                      <p className="text-xs text-black dark:text-white">Généré le {report.date}</p>
                    </div>
                    <Button
                      style={{ backgroundColor: primaryColor, color: "white" }}
                      size="icon"
                      onClick={() => handleDownload(report.name)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}

export default AnalyseRetard
