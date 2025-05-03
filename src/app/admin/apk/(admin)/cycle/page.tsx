"use client"

import type React from "react"
import { useState } from "react"
import { FilterIcon } from "lucide-react"
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  PlayIcon,
  EllipsisHorizontalIcon,
  XMarkIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline"
import { motion, AnimatePresence } from "framer-motion"
import { useGetProjectLifecycleQuery, useGetAllProjectsStatsQuery } from "@/app/state/api"
import { useRouter } from "next/navigation"

// Couleurs personnalisées
const couleurPrimaire = "#b03ff3" // Touche mauve
const vertAccent = "#4CAF50"
const orangeAccent = "#FF9800"
const bleuAccent = "#3B82F6" // Pour harmoniser la palette

// Étiquettes de statut pour affichage
const libellesStatut: Record<string, string> = {
  all: "Tous",
  completed: "Terminée",
  active: "En cours",
  delayed: "En retard",
  planned: "Planifiée",
}

// Interfaces pour les données
interface Task {
  id: string | number
  title: string
  status: "planned" | "active" | "completed" | "delayed"
  predictedDelay: number
  confidenceLevel: number
  progress: number
  startDate: string
  endDate: string
  description?: string
  assignee?: string
  priority?: string
}

interface Project {
  id: number
  name: string
  dateDebut: string
  chefProjet: string
  equipe: string
  tasks: Task[]
}

