"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeftIcon, MagnifyingGlassIcon, CalendarIcon } from "@heroicons/react/24/outline"
import { useGetAIGeneratedTasksQuery } from "@/app/state/api"

const primaryColor = "#b03ff3"

interface AIGeneratedTask {
  id: number
  title: string
  description: string
  status: string
  priority: string
  created_at: string
  assignee: {
    id: number
    name: string
    avatar: string
  } | null
  project: {
    id: number
    name: string
  } | null
  column: {
    id: number
    title: string
  }
  tags: string[]
}

type Project = {
  id: number
  name: string
  tasks: AIGeneratedTask[]
}

const ProjectList = ({
  projects,
  onSelect,
  isLoading,
}: {
  projects: Project[]
  onSelect: (projet: Project) => void
  isLoading: boolean
}) => {
  if (isLoading) {
    return (
      <div className="p-6 bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 rounded-xl shadow-2xl space-y-6 transition-all duration-300">
        <h1 className="flex items-center text-4xl font-extrabold bg-gradient-to-r from-[#b03ff3] to-blue-500 bg-clip-text text-transparent">
          <div className="p-3 rounded-xl" style={{ backgroundColor: primaryColor + "20" }}></div>
          <span className="ml-4">Chargement des projets...</span>
        </h1>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="p-6 bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 rounded-xl shadow-2xl space-y-6 transition-all duration-300">
        <h1 className="flex items-center text-4xl font-extrabold bg-gradient-to-r from-[#b03ff3] to-blue-500 bg-clip-text text-transparent">
          <div className="p-3 rounded-xl" style={{ backgroundColor: primaryColor + "20" }}></div>
          <span className="ml-4">Journal d'activité IA</span>
        </h1>
        <div className="text-center py-10">
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Aucune tâche générée par IA n'a été trouvée. Essayez de créer une tâche avec l'assistant IA.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 rounded-xl shadow-2xl space-y-6 transition-all duration-300">
      <h1 className="flex items-center text-4xl font-extrabold bg-gradient-to-r from-[#b03ff3] to-blue-500 bg-clip-text text-transparent">
        <div className="p-3 rounded-xl" style={{ backgroundColor: primaryColor + "20" }}></div>
        <span className="ml-4">Journal d'activité IA</span>
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((projet) => (
          <motion.div
            key={projet.id}
            whileHover={{ scale: 1.03 }}
            onClick={() => onSelect(projet)}
            className="p-6 bg-gray-50 dark:text-white dark:bg-slate-700 rounded-2xl shadow-xl cursor-pointer border border-transparent hover:border-[3px] hover:border-[#b03ff3] transition"
          >
            <h3 className="text-xl font-bold mb-2">{projet.name}</h3>
            <p className="text-sm">Tâches générées par IA: {projet.tasks.length}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

const ProjectLogs = ({
  projet,
  onBack,
}: {
  projet: Project
  onBack: () => void
}) => {
  const [search, setSearch] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [selectedLog, setSelectedLog] = useState<AIGeneratedTask | null>(null)

  const filteredLogs = projet.tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase())
    const matchesDate = dateFilter
      ? new Date(task.created_at).toDateString() === new Date(dateFilter).toDateString()
      : true
    return matchesSearch && matchesDate
  })

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-2xl space-y-6 transition-all duration-300">
      <button
        onClick={onBack}
        className="flex items-center text-sm text-primary hover:underline transition-colors dark:text-white"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-1" /> Retour aux projets
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
          Tâches générées par IA - {projet.name}
        </h2>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher une tâche..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-purple-500 dark:text-white transition-all duration-300"
            />
          </div>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="date"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-[#b03ff3]"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 mt-6">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((task) => (
            <motion.div
              key={task.id}
              whileHover={{ scale: 1.01 }}
              className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg cursor-pointer hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-600"
              onClick={() => setSelectedLog(task)}
            >
              <div className="flex items-center gap-4">
                <div className="rounded-full overflow-hidden w-10 h-10 flex-shrink-0">
                  <img
                    src={task.assignee?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=AI"}
                    alt={task.assignee?.name || "IA"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{task.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>{new Date(task.created_at).toLocaleString("fr-FR")}</span>
                    <span>•</span>
                    <span>{task.assignee?.name || "Non assigné"}</span>
                    <span>•</span>
                    <span className="capitalize">{task.priority}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">Aucune tâche trouvée</p>
        )}
      </div>

      <AnimatePresence>
        {selectedLog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedLog(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="rounded-full overflow-hidden w-12 h-12">
                  <img
                    src={selectedLog.assignee?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=AI"}
                    alt={selectedLog.assignee?.name || "IA"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedLog.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(selectedLog.created_at).toLocaleString("fr-FR")} •{" "}
                    {selectedLog.assignee?.name || "Non assigné"}
                  </p>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    {selectedLog.status}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {selectedLog.priority}
                  </span>
                  {selectedLog.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedLog.description}</div>
              </div>
              <div className="mb-6 p-3 bg-gray-100 dark:bg-slate-700 rounded-lg">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Colonne: {selectedLog.column.title}
                </p>
              </div>
              <button
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-300"
                onClick={() => setSelectedLog(null)}
              >
                Fermer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Dashboard() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const { data, isLoading, error } = useGetAIGeneratedTasksQuery()

  // Group tasks by project
  const projectsWithTasks: Project[] = []

  if (data?.tasks) {
    // Create a map to group tasks by project
    const projectMap = new Map<number, Project>()

    data.tasks.forEach((task: AIGeneratedTask) => {
      if (task.project) {
        const projectId = task.project.id

        if (!projectMap.has(projectId)) {
          projectMap.set(projectId, {
            id: projectId,
            name: task.project.name,
            tasks: [],
          })
        }

        projectMap.get(projectId)?.tasks.push(task)
      }
    })

    // Convert map to array
    projectMap.forEach((project) => {
      projectsWithTasks.push(project)
    })
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 bg-gray-100 dark:bg-slate-900 transition-colors duration-300">
        <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-2xl">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
          <p className="text-gray-700 dark:text-gray-300">
            Une erreur s'est produite lors du chargement des données. Veuillez réessayer plus tard.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-slate-900 transition-colors duration-300">
      {!selectedProject ? (
        <ProjectList
          projects={projectsWithTasks}
          onSelect={(projet) => setSelectedProject(projet)}
          isLoading={isLoading}
        />
      ) : (
        <ProjectLogs projet={selectedProject} onBack={() => setSelectedProject(null)} />
      )}
    </div>
  )
}
