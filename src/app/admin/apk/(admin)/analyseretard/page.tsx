"use client"

import { type JSX, useState, useEffect } from "react"
import {
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  TableCellsIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline"
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from "recharts"
import { motion } from "framer-motion"
import { useGetAllProjectsStatsQuery, useGetProjectLifecycleQuery } from "@/app/state/api"

// Palette de couleurs
const primaryColor = "#b03ff3" // mauve dominant
const accentYellow = "#FFC107"
const accentGreen = "#4CAF50"
const accentOrange = "#FF9800"

// Définition du type Task
type Task = {
  id: number
  title: string
  status: "on-track" | "risk" | "delayed" | "completed" | "active" | "planned"
  predictedDelay?: number
  confidenceLevel?: number
  duration?: number
  issues?: number
  progress?: number
  startDate?: string
  endDate?: string
  description?: string
  assignee?: string
  priority?: string
}

// Définition du type Projet
type Projet = {
  id: number // Changé pour être uniquement un nombre
  name: string
  dateDebut: string
  chefProjet: string
  equipe: string
  tasks?: Task[]
}

// Composant pour afficher un badge en fonction du statut
const RiskBadge = ({ status }: { status: Task["status"] }) => {
  const statusConfig = {
    "on-track": { color: "bg-green-100 text-green-800", label: "Dans les temps" },
    risk: { color: "bg-yellow-100 text-yellow-800", label: "À risque" },
    delayed: { color: "bg-orange-100 text-orange-800", label: "En retard" },
    completed: { color: "bg-green-100 text-green-800", label: "Terminé" },
    active: { color: "bg-blue-100 text-blue-800", label: "En cours" },
    planned: { color: "bg-purple-100 text-purple-800", label: "Planifié" },
  }
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig[status].color}`}
    >
      {statusConfig[status].label}
    </span>
  )
}

// Tooltip personnalisé pour le graphique
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded shadow">
        <p className="text-sm font-medium text-gray-800 dark:text-white">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-300">Retard : {payload[0].value} j</p>
      </div>
    )
  }
  return null
}

// Graphique des retards prédis
const DelayChart = ({ tasks }: { tasks: Task[] }) => {
  const chartData = tasks
    .filter((task) => task.predictedDelay !== undefined)
    .map((task) => ({
      name: task.title,
      delay: task.predictedDelay,
    }))

  if (chartData.length === 0) {
    return (
      <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
          <ChartBarIcon className="w-6 h-6" style={{ color: primaryColor }} />
          Retards Prédits
        </h2>
        <div className="h-[180px] flex items-center justify-center">
          <p className="text-gray-500">Aucune donnée de retard disponible</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
        <ChartBarIcon className="w-6 h-6" style={{ color: primaryColor }} />
        Retards Prédits
      </h2>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData}>
          <XAxis dataKey="name" stroke={primaryColor} tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="delay" fill={primaryColor} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Composant de carte statistique avec couleurs soft
const StatsCard = ({
  title,
  value,
  icon,
  bgClass,
}: {
  title: string
  value: string
  icon: JSX.Element
  bgClass: string
}) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className={`flex items-center p-4 ${bgClass} text-gray-800 rounded-xl shadow-lg`}
  >
    <div className="p-3 bg-white bg-opacity-30 rounded-full mr-4">{icon}</div>
    <div>
      <p className="text-sm">{title}</p>
      <p className="font-bold text-2xl">{value}</p>
    </div>
  </motion.div>
)

// En-tête de la page d'analyse avec informations du projet
const Header = ({ projet }: { projet: Projet }) => {
  const currentDate = new Date()
  return (
    <div className="mb-8">
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl font-bold flex items-center gap-3"
        style={{ color: primaryColor }}
      >
        <div className="p-3 rounded-xl" style={{ backgroundColor: primaryColor + "20" }}>
          <SparklesIcon className="w-8 h-8" style={{ color: primaryColor }} />
        </div>
        <span className="flex items-center text-4xl font-extrabold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
          Analyse du {projet.name}
        </span>
      </motion.h1>
      <p className="text-gray-600 dark:text-gray-300">
        Début : {projet.dateDebut} • Chef de projet : {projet.chefProjet} • Équipe : {projet.equipe}
      </p>
      <p className="mt-2 text-lg font-medium text-gray-700 dark:text-gray-400">
        Aujourd'hui, c'est le{" "}
        {currentDate.toLocaleDateString("fr-FR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
    </div>
  )
}

// Section des statistiques
const Statistics = ({ tasks }: { tasks: Task[] }) => {
  // Calculate statistics based on tasks
  const tasksWithDelay = tasks.filter((task) => task.predictedDelay !== undefined && task.predictedDelay > 0)
  const totalDelay = tasksWithDelay.reduce((acc, task) => acc + (task.predictedDelay || 0), 0)
  const averageDelay = tasksWithDelay.length > 0 ? (totalDelay / tasksWithDelay.length).toFixed(1) : "0.0"

  const tasksWithConfidence = tasks.filter((task) => task.confidenceLevel !== undefined && task.confidenceLevel > 0)
  const averageConfidence =
    tasksWithConfidence.length > 0
      ? (
          tasksWithConfidence.reduce((acc, task) => acc + (task.confidenceLevel || 0), 0) / tasksWithConfidence.length
        ).toFixed(0)
      : "0"

  // Estimate time saved (this is a placeholder calculation)
  const completedTasks = tasks.filter((task) => task.status === "completed").length
  const timeSaved = `${completedTasks * 3}h`

  // Ajouter des logs pour déboguer
  console.log("Tasks with delay:", tasksWithDelay.length, "Average delay:", averageDelay)
  console.log("Tasks with confidence:", tasksWithConfidence.length, "Average confidence:", averageConfidence)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <StatsCard
        title="Retard moyen prédit"
        value={`${averageDelay} j`}
        icon={<ExclamationTriangleIcon className="w-6 h-6" style={{ color: accentOrange }} />}
        bgClass="bg-orange-100"
      />
      <StatsCard
        title="Précision du modèle"
        value={`${averageConfidence}%`}
        icon={<ChartBarIcon className="w-6 h-6" style={{ color: accentGreen }} />}
        bgClass="bg-green-100"
      />
      <StatsCard
        title="Temps économisé"
        value={timeSaved}
        icon={<ClockIcon className="w-6 h-6" style={{ color: accentYellow }} />}
        bgClass="bg-yellow-100"
      />
    </div>
  )
}

// Tableau des tâches avec colonnes organisées et couleurs soft mauve pastel
const TasksTable = ({ tasks }: { tasks: Task[] }) => {
  const [selectedRisk, setSelectedRisk] = useState<"all" | "risk" | "delayed" | "active" | "completed">("all")
  const filteredTasks = tasks.filter((task) => (selectedRisk === "all" ? true : task.status === selectedRisk))

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <TableCellsIcon className="w-6 h-6" />
          Liste des Tâches
        </h2>
        <select
          value={selectedRisk}
          onChange={(e) => setSelectedRisk(e.target.value as "all" | "risk" | "delayed" | "active" | "completed")}
          className="rounded-lg border-gray-300 focus:border-[#b03ff3] focus:ring-[#b03ff3] text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="all">Tous les statuts</option>
          <option value="risk">À risque</option>
          <option value="delayed">En retard</option>
          <option value="active">En cours</option>
          <option value="completed">Terminé</option>
        </select>
      </div>
      {/* En-têtes horizontaux */}
      <div className="flex bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-medium text-xs uppercase">
        <div className="flex-1 px-6 py-3 flex items-center gap-1">
          <DocumentTextIcon className="w-4 h-4" /> Tâche
        </div>
        <div className="w-32 px-6 py-3 flex items-center gap-1">
          <ExclamationTriangleIcon className="w-4 h-4" /> Statut
        </div>
        <div className="w-32 px-6 py-3 flex items-center gap-1">
          <ClockIcon className="w-4 h-4" /> Retard
        </div>
        <div className="w-32 px-6 py-3 flex items-center gap-1">
          <ChartBarIcon className="w-4 h-4" /> Confiance
        </div>
      </div>
      {/* Corps du tableau */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {filteredTasks.map((task) => (
          <motion.div
            key={task.id}
            whileHover={{ scale: 1.01 }}
            className="flex hover:bg-purple-50 dark:hover:bg-purple-800 text-gray-900 dark:text-white text-sm p-4 items-center"
          >
            <div className="flex-1 px-6">{task.title}</div>
            <div className="w-32 px-6">
              <RiskBadge status={task.status} />
            </div>
            <div className="w-32 px-6">
              <span
                className={`font-medium ${task.predictedDelay && task.predictedDelay > 10 ? "text-red-600" : task.predictedDelay && task.predictedDelay > 5 ? "text-orange-500" : "text-gray-700"}`}
              >
                {task.predictedDelay || 0} j
              </span>
            </div>
            <div className="w-32 px-6">
              <div className="flex items-center">
                <div className="w-20 h-2 bg-purple-200 rounded-full">
                  <div
                    className="h-full bg-purple-600 rounded-full"
                    style={{ width: `${task.confidenceLevel || 0}%` }}
                  />
                </div>
                <span className="ml-2">{task.confidenceLevel || 0}%</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <TableCellsIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-300" />
          <p className="mt-4 text-sm text-gray-500">Aucune tâche correspondante</p>
        </div>
      )}
    </div>
  )
}

// Alerte proactive en cas de tâches présentant un risque ou retard
const ProactiveAlert = ({ tasks }: { tasks: Task[] }) => {
  const alertTasks = tasks.filter((task) => task.status === "risk" || task.status === "delayed")
  if (alertTasks.length === 0) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg shadow-lg flex items-center gap-3"
    >
      <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
      <span className="text-red-800 dark:text-red-300 text-sm">
        Attention : {alertTasks.length} tâche(s) présentent un risque ou sont en retard.
      </span>
    </motion.div>
  )
}

// Composant pour afficher la liste des projets avec un design original
const ProjectList = ({ onSelect, projects }: { onSelect: (projet: Projet) => void; projects: Projet[] }) => {
  return (
    <div className="p-6 bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 rounded-xl shadow-2xl space-y-6">
      <h1 className="flex items-center text-4xl font-extrabold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
        <div className="p-3 rounded-xl" style={{ backgroundColor: primaryColor + "20" }}></div>
        <span className="ml-4">Sélectionnez un projet pour analyser le retard</span>
      </h1>
      {projects.length === 0 ? (
        <div className="text-center py-12">
          <TableCellsIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-300" />
          <p className="mt-4 text-sm text-gray-500">Aucun projet disponible</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((projet) => (
            <motion.div
              key={projet.id}
              whileHover={{ scale: 1.03 }}
              onClick={() => onSelect(projet)}
              className="p-6 bg-gray-50 dark:bg-slate-700 rounded-2xl shadow-xl cursor-pointer border border-transparent hover:border-[3px] hover:border-[#b03ff3] transition"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{projet.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Début : {projet.dateDebut}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Chef : {projet.chefProjet}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Équipe : {projet.equipe}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

// Composant principal
export default function AnalyseDeRetard() {
  const [selectedProject, setSelectedProject] = useState<Projet | null>(null)
  const { data: projectsData, isLoading: projectsLoading, error: projectsError } = useGetAllProjectsStatsQuery({})
  const { data: projectLifecycle, isLoading: lifecycleLoading } = useGetProjectLifecycleQuery(
    selectedProject ? Number(selectedProject.id) : 0,
    { skip: !selectedProject },
  )

  // Ajouter des logs pour déboguer
  useEffect(() => {
    if (projectLifecycle) {
      console.log("Project lifecycle data:", projectLifecycle)
      console.log("Tasks:", projectLifecycle.tasks)

      // Vérifier les valeurs de retard et de confiance
      const tasksWithDelay = projectLifecycle.tasks?.filter((t: { predictedDelay: number }) => t.predictedDelay > 0) || []
      const tasksWithConfidence = projectLifecycle.tasks?.filter((t: { confidenceLevel: number }) => t.confidenceLevel > 0) || []

      console.log("Tasks with delay:", tasksWithDelay.length)
      console.log("Tasks with confidence:", tasksWithConfidence.length)

      // Calculer les moyennes
      const avgDelay =
        tasksWithDelay.length > 0
          ? tasksWithDelay.reduce((sum: any, t: { predictedDelay: any }) => sum + (t.predictedDelay || 0), 0) / tasksWithDelay.length
          : 0

      const avgConfidence =
        tasksWithConfidence.length > 0
          ? tasksWithConfidence.reduce((sum: any, t: { confidenceLevel: any }) => sum + (t.confidenceLevel || 0), 0) / tasksWithConfidence.length
          : 0

      console.log("Average delay:", avgDelay.toFixed(1))
      console.log("Average confidence:", avgConfidence.toFixed(0))
    }
  }, [projectLifecycle])

  // Transform projects data for the project list
  const projects: Projet[] =
    projectsData?.projects?.map((project: any) => ({
      id: Number(project.id),
      name: project.name,
      dateDebut: new Date(project.start_date).toLocaleDateString("fr-FR"),
      chefProjet: project.manager?.name || "Non assigné",
      equipe: `${project.team} membre(s)`,
    })) || []

  // If a project is selected and we have lifecycle data
  const selectedProjectWithTasks: Projet | null =
    selectedProject && projectLifecycle
      ? {
          ...selectedProject,
          tasks: projectLifecycle.tasks || [],
        }
      : null

  if (projectsLoading) {
    return (
      <section className="p-6 flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des projets...</p>
        </div>
      </section>
    )
  }

  if (projectsError) {
    return (
      <section className="p-6">
        <div className="p-6 bg-red-100 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-red-800">Erreur de chargement</h2>
          <p className="text-red-600">Impossible de charger les projets. Veuillez réessayer plus tard.</p>
        </div>
      </section>
    )
  }

  if (!selectedProject) {
    return (
      <section className="p-6">
        <ProjectList onSelect={(projet) => setSelectedProject(projet)} projects={projects} />
      </section>
    )
  }

  if (lifecycleLoading) {
    return (
      <section className="p-6">
        <button
          onClick={() => setSelectedProject(null)}
          className="flex items-center text-sm hover:underline mb-4"
          style={{ color: primaryColor }}
        >
          <ArrowLeftIcon className="w-4 h-4 mr-1" /> Retour à la liste des projets
        </button>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données du projet...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-2xl space-y-6">
      <button
        onClick={() => setSelectedProject(null)}
        className="flex items-center text-sm hover:underline"
        style={{ color: primaryColor }}
      >
        <ArrowLeftIcon className="w-4 h-4 mr-1" /> Retour à la liste des projets
      </button>
      {selectedProjectWithTasks && (
        <>
          <Header projet={selectedProjectWithTasks} />
          <Statistics tasks={selectedProjectWithTasks.tasks || []} />
          <DelayChart tasks={selectedProjectWithTasks.tasks || []} />
          <ProactiveAlert tasks={selectedProjectWithTasks.tasks || []} />
          <TasksTable tasks={selectedProjectWithTasks.tasks || []} />
        </>
      )}
    </section>
  )
}
