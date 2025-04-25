"use client"

import type React from "react"
import { useState } from "react"
import type { Project } from "../types/kanban"
import KanbanColumn from "./KanbanColumn"
import { Plus } from "lucide-react"
import { toast } from "sonner"

interface KanbanViewProps {
  project: Project
  onMoveTask: (taskId: string, sourceColId: string, targetColId: string) => void
  onAddColumn: (columnData: any) => void
  onReorderColumns: (columns: any[]) => void
  onTaskClick: (taskId: string) => void
  userRole: string
  currentUserId: string
  canUserModifyTask: (task: any) => boolean
}

// Couleurs pastel pour les colonnes
const columnColors = ["violet", "yellow", "orange", "pink", "green", "indigo", "blue"]

const KanbanView: React.FC<KanbanViewProps> = ({
  project,
  onMoveTask,
  onAddColumn,
  onReorderColumns,
  onTaskClick,
  userRole,
  currentUserId,
  canUserModifyTask,
}) => {
  const [showNewColumnForm, setShowNewColumnForm] = useState(false)
  const [newColumnTitle, setNewColumnTitle] = useState("")
  const [draggedOverColumnId, setDraggedOverColumnId] = useState<string | null>(null)

  const handleAddColumn = () => {
    if (userRole !== "manager") {
      toast.error("Seuls les managers peuvent ajouter des colonnes")
      return
    }

    if (newColumnTitle.trim()) {
      onAddColumn({
        title: newColumnTitle,
        order: project.columns.length,
      })
      setNewColumnTitle("")
      setShowNewColumnForm(false)
    }
  }

  // Gestion du drag & drop des colonnes
  const handleDragStart = (e: React.DragEvent, columnId: string) => {
    if (userRole !== "manager") {
      e.preventDefault()
      toast.error("Seuls les managers peuvent réorganiser les colonnes")
      return
    }

    e.dataTransfer.setData("columnId", columnId)
    e.currentTarget.classList.add("opacity-50")
  }

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("opacity-50")
    setDraggedOverColumnId(null)
  }

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDraggedOverColumnId(columnId)
  }

  const handleDragLeave = () => {
    setDraggedOverColumnId(null)
  }

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault()
    const draggedColumnId = e.dataTransfer.getData("columnId")
    const draggedTaskId = e.dataTransfer.getData("taskId")
    const sourceColumnId = e.dataTransfer.getData("sourceColId")

    setDraggedOverColumnId(null)

    // Si c'est une colonne qui est déplacée
    if (draggedColumnId && !draggedTaskId && draggedColumnId !== targetColumnId) {
      if (userRole !== "manager") {
        toast.error("Seuls les managers peuvent réorganiser les colonnes")
        return
      }

      // Réorganiser les colonnes
      const columnsCopy = [...project.columns]
      const draggedColumnIndex = columnsCopy.findIndex((col) => col.id === draggedColumnId)
      const targetColumnIndex = columnsCopy.findIndex((col) => col.id === targetColumnId)

      if (draggedColumnIndex !== -1 && targetColumnIndex !== -1) {
        const [removedColumn] = columnsCopy.splice(draggedColumnIndex, 1)
        columnsCopy.splice(targetColumnIndex, 0, removedColumn)

        // Mettre à jour l'ordre des colonnes dans le backend
        onReorderColumns(columnsCopy)
      }
    }
    // Si c'est une tâche qui est déplacée entre colonnes
    else if (draggedTaskId && sourceColumnId && sourceColumnId !== targetColumnId) {
      // Trouver la tâche pour vérifier si l'utilisateur a le droit de la déplacer
      const task = project.columns
        .find((col) => col.id === sourceColumnId)
        ?.tasks.find((task) => task.id === draggedTaskId)

      if (!task) {
        toast.error("Tâche introuvable")
        return
      }

      if (!canUserModifyTask(task)) {
        toast.error("Vous n'avez pas la permission de déplacer cette tâche")
        return
      }

      onMoveTask(draggedTaskId, sourceColumnId, targetColumnId)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      <div className="flex overflow-x-auto p-4 space-x-4 h-full pb-4 relative scrollbar-none">
        {project.columns.map((column, index) => (
          <div
            key={column.id}
            className={`flex-shrink-0 w-80 ${draggedOverColumnId === column.id ? "scale-105 shadow-lg ring-2 ring-violet-400" : ""}`}
            draggable={userRole === "manager"}
            onDragStart={(e) => handleDragStart(e, column.id)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <KanbanColumn
              column={column}
              teamMembers={project.team}
              onTaskMove={onMoveTask}
              columnColor={columnColors[index % columnColors.length]}
              openTaskModal={onTaskClick}
              userRole={userRole}
              currentUserId={currentUserId}
              canUserModifyTask={canUserModifyTask}
            />
          </div>
        ))}

        {/* Bouton "Ajouter une colonne" à droite */}
        {userRole === "manager" && (
          <div className="flex-shrink-0 w-72">
            {showNewColumnForm ? (
              <div className="w-full bg-gray-50 rounded-lg p-4 shadow-md border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex flex-col space-y-3">
                  <input
                    type="text"
                    placeholder="Titre de la colonne"
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowNewColumnForm(false)}
                      className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 text-sm font-medium transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleAddColumn}
                      className="flex-1 py-2 px-3 bg-violet-500 hover:bg-violet-600 rounded-md text-white text-sm font-medium transition-colors dark:bg-violet-600 dark:hover:bg-violet-700"
                      disabled={!newColumnTitle.trim()}
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowNewColumnForm(true)}
                className="flex items-center justify-center w-64 h-12 text-sm font-medium text-violet-600 hover:text-violet-800 bg-violet-100 hover:bg-violet-200 px-4 py-2 rounded-md shadow-sm transition-all transform hover:scale-105 dark:bg-violet-900/30 dark:text-violet-300 dark:hover:bg-violet-800/40"
              >
                <Plus size={18} className="mr-2" />
                Ajouter une colonne
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default KanbanView