// Composant affichant le cycle de vie d'un projet
function ProjectCycleCard({
  project,
  onBack,
}: {
  project: Project
  onBack: () => void
}) {
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "active" | "delayed" | "planned">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  // Calcul de la progression globale
  const overallProgress =
    project.tasks.length > 0
      ? Math.round(project.tasks.reduce((acc, task) => acc + task.progress, 0) / project.tasks.length)
      : 0

  // Filtrage des tâches
  const filteredTasks = project.tasks.filter((task) => {
    const statutOk = filterStatus === "all" ? true : task.status === filterStatus
    const rechercheOk = task.title.toLowerCase().includes(searchTerm.toLowerCase())
    return statutOk && rechercheOk
  })

  return (
    <section className="p-6 bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 rounded-xl shadow-2xl space-y-6 transition-all duration-300">
      <button onClick={onBack} className="flex items-center text-sm text-purple-600 hover:underline transition-colors">
        <ArrowLeftIcon className="w-4 h-4 mr-1" /> Retour à la liste des projets
      </button>
      <div className="flex flex-col gap-1">
        <h2 className="flex items-center text-2xl font-bold text-slate-800 dark:text-white">
          <ArrowPathIcon className="w-8 h-8 mr-2" style={{ color: couleurPrimaire }} />
          {project.name}
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <p>Début : {project.dateDebut}</p>
          <p>Chef de projet : {project.chefProjet}</p>
          <p>Équipe : {project.equipe}</p>
        </div>
      </div>

      {/* Progression globale */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 bg-gray-100 dark:bg-slate-700 rounded-lg shadow-md flex justify-between items-center transition-all duration-300"
      >
        <div className="flex items-center">
          <InformationCircleIcon className="w-6 h-6 mr-2" style={{ color: couleurPrimaire }} />
          <div className="text-slate-800 dark:text-white">
            <p className="text-sm">Progression globale</p>
            <p className="text-2xl font-bold">{overallProgress}%</p>
          </div>
        </div>
      </motion.div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="relative flex items-center">
          <FilterIcon className="w-5 h-5 text-slate-500 absolute left-3" />
          <input
            type="text"
            placeholder="Rechercher une tâche…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-4 py-3 text-lg rounded-lg border border-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 transition-all duration-300"
            style={{ "--tw-ring-color": couleurPrimaire } as React.CSSProperties}
          />
        </div>
        <div className="flex gap-4 flex-wrap">
          {(["all", "completed", "active", "delayed", "planned"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={filterStatus === status ? { backgroundColor: couleurPrimaire, color: "white" } : {}}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                filterStatus === status ? "" : "bg-purple-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300"
              }`}
            >
              {libellesStatut[status]}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline des tâches */}
      <div className="relative pb-4 overflow-x-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-w-[800px] md:min-w-0">
          {filteredTasks.map((task) => {
            const { border, bg, progress } = getStatusStyles(task.status)
            return (
              <motion.div
                key={task.id}
                className="group relative cursor-pointer transition-transform duration-300"
                onClick={() => setSelectedTask(task)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
              >
                <div
                  className={`p-4 border-2 ${border} rounded-lg transition-all duration-300 ${bg} hover:border-[${couleurPrimaire}] dark:hover:border-[${couleurPrimaire}]`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(task.status)}
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100">{task.title}</h3>
                    </div>
                    <span className={`w-3 h-3 rounded-full ${progress}`} />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                    {task.startDate} – {task.endDate}
                  </p>
                  {task.assignee && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">Assigné à: {task.assignee}</p>
                  )}
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${progress}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${task.progress}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                  {task.predictedDelay > 0 && (
                    <div className="flex items-center gap-2 text-rose-600 mt-2">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      <span className="text-sm">
                        Retard prévu: {task.predictedDelay} jour{task.predictedDelay > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>
                {/* Info-bulle */}
                {task.description && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                    <div className="bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs p-2 rounded shadow-md max-w-xs">
                      {task.description}
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Légende */}
      <div className="mt-6 flex flex-wrap gap-4 items-center text-sm text-slate-600 dark:text-slate-200">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-400" /> Terminée
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: couleurPrimaire }} /> En cours
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-400" /> En retard
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gray-300" /> Planifiée
        </div>
      </div>

      {/* Modal détails tâche */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl w-full max-w-lg relative"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <button
                onClick={() => setSelectedTask(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
              <h2 className="flex items-center text-2xl font-bold text-slate-800 dark:text-white mb-4">
                {getStatusIcon(selectedTask.status)}
                <span className="ml-2">{selectedTask.title}</span>
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                Statut : <span className="font-medium">{libellesStatut[selectedTask.status]}</span>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                Période : {selectedTask.startDate} – {selectedTask.endDate}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">Progression : {selectedTask.progress}%</p>
              {selectedTask.assignee && (
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">Assigné à : {selectedTask.assignee}</p>
              )}
              {selectedTask.priority && (
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">Priorité : {selectedTask.priority}</p>
              )}
              {selectedTask.predictedDelay > 0 && (
                <p className="text-sm text-rose-600 mb-2">
                  Retard prévu : {selectedTask.predictedDelay} jour{selectedTask.predictedDelay > 1 ? "s" : ""}
                  <span className="text-xs text-slate-500 ml-2">(confiance: {selectedTask.confidenceLevel}%)</span>
                </p>
              )}
              {selectedTask.description && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description:</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{selectedTask.description}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

// Liste des projets
function ProjectList({ onSelect }: { onSelect: (projectId: number) => void }) {
  const { data: projectsData, isLoading, error } = useGetAllProjectsStatsQuery({})

  if (isLoading) {
    return (
      <div className="p-6 bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 rounded-xl shadow-2xl flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (error || !projectsData) {
    return (
      <div className="p-6 bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 rounded-xl shadow-2xl">
        <h1 className="text-xl text-red-500">Erreur lors du chargement des projets</h1>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 rounded-xl shadow-2xl space-y-6 transition-all duration-300">
      <h1 className="flex items-center text-4xl font-extrabold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
        <div className="p-3 rounded-xl" style={{ backgroundColor: couleurPrimaire + "20" }} />
        <span className="ml-4">Sélectionnez un projet pour voir son cycle de vie</span>
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projectsData.projects.map((project: any) => (
          <motion.div
            key={project.id}
            whileHover={{ scale: 1.03 }}
            onClick={() => onSelect(project.id)}
            className="p-6 bg-white dark:bg-slate-700 rounded-2xl shadow-xl cursor-pointer border border-transparent hover:border-2 hover:border-[#b03ff3] transition-all duration-300"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{project.name}</h3>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p>Début : {project.start_date}</p>
              <p>Chef : {project.manager?.name || "Non assigné"}</p>
              <p>Équipe : {project.team} membres</p>
            </div>
            <div className="mt-4 flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
              </div>
              <span className="text-sm font-medium">{project.progress}%</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Styles dynamiques selon le statut
const getStatusStyles = (status: string) => {
  switch (status) {
    case "completed":
      return {
        border: "border-green-300 dark:border-green-400",
        bg: "bg-green-50 dark:bg-green-900/20",
        progress: "bg-green-400",
      }
    case "active":
      return {
        border: "border-purple-300 dark:border-purple-400",
        bg: "bg-purple-50 dark:bg-purple-900/20",
        progress: "bg-purple-400",
      }
    case "delayed":
      return {
        border: "border-rose-300 dark:border-rose-400",
        bg: "bg-rose-50 dark:bg-rose-900/20",
        progress: "bg-rose-400",
      }
    case "planned":
      return {
        border: "border-gray-200 dark:border-slate-700",
        bg: "bg-gray-50 dark:bg-slate-700",
        progress: "bg-gray-300",
      }
    default:
      return {
        border: "border-gray-200 dark:border-slate-700",
        bg: "bg-gray-50 dark:bg-slate-700",
        progress: "bg-gray-300",
      }
  }
}

// Icône selon le statut de la tâche
const getStatusIcon = (status: Task["status"]) => {
  switch (status) {
    case "completed":
      return <CheckCircleIcon className="w-5 h-5" style={{ color: vertAccent }} />
    case "active":
      return <PlayIcon className="w-5 h-5" style={{ color: couleurPrimaire }} />
    case "delayed":
      return <ExclamationTriangleIcon className="w-5 h-5" style={{ color: orangeAccent }} />
    case "planned":
      return <EllipsisHorizontalIcon className="w-5 h-5 text-gray-500" />
    default:
      return null
  }
}

// Composant principal
export default function GlobalProjectDashboard() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
  const { data: projectData, isLoading } = useGetProjectLifecycleQuery(selectedProjectId || 0, {
    skip: !selectedProjectId,
  })
  const router = useRouter()

  if (selectedProjectId && isLoading) {
    return (
      <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      {!selectedProjectId ? (
        <ProjectList onSelect={(id) => setSelectedProjectId(id)} />
      ) : projectData ? (
        <ProjectCycleCard project={projectData} onBack={() => setSelectedProjectId(null)} />
      ) : (
        <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-xl">
          <h2 className="text-xl text-red-500">Erreur lors du chargement des données du projet</h2>
          <button
            onClick={() => setSelectedProjectId(null)}
            className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Retour à la liste
          </button>
        </div>
      )}
    </div>
  )
}
