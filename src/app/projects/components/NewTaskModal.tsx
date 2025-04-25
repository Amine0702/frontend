"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import type { TeamMember, Attachment } from "../types/kanban"
import { X, Clock, Calendar, Brain, ClipboardEdit, Upload, Share2, Eye, Edit, UserCog, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useCreateTaskMutation, useGenerateTaskWithAIMutation } from "@/app/state/api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../../components/ui/dropdown-menu"

interface NewTaskModalProps {
  teamMembers: TeamMember[]
  isAIMode: boolean
  onClose: () => void
  projectId: string
  columns: any[]
  userRole: string
  currentUserId: string
}

const NewTaskModal: React.FC<NewTaskModalProps> = ({
  teamMembers,
  isAIMode,
  onClose,
  projectId,
  columns,
  userRole,
  currentUserId,
}) => {
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [aiDescription, setAIDescription] = useState("")
  const [aiLoading, setAILoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [attachments, setAttachments] = useState<Omit<Attachment, "id">[]>([])
  const [selectedPermission, setSelectedPermission] = useState<"read" | "edit" | "manage">("read")

  // État pour le mode manuel
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    status: "à_faire",
    priority: "moyenne",
    assignee_id: "",
    estimated_time: 60, // 1 heure par défaut
    actual_time: 0,
    timer_active: true, // Démarrer le timer automatiquement
    tags: [],
    due_date: "",
    column_id: columns.length > 0 ? columns[0].id : "",
    creator_id: currentUserId, // Ajouter l'ID du créateur
  })

  const [createTask, { isLoading: isCreatingTask }] = useCreateTaskMutation()
  const [generateTaskWithAI, { isLoading: isGeneratingWithAI }] = useGenerateTaskWithAIMutation()

  // Vérifier les permissions basées sur le rôle
  useEffect(() => {
    let error = null
    if (userRole === "observer") {
      error = "Vous n'avez pas la permission de créer des tâches"
      toast.error("Vous n'avez pas la permission de créer des tâches")
      onClose()
    }
    setPermissionError(error)
  }, [userRole, onClose])

  // Si l'utilisateur est un observateur, ne pas afficher le modal
  if (userRole === "observer") {
    return null
  }

  // Générer une tâche avec l'IA (OpenAI)
  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!aiDescription.trim()) return

    setAILoading(true)
    try {
      // Vérifier que la description a au moins 10 caractères (exigence du validateur backend)
      if (aiDescription.trim().length < 10) {
        toast.error("La description doit contenir au moins 10 caractères")
        return
      }

      // S'assurer que column_id est bien une chaîne de caractères
      const columnId = columns[0]?.id?.toString() || ""
      if (!columnId) {
        toast.error("Aucune colonne disponible pour ajouter la tâche")
        return
      }

      // Appel à l'API pour générer une tâche avec IA
      const result = await generateTaskWithAI({
        description: aiDescription,
        column_id: columnId,
        creator_id: currentUserId || "",
      }).unwrap()

      toast.success("Tâche générée avec succès!")
      onClose()
    } catch (error: any) {
      console.error("Erreur lors de la génération de la tâche:", error)

      // Afficher un message d'erreur plus détaillé
      if (error.data && error.data.errors) {
        // Afficher les erreurs de validation spécifiques
        const validationErrors = Object.values(error.data.errors).flat()
        validationErrors.forEach((err: any) => toast.error(err))
      } else if (error.data && error.data.message) {
        toast.error(`Erreur: ${error.data.message}`)
      } else {
        toast.error("Une erreur est survenue lors de la génération de la tâche")
      }
    } finally {
      setAILoading(false)
    }
  }

  // Ajouter une tâche manuellement
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskForm.title.trim() || !taskForm.column_id) return

    try {
      // Créer la tâche via l'API
      await createTask({
        ...taskForm,
        tags: taskForm.tags,
        creator_id: currentUserId, // Ajouter l'ID du créateur
      }).unwrap()

      toast.success("Nouvelle tâche créée avec succès!")
      onClose()
    } catch (error) {
      console.error("Erreur lors de la création de la tâche:", error)
      toast.error("Erreur lors de la création de la tâche")
    }
  }

  // Mettre à jour le formulaire de tâche
  const updateTaskForm = (field: keyof typeof taskForm, value: any) => {
    setTaskForm((prev) => ({ ...prev, [field]: value }))
  }

  // Gérer l'ajout de pièces jointes
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newAttachments = Array.from(files).map((file) => ({
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
      size: file.size,
    }))

    setAttachments((prev) => [...prev, ...newAttachments])
    toast.success(`${files.length} fichier(s) ajouté(s)`)

    // Réinitialiser l'input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Formater la taille du fichier
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " octets"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " Ko"
    return (bytes / (1024 * 1024)).toFixed(1) + " Mo"
  }

  // Supprimer une pièce jointe
  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
    toast.info("Pièce jointe supprimée")
  }

  // Partager la tâche
  const handleShare = () => {
    if (userRole !== "manager") {
      toast.error("Seuls les managers peuvent partager des tâches")
      return
    }

    toast.success(`Tâche partagée avec un niveau d'accès ${selectedPermission}`)
  }

  // Définir les valeurs d'estimation prédéfinies
  const timeEstimatePresets = [
    { label: "30min", value: 30 },
    { label: "1h", value: 60 },
    { label: "2h", value: 120 },
    { label: "4h", value: 240 },
    { label: "1 jour", value: 480 },
    { label: "2 jours", value: 960 },
  ]

  // Mettre le temps estimé avec une valeur prédéfinie
  const setEstimatedTimePreset = (minutes: number) => {
    updateTaskForm("estimated_time", minutes)
    toast.info(
      `Temps estimé défini à ${minutes >= 480 ? `${minutes / 480} jour(s)` : `${minutes >= 60 ? `${Math.floor(minutes / 60)}h${minutes % 60 > 0 ? ` ${minutes % 60}min` : ""}` : `${minutes}min`}`}`,
    )
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b bg-violet-50">
          <h2 className="text-lg font-semibold flex items-center text-violet-800">
            {isAIMode ? (
              <>
                <Brain size={20} className="text-violet-600 mr-2" />
                Créer une tâche avec IA
              </>
            ) : (
              <>
                <ClipboardEdit size={20} className="text-violet-600 mr-2" />
                Créer une nouvelle tâche
              </>
            )}
          </h2>

          <button onClick={onClose} className="p-2 rounded-full hover:bg-violet-100 text-violet-600" title="Fermer">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 max-h-[80vh] overflow-y-auto">
          {isAIMode ? (
            <form onSubmit={handleAISubmit}>
              <div className="mb-4">
                <label htmlFor="aiDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Décrivez la tâche en quelques mots
                </label>
                <textarea
                  id="aiDescription"
                  value={aiDescription}
                  onChange={(e) => setAIDescription(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  rows={4}
                  placeholder="Par exemple: Créer une page de contact responsive avec un formulaire et une carte interactive."
                  required
                />
              </div>

              <div className="bg-violet-50 border-l-4 border-violet-500 p-3 mb-4">
                <h3 className="flex items-center text-sm font-medium text-violet-800 mb-1">
                  <Brain size={16} className="mr-1" />
                  Comment fonctionne la génération par IA ?
                </h3>
                <p className="text-sm text-violet-700">
                  L'IA va analyser votre description et générer automatiquement une tâche structurée avec un titre, une
                  description détaillée, une priorité, une estimation de temps et des tags pertinents. Cette
                  fonctionnalité fonctionne même sans clé API.
                </p>
              </div>

              <div className="flex justify-end">
                <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md mr-2">
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-violet-500 rounded-md hover:bg-violet-600 flex items-center"
                  disabled={aiLoading || !aiDescription.trim()}
                >
                  {aiLoading ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Brain size={16} className="mr-2" />
                      Générer la tâche avec IA
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleManualSubmit}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Titre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={taskForm.title}
                  onChange={(e) => updateTaskForm("title", e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="column" className="block text-sm font-medium text-gray-700 mb-1">
                  Colonne <span className="text-red-500">*</span>
                </label>
                <select
                  id="column"
                  value={taskForm.column_id}
                  onChange={(e) => updateTaskForm("column_id", e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  {columns.map((column) => (
                    <option key={column.id} value={column.id}>
                      {column.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={taskForm.description}
                  onChange={(e) => updateTaskForm("description", e.target.value)}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-1">
                    Assigné à
                  </label>
                  <select
                    id="assignee"
                    value={taskForm.assignee_id || ""}
                    onChange={(e) => updateTaskForm("assignee_id", e.target.value || undefined)}
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
                    value={taskForm.priority}
                    onChange={(e) => updateTaskForm("priority", e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="basse">Basse</option>
                    <option value="moyenne">Moyenne</option>
                    <option value="haute">Haute</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Clock size={14} className="mr-1" />
                  Temps estimé
                </label>

                <div className="flex flex-col space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {timeEstimatePresets.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setEstimatedTimePreset(preset.value)}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                          taskForm.estimated_time === preset.value
                            ? "bg-violet-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center">
                    <input
                      type="number"
                      id="estimatedTime"
                      value={taskForm.estimated_time}
                      onChange={(e) => updateTaskForm("estimated_time", Number.parseInt(e.target.value) || 0)}
                      className="w-full p-2 border rounded-md"
                      min="0"
                    />
                    <span className="ml-2 text-sm text-gray-500">minutes</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Calendar size={14} className="mr-1" />
                  Date d'échéance
                </label>
                <input
                  type="date"
                  id="dueDate"
                  value={taskForm.due_date}
                  onChange={(e) => updateTaskForm("due_date", e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              {/* Pièces jointes */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="attachments" className="block text-sm font-medium text-gray-700">
                    Pièces jointes
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm flex items-center text-violet-600 hover:text-violet-700"
                  >
                    <Upload size={16} className="mr-1" />
                    Ajouter un fichier
                  </button>
                  <input
                    type="file"
                    id="attachments"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    multiple
                  />
                </div>

                {/* Liste des pièces jointes */}
                {attachments.length > 0 && (
                  <div className="space-y-2 mt-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                    {attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                        <div className="flex items-center">
                          <Upload size={14} className="text-gray-500 mr-2" />
                          <div>
                            <div className="text-sm font-medium truncate max-w-xs">{attachment.name}</div>
                            <div className="text-xs text-gray-500">{formatFileSize(attachment.size)}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (séparés par des virgules)
                </label>
                <input
                  type="text"
                  id="tags"
                  value={taskForm.tags.join(", ")}
                  onChange={(e) =>
                    updateTaskForm(
                      "tags",
                      e.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean),
                    )
                  }
                  className="w-full p-2 border rounded-md"
                  placeholder="design, urgent, documentation"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md">
                  Annuler
                </button>

                {userRole === "manager" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 flex items-center"
                      >
                        <Share2 size={16} className="mr-2" />
                        {selectedPermission === "read" && "Partager (Lecture)"}
                        {selectedPermission === "edit" && "Partager (Modification)"}
                        {selectedPermission === "manage" && "Partager (Manager)"}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem className="flex items-center" onClick={() => setSelectedPermission("read")}>
                        <Eye size={14} className="mr-2" /> Lecture seule
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center" onClick={() => setSelectedPermission("edit")}>
                        <Edit size={14} className="mr-2" /> Modification (utilisateur)
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center" onClick={() => setSelectedPermission("manage")}>
                        <UserCog size={14} className="mr-2" /> Manager
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="flex items-center text-blue-600" onClick={handleShare}>
                        <Share2 size={14} className="mr-2" /> Partager maintenant
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-violet-500 rounded-md hover:bg-violet-600"
                  disabled={!taskForm.title.trim() || isCreatingTask}
                >
                  {isCreatingTask ? (
                    <span className="flex items-center">
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Création...
                    </span>
                  ) : (
                    "Créer la tâche"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default NewTaskModal
