"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Column, Task, TeamMember } from "../types/kanban"
import TaskCard from "./TaskCard"
import { Plus, Clock } from "lucide-react"
import TaskAICreationModal from "./TaskAICreationModal"
import { toast } from "sonner"

interface KanbanColumnProps {
  column: Column
  teamMembers: TeamMember[]
  onTaskMove: (taskId: string, sourceColumnId: string, targetColumnId: string) => void
  columnColor: string
  openTaskModal: (taskId: string) => void
  userRole: string
  currentUserId: string
  canUserModifyTask: (task: any) => boolean
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  teamMembers,
  onTaskMove,
  columnColor,
  openTaskModal,
  userRole,
  currentUserId,
  canUserModifyTask,
}) => {
  const [showTaskOptions, setShowTaskOptions] = useState(false)
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null)
  const [elapsedTimes, setElapsedTimes] = useState<Record<string, string>>({})
  const [timerTick, setTimerTick] = useState(0)

  // Mettre à jour les temps écoulés toutes les secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerTick((prev) => prev + 1)
      updateAllElapsedTimes()
    }, 1000)

    return () => clearInterval(interval)
  }, [column.tasks])

  // Mettre à jour tous les temps écoulés
  const updateAllElapsedTimes = () => {
    const newElapsedTimes: Record<string, string> = {}

    column.tasks.forEach((task) => {
      newElapsedTimes[task.id] = calculateElapsedTime(task)
    })

    setElapsedTimes(newElapsedTimes)
  }

  // Initialiser les temps écoulés au chargement
  useEffect(() => {
    updateAllElapsedTimes()
  }, [column.tasks])

  // Fonction pour gérer le démarrage du drag
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    const task = column.tasks.find((t) => t.id === taskId)

    if (!task) {
      e.preventDefault()
      return
    }

    if (!canUserModifyTask(task)) {
      e.preventDefault()
      toast.error("Vous n'avez pas la permission de déplacer cette tâche")
      return
    }

    e.dataTransfer.setData("taskId", taskId)
    e.dataTransfer.setData("sourceColId", column.id)
    e.currentTarget.classList.add("opacity-75", "scale-95")
  }

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("opacity-75", "scale-95")
    setDraggedOverIndex(null)
  }

  // Autoriser le drop
  const handleDragOver = (e: React.DragEvent, index?: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    if (typeof index === "number") {
      setDraggedOverIndex(index)
    }
  }

  const handleDragLeave = () => {
    setDraggedOverIndex(null)
  }

  // Gérer le drop d'une tâche
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData("taskId")
    const sourceColId = e.dataTransfer.getData("sourceColId")

    setDraggedOverIndex(null)

    // Vérifier que la tâche n'est pas déjà dans cette colonne
    if (sourceColId && sourceColId !== column.id && taskId) {
      onTaskMove(taskId, sourceColId, column.id)
    }
  }

  // Modifier la fonction calculateElapsedTime pour corriger le calcul du temps
  const calculateElapsedTime = (task: Task): string => {
    try {
      let totalSeconds = (task.actualTime || 0) * 60 // Convertir les minutes en secondes

      // Si le timer est actif, ajouter le temps écoulé depuis le démarrage
      if (task.timerActive && task.startedAt) {
        const now = new Date()
        const started = new Date(task.startedAt)

        // Vérifier si la date est valide
        if (!isNaN(started.getTime())) {
          const elapsedSeconds = Math.floor((now.getTime() - started.getTime()) / 1000)
          totalSeconds += elapsedSeconds
        }
      }

      // Formater le temps en heures:minutes:secondes
      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60

      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    } catch (error) {
      console.error("Erreur lors du calcul du temps écoulé:", error)
      return "00:00:00"
    }
  }

  // Gérer le clic sur le bouton Plus
  const handleAddTaskClick = () => {
    if (userRole === "observer") {
      toast.error("Les observateurs ne peuvent pas créer de tâches")
      return
    }

    setShowTaskOptions(true)
  }

  // Fermer le modal des options
  const closeTaskOptions = () => {
    setShowTaskOptions(false)
  }

  // Gérer le partage d'une tâche
  const handleShareTask = (taskId: string) => {
    if (userRole !== "manager") {
      toast.error("Seuls les managers peuvent partager des tâches")
      return
    }

    toast.success("Tâche partagée avec l'équipe")
  }

  // Obtenir le style de la bordure selon la couleur
  const getColumnBorderStyle = () => {
    return `border-l-4 border-l-${columnColor}-400`
  }

  // Obtenir le style du header selon la couleur
  const getColumnHeaderStyle = () => {
    return `bg-${columnColor}-50 dark:bg-${columnColor}-900/20`
  }

  return (
    <div
      className={`kanban-column flex flex-col h-full relative dark:bg-gray-800 dark:border-gray-700 ${getColumnBorderStyle()}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className={`kanban-column-header flex items-center justify-between mb-4 dark:bg-gray-700 ${getColumnHeaderStyle()}`}
      >
        <h2 className="font-semibold text-gray-800 text-lg dark:text-gray-200">
          {column.title} <span className="text-sm text-gray-500 ml-1 dark:text-gray-400">({column.tasks.length})</span>
        </h2>

        {(userRole === "manager" || userRole === "member") && (
          <button
            onClick={handleAddTaskClick}
            className="kanban-column-add-btn p-1.5 rounded-full bg-violet-200 hover:bg-violet-300 text-violet-700 transition-colors dark:bg-violet-800 dark:text-violet-200 dark:hover:bg-violet-700"
            title="Ajouter une tâche"
          >
            <Plus size={20} />
          </button>
        )}
      </div>

      <div className="kanban-column-body space-y-3 overflow-y-auto flex-grow pb-4 px-2 scrollbar-none dark:bg-gray-800/90">
        {column.tasks.map((task, index) => {
          const assignee = task.assigneeId ? teamMembers.find((member) => member.id === task.assigneeId) : undefined
          const canDrag = canUserModifyTask(task)

          return (
            <div
              key={task.id}
              draggable={canDrag}
              onDragStart={(e) => handleDragStart(e, task.id)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, index)}
              className={`relative task-drag-container ${draggedOverIndex === index ? "border-2 border-violet-400 transform scale-105" : ""}`}
            >
              <TaskCard
                task={task}
                assignee={assignee}
                onShare={() => handleShareTask(task.id)}
                onTaskClick={() => openTaskModal(task.id)}
                userRole={userRole}
                currentUserId={currentUserId}
                canUserModifyTask={canUserModifyTask}
              />

              {/* Affichage du timer avec cercle clignotant et bouton de contrôle */}
              <div className="task-timer absolute top-0 right-0 bg-gradient-to-r from-violet-500 to-violet-600 text-white text-xs px-2 py-1 rounded-bl-md rounded-tr-md flex items-center shadow-sm dark:from-violet-700 dark:to-violet-800">
                {task.timerActive && <span className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></span>}
                <Clock size={12} className="mr-1" />
                <span className="font-mono">{elapsedTimes[task.id] || calculateElapsedTime(task)}</span>
              </div>
            </div>
          )
        })}

        {column.tasks.length === 0 && (
          <div className="kanban-column-empty p-6 text-center text-sm text-gray-400 italic border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500 dark:hover:bg-gray-700/50">
            Déposez une tâche ici
          </div>
        )}
      </div>

      {/* Modal pour choisir le type de création de tâche */}
      {showTaskOptions && <TaskAICreationModal onClose={closeTaskOptions} onSelectOption={() => {}} />}
    </div>
  )
}

export default KanbanColumn
