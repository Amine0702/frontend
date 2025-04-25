"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import type { Task, TeamMember } from "../types/kanban"
import {
  X,
  Clock,
  Calendar,
  Tag,
  Paperclip,
  MessageSquare,
  Share2,
  Trash2,
  Edit,
  Save,
  Upload,
  Play,
  Pause,
  Loader2,
} from "lucide-react"
import { format, type Locale } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "sonner"

// Fonction de formatage sécurisée
const safeFormat = (
  dateInput: string | Date | undefined | null,
  formatStr: string,
  options?: { locale?: Locale },
): string => {
  try {
    const date = dateInput ? new Date(dateInput) : new Date()
    if (isNaN(date.getTime())) throw new Error("Date invalide")
    return format(date, formatStr, options)
  } catch (error) {
    console.error("Erreur de formatage de date:", error)
    return "Date invalide"
  }
}

interface TaskModalProps {
  task: Task
  teamMembers: TeamMember[]
  onClose: () => void
  onUpdateTask: (taskId: string, updates: any) => Promise<void>
  onDeleteTask: (taskId: string) => Promise<void>
  onToggleTimer: (taskId: string) => Promise<void>
  onAddComment: (taskId: string, comment: any) => Promise<void>
  onAddAttachment: (taskId: string, attachment: any) => Promise<void>
  userRole: string
  currentUserId: string
  canUserModifyTask: (task: any) => boolean
}

