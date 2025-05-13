"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import type { TeamMember, Attachment } from "../types/kanban";
import {
  X,
  Clock,
  Calendar,
  Brain,
  ClipboardEdit,
  Upload,
  Share2,
  Eye,
  Edit,
  UserCog,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  useCreateTaskMutation,
  useGenerateTaskWithAIMutation,
} from "@/app/state/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../../components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown } from "lucide-react";

interface NewTaskModalProps {
  teamMembers: TeamMember[];
  isAIMode: boolean;
  onClose: () => void;
  projectId: string;
  columns: any[];
  userRole: string;
  currentUserId: string;
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
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [aiDescription, setAIDescription] = useState("");
  const [aiLoading, setAILoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<Omit<Attachment, "id">[]>([]);
  const [selectedPermission, setSelectedPermission] = useState<
    "read" | "edit" | "manage"
  >("read");
  // Ajouter un état pour les erreurs de validation après la déclaration des autres états
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

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
  });

  const [createTask, { isLoading: isCreatingTask }] = useCreateTaskMutation();
  const [generateTaskWithAI, { isLoading: isGeneratingWithAI }] =
    useGenerateTaskWithAIMutation();

  // Vérifier les permissions basées sur le rôle
  useEffect(() => {
    let error = null;
    if (userRole === "observer") {
      error = "Vous n'avez pas la permission de créer des tâches";
      toast.error("Vous n'avez pas la permission de créer des tâches");
      onClose();
    }
    setPermissionError(error);
  }, [userRole, onClose]);

  // Si l'utilisateur est un observateur, ne pas afficher le modal
  if (userRole === "observer") {
    return null;
  }

  // Générer une tâche avec l'IA (OpenAI)
  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiDescription.trim()) return;

    setAILoading(true);
    try {
      // Vérifier que la description a au moins 10 caractères (exigence du validateur backend)
      if (aiDescription.trim().length < 10) {
        toast.error("La description doit contenir au moins 10 caractères");
        return;
      }

      // S'assurer que column_id est bien une chaîne de caractères
      const columnId = columns[0]?.id?.toString() || "";
      if (!columnId) {
        toast.error("Aucune colonne disponible pour ajouter la tâche");
        return;
      }

      // Appel à l'API pour générer une tâche avec IA
      const result = await generateTaskWithAI({
        description: aiDescription,
        column_id: columnId,
        creator_id: currentUserId || "",
      }).unwrap();

      toast.success("Tâche générée avec succès!");
      onClose();
    } catch (error: any) {
      console.error("Erreur lors de la génération de la tâche:", error);

      // Afficher un message d'erreur plus détaillé
      if (error.data && error.data.errors) {
        // Afficher les erreurs de validation spécifiques
        const validationErrors = Object.values(error.data.errors).flat();
        validationErrors.forEach((err: any) => toast.error(err));
      } else if (error.data && error.data.message) {
        toast.error(`Erreur: ${error.data.message}`);
      } else {
        toast.error(
          "Une erreur est survenue lors de la génération de la tâche",
        );
      }
    } finally {
      setAILoading(false);
    }
  };

  // Ajouter une tâche manuellement
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Valider tous les champs obligatoires
    const errors: Record<string, string> = {};

    if (!taskForm.title.trim()) {
      errors.title = "Le titre est obligatoire";
    }

    if (!taskForm.column_id) {
      errors.column_id = "La colonne est obligatoire";
    }

    if (!taskForm.description.trim()) {
      errors.description = "La description est obligatoire";
    }

    if (!taskForm.priority) {
      errors.priority = "La priorité est obligatoire";
    }

    if (!taskForm.assignee_id) {
      errors.assignee_id = "L'assignation est obligatoire";
    }

    if (!taskForm.due_date) {
      errors.due_date = "La date d'échéance est obligatoire";
    }

    if (taskForm.tags.length === 0) {
      errors.tags = "Au moins un tag est obligatoire";
    }

    // Si des erreurs sont trouvées, les afficher et arrêter la soumission
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Réinitialiser les erreurs
    setValidationErrors({});

    try {
      // Créer la tâche via l'API
      await createTask({
        ...taskForm,
        tags: taskForm.tags,
        creator_id: currentUserId, // Ajouter l'ID du créateur
      }).unwrap();

      toast.success("Nouvelle tâche créée avec succès!");
      onClose();
    } catch (error) {
      console.error("Erreur lors de la création de la tâche:", error);
      toast.error("Erreur lors de la création de la tâche");
    }
  };

  // Mettre à jour le formulaire de tâche
  const updateTaskForm = (field: keyof typeof taskForm, value: any) => {
    setTaskForm((prev) => ({ ...prev, [field]: value }));
  };

  // Gérer l'ajout de pièces jointes
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments = Array.from(files).map((file) => ({
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
      size: file.size,
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
    toast.success(`${files.length} fichier(s) ajouté(s)`);

    // Réinitialiser l'input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Formater la taille du fichier
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " octets";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " Ko";
    return (bytes / (1024 * 1024)).toFixed(1) + " Mo";
  };

  // Supprimer une pièce jointe
  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    toast.info("Pièce jointe supprimée");
  };

  // Partager la tâche
  const handleShare = () => {
    if (userRole !== "manager") {
      toast.error("Seuls les managers peuvent partager des tâches");
      return;
    }

    toast.success(
      `Tâche partagée avec un niveau d'accès ${selectedPermission}`,
    );
  };

  // Définir les valeurs d'estimation prédéfinies
  const timeEstimatePresets = [
    { label: "30min", value: 30 },
    { label: "1h", value: 60 },
    { label: "2h", value: 120 },
    { label: "4h", value: 240 },
    { label: "1 jour", value: 480 },
    { label: "2 jours", value: 960 },
  ];

  // Mettre le temps estimé avec une valeur prédéfinie
  const setEstimatedTimePreset = (minutes: number) => {
    updateTaskForm("estimated_time", minutes);
    toast.info(
      `Temps estimé défini à ${minutes >= 480 ? `${minutes / 480} jour(s)` : `${minutes >= 60 ? `${Math.floor(minutes / 60)}h${minutes % 60 > 0 ? ` ${minutes % 60}min` : ""}` : `${minutes}min`}`}`,
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b bg-violet-50 p-4">
          <h2 className="flex items-center text-lg font-semibold text-violet-800">
            {isAIMode ? (
              <>
                <Brain size={20} className="mr-2 text-violet-600" />
                Créer une tâche avec IA
              </>
            ) : (
              <>
                <ClipboardEdit size={20} className="mr-2 text-violet-600" />
                Créer une nouvelle tâche
              </>
            )}
          </h2>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-violet-600 hover:bg-violet-100"
            title="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto p-4">
          {isAIMode ? (
            <form onSubmit={handleAISubmit}>
              <div className="mb-4">
                <label
                  htmlFor="aiDescription"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Décrivez la tâche en quelques mots
                </label>
                <textarea
                  id="aiDescription"
                  value={aiDescription}
                  onChange={(e) => setAIDescription(e.target.value)}
                  className="w-full rounded-md border p-2"
                  rows={4}
                  placeholder="Par exemple: Créer une page de contact responsive avec un formulaire et une carte interactive."
                  required
                />
              </div>

              <div className="mb-4 border-l-4 border-violet-500 bg-violet-50 p-3">
                <h3 className="mb-1 flex items-center text-sm font-medium text-violet-800">
                  <Brain size={16} className="mr-1" />
                  Comment fonctionne la génération par IA ?
                </h3>
                <p className="text-sm text-violet-700">
                  L'IA va analyser votre description et générer automatiquement
                  une tâche structurée avec un titre, une description détaillée,
                  une priorité, une estimation de temps et des tags pertinents.
                  Cette fonctionnalité fonctionne même sans clé API.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="mr-2 rounded-md bg-gray-100 px-4 py-2 text-gray-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex items-center rounded-md bg-violet-500 px-4 py-2 text-white hover:bg-violet-600"
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
                <label
                  htmlFor="title"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Titre <span className="text-red-500">*</span>
                </label>
                {validationErrors.title && (
                  <p className="mb-1 text-sm text-red-500">
                    {validationErrors.title}
                  </p>
                )}
                <input
                  type="text"
                  id="title"
                  value={taskForm.title}
                  onChange={(e) => updateTaskForm("title", e.target.value)}
                  className={`w-full rounded-md border p-2 ${validationErrors.title ? "border-red-500" : ""}`}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="column"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Colonne <span className="text-red-500">*</span>
                </label>
                {validationErrors.column_id && (
                  <p className="mb-1 text-sm text-red-500">
                    {validationErrors.column_id}
                  </p>
                )}
                <select
                  id="column"
                  value={taskForm.column_id}
                  onChange={(e) => updateTaskForm("column_id", e.target.value)}
                  className={`w-full rounded-md border p-2 ${validationErrors.column_id ? "border-red-500" : ""}`}
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
                <label
                  htmlFor="description"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                {validationErrors.description && (
                  <p className="mb-1 text-sm text-red-500">
                    {validationErrors.description}
                  </p>
                )}
                <textarea
                  id="description"
                  value={taskForm.description}
                  onChange={(e) =>
                    updateTaskForm("description", e.target.value)
                  }
                  className={`w-full rounded-md border p-2 ${validationErrors.description ? "border-red-500" : ""}`}
                  rows={3}
                  required
                />
              </div>

              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="assignee"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Assigné à <span className="text-red-500">*</span>
                  </label>
                  {validationErrors.assignee_id && (
                    <p className="mb-1 text-sm text-red-500">
                      {validationErrors.assignee_id}
                    </p>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className={`flex w-full items-center justify-between rounded-md border bg-white p-2 text-left ${validationErrors.assignee_id ? "border-red-500" : ""}`}
                      >
                        {taskForm.assignee_id ? (
                          <div className="flex items-center">
                            <Avatar className="mr-2 h-6 w-6">
                              <AvatarImage
                                src={
                                  teamMembers.find(
                                    (m) => m.id === taskForm.assignee_id,
                                  )?.avatar ||
                                  "/placeholder-user.jpg" ||
                                  "/placeholder.svg"
                                }
                              />
                              <AvatarFallback>
                                {teamMembers
                                  .find((m) => m.id === taskForm.assignee_id)
                                  ?.name.charAt(0) || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <span>
                              {teamMembers.find(
                                (m) => m.id === taskForm.assignee_id,
                              )?.name || "Non assigné"}
                            </span>
                          </div>
                        ) : (
                          <span>Non assigné</span>
                        )}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="max-h-[300px] w-[200px] overflow-y-auto">
                      <DropdownMenuItem
                        onClick={() => updateTaskForm("assignee_id", "")}
                        className="cursor-pointer"
                      >
                        <span>Non assigné</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {teamMembers.map((member) => (
                        <DropdownMenuItem
                          key={member.id}
                          onClick={() =>
                            updateTaskForm("assignee_id", member.id)
                          }
                          className="cursor-pointer"
                        >
                          <div className="flex items-center">
                            <Avatar className="mr-2 h-6 w-6">
                              <AvatarImage
                                src={member.avatar || "/placeholder-user.jpg"}
                              />
                              <AvatarFallback>
                                {member.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{member.name}</span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div>
                  <label
                    htmlFor="priority"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Priorité <span className="text-red-500">*</span>
                  </label>
                  {validationErrors.priority && (
                    <p className="mb-1 text-sm text-red-500">
                      {validationErrors.priority}
                    </p>
                  )}
                  <select
                    id="priority"
                    value={taskForm.priority}
                    onChange={(e) => updateTaskForm("priority", e.target.value)}
                    className={`w-full rounded-md border p-2 ${validationErrors.priority ? "border-red-500" : ""}`}
                    required
                  >
                    <option value="basse">Basse</option>
                    <option value="moyenne">Moyenne</option>
                    <option value="haute">Haute</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="mb-2 block flex items-center text-sm font-medium text-gray-700">
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
                        className={`rounded-full px-3 py-1 text-xs transition-colors ${
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
                      onChange={(e) =>
                        updateTaskForm(
                          "estimated_time",
                          Number.parseInt(e.target.value) || 0,
                        )
                      }
                      className="w-full rounded-md border p-2"
                      min="0"
                    />
                    <span className="ml-2 text-sm text-gray-500">minutes</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="dueDate"
                  className="mb-1 block flex items-center text-sm font-medium text-gray-700"
                >
                  <Calendar size={14} className="mr-1" />
                  Date d'échéance <span className="text-red-500">*</span>
                </label>
                {validationErrors.due_date && (
                  <p className="mb-1 text-sm text-red-500">
                    {validationErrors.due_date}
                  </p>
                )}
                <input
                  type="date"
                  id="dueDate"
                  value={taskForm.due_date}
                  onChange={(e) => updateTaskForm("due_date", e.target.value)}
                  className={`w-full rounded-md border p-2 ${validationErrors.due_date ? "border-red-500" : ""}`}
                  required
                />
              </div>

              {/* Pièces jointes */}
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="attachments"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Pièces jointes
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center text-sm text-violet-600 hover:text-violet-700"
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
                  <div className="mt-2 max-h-40 space-y-2 overflow-y-auto rounded-md border p-2">
                    {attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-md bg-gray-50 p-2"
                      >
                        <div className="flex items-center">
                          <Upload size={14} className="mr-2 text-gray-500" />
                          <div>
                            <div className="max-w-xs truncate text-sm font-medium">
                              {attachment.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatFileSize(attachment.size)}
                            </div>
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
                <label
                  htmlFor="tags"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Tags (séparés par des virgules){" "}
                  <span className="text-red-500">*</span>
                </label>
                {validationErrors.tags && (
                  <p className="mb-1 text-sm text-red-500">
                    {validationErrors.tags}
                  </p>
                )}
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
                  className={`w-full rounded-md border p-2 ${validationErrors.tags ? "border-red-500" : ""}`}
                  placeholder="design, urgent, documentation"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md bg-gray-100 px-4 py-2 text-gray-700"
                >
                  Annuler
                </button>

                {userRole === "manager" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="flex items-center rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                      >
                        <Share2 size={16} className="mr-2" />
                        {selectedPermission === "read" && "Partager (Lecture)"}
                        {selectedPermission === "edit" &&
                          "Partager (Modification)"}
                        {selectedPermission === "manage" &&
                          "Partager (Manager)"}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        className="flex items-center"
                        onClick={() => setSelectedPermission("read")}
                      >
                        <Eye size={14} className="mr-2" /> Lecture seule
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center"
                        onClick={() => setSelectedPermission("edit")}
                      >
                        <Edit size={14} className="mr-2" /> Modification
                        (utilisateur)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center"
                        onClick={() => setSelectedPermission("manage")}
                      >
                        <UserCog size={14} className="mr-2" /> Manager
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="flex items-center text-blue-600"
                        onClick={handleShare}
                      >
                        <Share2 size={14} className="mr-2" /> Partager
                        maintenant
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                <button
                  type="submit"
                  className="rounded-md bg-violet-500 px-4 py-2 text-white hover:bg-violet-600"
                  disabled={!taskForm.title.trim() || isCreatingTask}
                >
                  {isCreatingTask ? (
                    <span className="flex items-center">
                      <Loader2 size={16} className="mr-2 animate-spin" />
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
  );
};

export default NewTaskModal;
