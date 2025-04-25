"use client"

import type { Task, Project } from "@/app/projects/types/dashboard"
import { translateStatus, formatDateFr } from "@/lib/utils"

interface PriorityTaskListProps {
  tasks: Task[]
  projects: Project[]
  onTaskClick: (taskId: number) => void
}

export default function PriorityTaskList({ tasks, projects, onTaskClick }: PriorityTaskListProps) {
  // Filter to only high priority tasks and sort by due date
  const priorityTasks = tasks
    .filter((task) => task.priority === "HIGH")
    .sort((a, b) => {
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })
    .slice(0, 5) // Limit to top 5

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <span className="h-3 w-3 rounded-full bg-red-500 mr-2"></span>
        Tâches prioritaires
      </h3>

      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {priorityTasks.length > 0 ? (
          priorityTasks.map((task) => {
            const project = projects.find((p) => p.id === task.projectId)
            return (
              <div
                key={task.id}
                className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                onClick={() => onTaskClick(task.id)}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{task.title}</h4>
                  <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    {translateStatus(task.priority)}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <p className="line-clamp-1">{task.description || "Aucune description"}</p>
                </div>
                <div className="mt-2 flex justify-between items-center text-xs">
                  <span>{project?.title || "Projet inconnu"}</span>
                  <span>{formatDateFr(task.dueDate)}</span>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Aucune tâche prioritaire</p>
          </div>
        )}
      </div>
    </div>
  )
}
