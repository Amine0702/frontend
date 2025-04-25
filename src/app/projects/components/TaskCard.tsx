"use client"

import type React from "react"
import type { Task, TeamMember } from "../types/kanban"
import { AlertCircle, Calendar, CheckCircle, Clock, Share2 } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

interface TaskCardProps {
  task: Task
  assignee?: TeamMember
  onShare: () => void
  onTaskClick: () => void
  userRole: string
  currentUserId: string
  canUserModifyTask: (task: any) => boolean
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  assignee,
  onShare,
  onTaskClick,
  userRole,
  currentUserId,
  canUserModifyTask,
}) => {
  // Format pour l'affichage de la date
  const formatDate = (date?: Date) => {
    if (!date) return ""
    return format(new Date(date), "dd/MM/yyyy")
  }

  // Formatter le temps pour l'affichage
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h${mins > 0 ? ` ${mins}m` : ""}`
  }

  // Calculer le temps écoulé pour les tâches actives
  const getElapsedTime = () => {
    if (!task.timerActive || !task.startedAt) return formatTime(task.actualTime)

    const now = new Date()
    const started = new Date(task.startedAt)
    const elapsedMinutes = task.actualTime + Math.floor((now.getTime() - started.getTime()) / 60000)
    return formatTime(elapsedMinutes)
  }

  // Déterminer la couleur et l'icône en fonction de la priorité
  const getPriorityBadge = () => {
    switch (task.priority) {
      case "urgente":
        return (
          <span className="flex items-center text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
            <AlertCircle size={12} className="mr-1" />
            Urgent
          </span>
        )
      case "haute":
        return (
          <span className="flex items-center text-xs font-medium px-2 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
            <AlertCircle size={12} className="mr-1" />
            Haute
          </span>
        )
      case "moyenne":
        return (
          <span className="flex items-center text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            <AlertCircle size={12} className="mr-1" />
            Moyenne
          </span>
        )
      case "basse":
        return (
          <span className="flex items-center text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
            <CheckCircle size={12} className="mr-1" />
            Basse
          </span>
        )
      default:
        return null
    }
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation() // Empêcher le déclenchement du onClick du parent

    if (userRole !== "manager") {
      toast.error("Seuls les managers peuvent partager des tâches")
      return
    }

    onShare()
  }

  const handleClick = () => {
    onTaskClick()
  }

  return (
    <div
      className={`task-card group dark:bg-gray-800 dark:border-gray-700 dark:hover:border-l-violet-500 ${
        canUserModifyTask(task) ? "cursor-grab" : "cursor-pointer"
      }`}
      onClick={handleClick}
    >
      <h3 className="text-base font-medium mb-2 text-gray-800 pr-16 dark:text-gray-200">{task.title}</h3>

      {/* Description tronquée */}
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 dark:text-gray-400">{task.description}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-2">
        {getPriorityBadge()}

        {task.dueDate && (
          <span className="flex items-center text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
            <Calendar size={12} className="mr-1" />
            {formatDate(task.dueDate)}
          </span>
        )}

        <span className="flex items-center text-xs font-medium px-2 py-1 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
          <Clock size={12} className="mr-1" />
          {formatTime(task.estimatedTime)}
        </span>
      </div>

      {/* Tags de la tâche */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.map((tag, index) => (
            <span key={index} className="tag dark:bg-violet-900/30 dark:text-violet-300">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer avec l'info de l'assigné et les actions */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
        {/* Assigné */}
        {assignee ? (
          <div className="flex items-center">
            <div className="avatar-sm mr-2">
              <img
                src={assignee.avatar || "/placeholder.svg"}
                alt={assignee.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs text-gray-600 truncate max-w-[100px] dark:text-gray-400">{assignee.name}</span>
          </div>
        ) : (
          <span className="text-xs text-gray-400 italic dark:text-gray-500">Non assigné</span>
        )}

        {/* Actions */}
        {userRole === "manager" && (
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleShare}
              className="p-1 text-gray-500 hover:text-violet-600 hover:bg-violet-50 rounded-full dark:text-gray-400 dark:hover:text-violet-400 dark:hover:bg-violet-900/30"
              title="Partager"
            >
              <Share2 size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TaskCard
