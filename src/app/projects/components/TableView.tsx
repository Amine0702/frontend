"use client"

import type React from "react"
import { useState } from "react"
import type { Project, Task } from "../types/kanban"
import { useKanbanStore } from "../store/kanbanStore"
import { Clock, Calendar, ArrowUp, ArrowDown, Search } from "lucide-react"
import { format, isAfter } from "date-fns"
import { fr } from "date-fns/locale"

interface TableViewProps {
  project: Project
  onTaskClick: (taskId: string) => void
}

type SortField = "title" | "priority" | "status" | "assignee" | "time" | "dueDate"
type SortDirection = "asc" | "desc"

const TableView: React.FC<TableViewProps> = ({ project, onTaskClick }) => {
  const { openTaskModal } = useKanbanStore()
  const [sortField, setSortField] = useState<SortField>("dueDate")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [searchTerm, setSearchTerm] = useState("")

  // Rassembler toutes les tâches dans un seul tableau
  const allTasks = project.columns.flatMap((col) => col.tasks.map((task) => ({ ...task, columnTitle: col.title })))

  // Filtrer les tâches en fonction du terme de recherche
  const filteredTasks = allTasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Trier les tâches
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0

    switch (sortField) {
      case "title":
        comparison = a.title.localeCompare(b.title)
        break
      case "priority":
        const priorityOrder = { urgente: 3, haute: 2, moyenne: 1, basse: 0 }
        comparison = (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0)
        break
      case "status":
        const statusOrder = { à_faire: 0, en_cours: 1, en_révision: 2, terminé: 3 }
        comparison = (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0)
        break
      case "assignee":
        const aName = a.assigneeId ? project.team.find((m) => m.id === a.assigneeId)?.name || "" : ""
        const bName = b.assigneeId ? project.team.find((m) => m.id === b.assigneeId)?.name || "" : ""
        comparison = aName.localeCompare(bName)
        break
      case "time":
        comparison = a.estimatedTime - b.estimatedTime
        break
      case "dueDate":
        if (a.dueDate && b.dueDate) {
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        } else if (a.dueDate) {
          comparison = -1
        } else if (b.dueDate) {
          comparison = 1
        }
        break
      default:
        break
    }

    return sortDirection === "asc" ? comparison : -comparison
  })

  // Changer le tri
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Format du temps (minutes -> heures/minutes)
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h${mins > 0 ? ` ${mins}m` : ""}`
  }

  // Obtenir l'icône de tri
  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return null

    return sortDirection === "asc" ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
  }

  // Obtenir la classe CSS en fonction de la priorité
  const getPriorityClass = (priority: Task["priority"]): string => {
    switch (priority) {
      case "basse":
        return "bg-blue-100 text-blue-700"
      case "moyenne":
        return "bg-green-100 text-green-700"
      case "haute":
        return "bg-orange-100 text-orange-700"
      case "urgente":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  // Obtenir la classe CSS en fonction de l'état
  const getStatusClass = (status: Task["status"]): string => {
    switch (status) {
      case "à_faire":
        return "bg-gray-100 text-gray-700"
      case "en_cours":
        return "bg-violet-100 text-violet-700"
      case "en_révision":
        return "bg-yellow-100 text-yellow-700"
      case "terminé":
        return "bg-green-100 text-green-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  // Formater l'état pour l'affichage
  const formatStatus = (status: Task["status"]): string => {
    switch (status) {
      case "à_faire":
        return "À faire"
      case "en_cours":
        return "En cours"
      case "en_révision":
        return "En révision"
      case "terminé":
        return "Terminé"
      default:
        return status
    }
  }

  return (
    <div className="p-4 h-[calc(100vh-180px)] overflow-y-auto">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex items-center">
            <div className="relative flex-grow max-w-lg">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher des tâches..."
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="ml-4 text-sm text-gray-600">
              {filteredTasks.length} tâche{filteredTasks.length !== 1 ? "s" : ""} trouvée
              {filteredTasks.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("title")}
              >
                <div className="flex items-center">Tâche {getSortIcon("title")}</div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center">État {getSortIcon("status")}</div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("priority")}
              >
                <div className="flex items-center">Priorité {getSortIcon("priority")}</div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("assignee")}
              >
                <div className="flex items-center">Assigné à {getSortIcon("assignee")}</div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("time")}
              >
                <div className="flex items-center">Temps {getSortIcon("time")}</div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("dueDate")}
              >
                <div className="flex items-center">Échéance {getSortIcon("dueDate")}</div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTasks.map((task) => {
              const assignee = task.assigneeId
                ? project.team.find((member) => member.id === task.assigneeId)
                : undefined

              return (
                <tr key={task.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onTaskClick(task.id)}>
                  <td className="px-6 py-4">
                    <div className="flex items-start">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{task.title}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">{task.description}</div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {task.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusClass(task.status)}`}>
                      {formatStatus(task.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityClass(task.priority)}`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {assignee ? (
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0">
                          <img
                            src={assignee.avatar || "/placeholder.svg"}
                            alt={assignee.name}
                            className="h-8 w-8 rounded-full"
                          />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{assignee.name}</div>
                          <div className="text-xs text-gray-500">{assignee.role}</div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Non assigné</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock size={14} className="mr-1" />
                      <span>
                        {formatTime(task.estimatedTime)}
                        {task.actualTime > 0 && ` / ${formatTime(task.actualTime)}`}
                      </span>
                      {task.timerActive && (
                        <span className="ml-2 relative flex h-2 w-2 inline-block">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {task.dueDate ? (
                      <div
                        className={`flex items-center text-sm ${
                          isAfter(new Date(), new Date(task.dueDate)) ? "text-red-500" : "text-gray-500"
                        }`}
                      >
                        <Calendar size={14} className="mr-1" />
                        {format(new Date(task.dueDate), "dd MMM yyyy", { locale: fr })}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Non définie</span>
                    )}
                  </td>
                </tr>
              )
            })}

            {filteredTasks.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <Search size={24} className="text-gray-400 mb-2" />
                    <p>Aucune tâche trouvée</p>
                    {searchTerm && (
                      <p className="text-sm mt-1">Essayez de modifier votre recherche ou d'effacer les filtres</p>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TableView