const TaskModal: React.FC<TaskModalProps> = ({
  task,
  teamMembers,
  onClose,
  onUpdateTask,
  onDeleteTask,
  onToggleTimer,
  onAddComment,
  onAddAttachment,
  userRole,
  currentUserId,
  canUserModifyTask,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTask, setEditedTask] = useState(task)
  const [newComment, setNewComment] = useState("")
  const [elapsedTime, setElapsedTime] = useState("0h")
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [timerSeconds, setTimerSeconds] = useState(0)

  // Déterminer les permissions en fonction du rôle et de la propriété de la tâche
  const canEdit = canUserModifyTask(task)
  const canDelete = canUserModifyTask(task)
  const canAddComment = canUserModifyTask(task)
  const canAddAttachment = canUserModifyTask(task)
  const canToggleTimer = canUserModifyTask(task)

  // Mettre à jour le temps écoulé en temps réel
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    // Fonction pour calculer et mettre à jour le temps écoulé
    const updateElapsedTime = () => {
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

        const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

        setElapsedTime(formattedTime)
      } catch (error) {
        console.error("Erreur lors du calcul du temps écoulé:", error)
        setElapsedTime("00:00:00")
      }
    }

    // Mettre à jour immédiatement
    updateElapsedTime()

    // Si le timer est actif, mettre à jour toutes les secondes
    if (task.timerActive) {
      interval = setInterval(() => {
        updateElapsedTime()
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [task.timerActive, task.startedAt, task.actualTime, timerSeconds])

  // Obtenir l'assigné de la tâche
  const assignee = task.assigneeId ? teamMembers.find((member) => member.id === task.assigneeId) : undefined

  // Gérer le timer
  const handleToggleTimer = async () => {
    if (!canToggleTimer) {
      toast.error("Vous n'avez pas la permission de modifier le chronomètre de cette tâche")
      return
    }

    try {
      setIsLoading(true)

      // Appeler l'API pour basculer le timer
      await onToggleTimer(task.id)

      // Afficher un toast pour indiquer le succès
      if (!task.timerActive) {
        toast.success("Chronomètre démarré")
      } else {
        toast.info("Chronomètre mis en pause")
      }
    } catch (error) {
      console.error("Error toggling timer:", error)
      toast.error("Erreur lors de la modification du chronomètre")
    } finally {
      setIsLoading(false)
    }
  }

  // Couleur en fonction de la priorité
  const getPriorityColor = () => {
    switch (task.priority) {
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

  // Gérer la soumission des modifications
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canEdit) {
      toast.error("Vous n'avez pas la permission de modifier cette tâche")
      return
    }

    setIsLoading(true)

    try {
      await onUpdateTask(task.id, editedTask)
      setIsEditing(false)
      toast.success("Tâche mise à jour avec succès")
    } catch (error) {
      console.error("Error updating task:", error)
      toast.error("Erreur lors de la mise à jour de la tâche")
    } finally {
      setIsLoading(false)
    }
  }

  // Gérer l'ajout d'un commentaire
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canAddComment) {
      toast.error("Vous n'avez pas la permission d'ajouter des commentaires à cette tâche")
      return
    }

    if (!newComment.trim()) return

    setIsLoading(true)

    try {
      // Trouver le membre d'équipe correspondant à l'utilisateur actuel
      const currentTeamMember = teamMembers.find((member) => member.clerk_user_id === currentUserId)
      const authorId = currentTeamMember ? currentTeamMember.id : teamMembers[0].id

      const comment = {
        authorId: authorId,
        text: newComment,
      }

      await onAddComment(task.id, comment)
      setNewComment("") // Réinitialiser le champ de commentaire
      toast.success("Commentaire ajouté avec succès")
    } catch (error) {
      console.error("Error adding comment:", error)
      toast.error("Erreur lors de l'ajout du commentaire")
    } finally {
      setIsLoading(false)
    }
  }

  // Gérer le téléchargement de fichier
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canAddAttachment) {
      toast.error("Vous n'avez pas la permission d'ajouter des pièces jointes à cette tâche")
      return
    }

    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)

    try {
      // Simuler un téléchargement
      const attachment = {
        name: file.name,
        type: file.type,
        file: file,
        size: file.size,
      }

      await onAddAttachment(task.id, attachment)
      toast.success("Pièce jointe ajoutée avec succès")

      // Réinitialiser l'input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      toast.error("Erreur lors de l'ajout de la pièce jointe")
    } finally {
      setIsLoading(false)
    }
  }

  // Formater la taille du fichier
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " octets"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " Ko"
    return (bytes / (1024 * 1024)).toFixed(1) + " Mo"
  }

  // Partager la tâche
  const handleShare = () => {
    if (userRole !== "manager") {
      toast.error("Seuls les managers peuvent partager des tâches")
      return
    }

    toast.success("Tâche partagée avec l'équipe")
  }

  // Supprimer la tâche
  const handleDelete = async () => {
    if (!canDelete) {
      toast.error("Vous n'avez pas la permission de supprimer cette tâche")
      return
    }

    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
      setIsLoading(true)

      try {
        await onDeleteTask(task.id)
        toast.success("Tâche supprimée avec succès")
        onClose()
      } catch (error) {
        console.error("Error deleting task:", error)
        toast.error("Erreur lors de la suppression de la tâche")
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Trouver l'auteur d'un commentaire de manière sécurisée
  const findCommentAuthor = (comment: any) => {
    // Si le commentaire a déjà un auteur chargé depuis le backend
    if (comment.author && comment.author.name) {
      return comment.author
    }

    // Sinon, essayer de trouver l'auteur dans la liste des membres d'équipe
    if (comment.authorId) {
      // Convertir les IDs en string pour la comparaison
      const authorIdStr = String(comment.authorId)
      const author = teamMembers.find((member) => String(member.id) === authorIdStr)
      if (author) return author
    }

    // Si aucun auteur n'est trouvé
    return null
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b bg-violet-50">
          <div className="flex items-center space-x-2">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor()}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
            {task.dueDate && (
              <span className="text-xs flex items-center text-gray-500">
                <Calendar size={14} className="mr-1" />
                {safeFormat(task.dueDate, "dd MMMM yyyy", { locale: fr })}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Compteur de temps avec bouton toggle */}
            <div className="bg-violet-100 text-violet-600 px-3 py-1.5 rounded-md text-sm flex items-center">
              <Clock size={16} className="mr-2" />
              <span className="font-mono">{elapsedTime}</span>
              {canToggleTimer && (
                <button
                  onClick={handleToggleTimer}
                  disabled={isLoading}
                  className="ml-3 p-1.5 rounded-full hover:bg-violet-200 disabled:opacity-50 transition-colors"
                  title={task.timerActive ? "Arrêter" : "Démarrer"}
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : task.timerActive ? (
                    <Pause size={16} />
                  ) : (
                    <Play size={16} />
                  )}
                </button>
              )}
            </div>

            {userRole === "manager" && (
              <button
                onClick={handleShare}
                className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                title="Partager"
              >
                <Share2 size={18} />
              </button>
            )}

            {!isEditing ? (
              <>
                {canEdit && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 rounded-md bg-violet-500 text-white hover:bg-violet-600 transition-colors flex items-center"
                    title="Modifier"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        <Edit size={18} className="mr-1" /> Modifier
                      </>
                    )}
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={handleDelete}
                    className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                    title="Supprimer"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={handleSubmit}
                className="p-2 rounded-full bg-violet-100 text-violet-600 hover:bg-violet-200"
                title="Enregistrer"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              </button>
            )}

            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100" title="Fermer">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Titre
                </label>
                <input
                  type="text"
                  id="title"
                  value={editedTask.title}
                  onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={editedTask.description}
                  onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-1">
                    Assigné à
                  </label>
                  <select
                    id="assignee"
                    value={editedTask.assigneeId || ""}
                    onChange={(e) => setEditedTask({ ...editedTask, assigneeId: e.target.value || undefined })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Non assigné</option>
                    {teamMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                    Priorité
                  </label>
                  <select
                    id="priority"
                    value={editedTask.priority}
                    onChange={(e) =>
                      setEditedTask({
                        ...editedTask,
                        priority: e.target.value as Task["priority"],
                      })
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="basse">Basse</option>
                    <option value="moyenne">Moyenne</option>
                    <option value="haute">Haute</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="estimatedTime" className="block text-sm font-medium text-gray-700 mb-1">
                    Temps estimé (minutes)
                  </label>
                  <input
                    type="number"
                    id="estimatedTime"
                    value={editedTask.estimatedTime}
                    onChange={(e) =>
                      setEditedTask({
                        ...editedTask,
                        estimatedTime: Number.parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2 border rounded-md"
                    min="0"
                  />
                </div>

                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Date d'échéance
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    value={editedTask.dueDate ? format(new Date(editedTask.dueDate), "yyyy-MM-dd") : ""}
                    onChange={(e) =>
                      setEditedTask({
                        ...editedTask,
                        dueDate: e.target.value ? new Date(e.target.value) : undefined,
                      })
                    }
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (séparés par des virgules)
                </label>
                <input
                  type="text"
                  id="tags"
                  value={editedTask.tags.join(", ")}
                  onChange={(e) =>
                    setEditedTask({
                      ...editedTask,
                      tags: e.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md mr-2"
                  disabled={isLoading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-violet-500 rounded-md hover:bg-violet-600 flex items-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    "Enregistrer"
                  )}
                </button>
              </div>
            </form>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-4">{task.title}</h2>

              <div className="mb-6">
                <p className="text-gray-700 whitespace-pre-line">{task.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <Clock size={18} className="text-violet-500 mr-2" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Temps</div>
                    <div className="text-sm text-gray-600">Temps écoulé: {elapsedTime}</div>
                  </div>
                </div>

                {assignee && (
                  <div className="flex items-center">
                    <div className="h-8 w-8 mr-2">
                      <img
                        src={assignee.avatar || "/placeholder.svg"}
                        alt={assignee.name}
                        className="rounded-full h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">Assigné à</div>
                      <div className="text-sm text-gray-600">{assignee.name}</div>
                    </div>
                  </div>
                )}

                {task.dueDate && (
                  <div className="flex items-center">
                    <Calendar size={18} className="text-violet-500 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-700">Échéance</div>
                      <div className="text-sm text-gray-600">
                        {safeFormat(task.dueDate, "dd MMMM yyyy", { locale: fr })}
                      </div>
                    </div>
                  </div>
                )}

                {task.tags.length > 0 && (
                  <div className="flex items-start">
                    <Tag size={18} className="text-violet-500 mr-2 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-700">Tags</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {task.tags.map((tag, index) => (
                          <span key={index} className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium flex items-center">
                      <Paperclip size={18} className="text-violet-500 mr-2" />
                      Pièces jointes
                    </h3>
                    {canAddAttachment && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-sm flex items-center px-3 py-1.5 bg-violet-100 text-violet-700 rounded-md hover:bg-violet-200 transition-colors dark:bg-violet-900/30 dark:text-violet-300 dark:hover:bg-violet-800/40"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 size={16} className="mr-1 animate-spin" />
                        ) : (
                          <Upload size={16} className="mr-1" />
                        )}
                        Ajouter un fichier
                      </button>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                  </div>

                  {task.attachments.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                      {task.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center p-3 bg-gray-50 rounded-md dark:bg-gray-800"
                        >
                          <div className="mr-2 text-gray-500">
                            <Paperclip size={16} />
                          </div>
                          <div className="flex-grow">
                            <div className="text-sm font-medium dark:text-white">{attachment.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {formatFileSize(attachment.size)}
                            </div>
                          </div>
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 bg-violet-100 text-violet-700 rounded-md hover:bg-violet-200 text-sm transition-colors dark:bg-violet-900/30 dark:text-violet-300 dark:hover:bg-violet-800/40"
                          >
                            Télécharger
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic dark:text-gray-400 p-3 bg-gray-50 rounded-md dark:bg-gray-800">
                      Aucune pièce jointe. Ajoutez des fichiers pour partager des ressources.
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-medium flex items-center mb-3">
                    <MessageSquare size={18} className="text-violet-500 mr-2" />
                    Commentaires ({task.comments.length})
                  </h3>

                  {canAddComment && (
                    <form onSubmit={handleAddComment} className="mb-4">
                      <div className="flex">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Ajouter un commentaire..."
                          className="flex-grow p-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          disabled={isLoading}
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-violet-500 text-white rounded-r-md hover:bg-violet-600 focus:outline-none flex items-center transition-colors"
                          disabled={!newComment.trim() || isLoading}
                        >
                          {isLoading ? <Loader2 size={16} className="mr-1 animate-spin" /> : null}
                          Envoyer
                        </button>
                      </div>
                    </form>
                  )}

                  {task.comments.length > 0 ? (
                    <div className="space-y-4 max-h-60 overflow-y-auto p-2 border rounded-md">
                      {task.comments.map((comment) => {
                        const author = findCommentAuthor(comment)

                        return (
                          <div key={comment.id} className="flex p-3 bg-gray-50 rounded-md dark:bg-gray-800">
                            {author ? (
                              <div className="h-10 w-10 mr-3 flex-shrink-0">
                                <img
                                  src={author.avatar || "/placeholder.svg"}
                                  alt={author.name}
                                  className="rounded-full h-full w-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-10 w-10 mr-3 flex-shrink-0 bg-gray-300 rounded-full flex items-center justify-center">
                                <span className="text-gray-600">?</span>
                              </div>
                            )}
                            <div className="flex-grow">
                              <div className="flex items-center mb-1">
                                <span className="font-medium text-sm mr-2">
                                  {author ? author.name : "Utilisateur inconnu"}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {safeFormat(comment.createdAt, "dd MMM yyyy à HH:mm", { locale: fr })}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300">{comment.text}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic dark:text-gray-400 p-3 bg-gray-50 rounded-md dark:bg-gray-800">
                      Aucun commentaire. Soyez le premier à commenter !
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default TaskModal

function updateElapsedTime() {
  throw new Error("Function not implemented.")
}
