"use client"

import type React from "react"
import { useState } from "react"
import type { Project } from "../types/kanban"
import { Plus, List, Table, LayoutGrid, Clock, Share, X, Calendar, UserCog, Info, AlertCircle, Bot } from "lucide-react"
import TeamAvatars from "./TeamAvatars"
import { useKanbanStore } from "../store/kanbanStore"
import { format } from "date-fns"
import { Button } from "../../components/ui/button"
import { Toggle } from "../../components/ui/toggle"
import ProjectShareModal from "./ProjectShareModal"
import ChatbotModal from "./ChatbotModal"
import { toast } from "sonner"

interface ProjectHeaderProps {
  project: Project
  onNewTask: () => void
  currentView: "kanban" | "list" | "table" | "timeline"
  onViewChange: (view: "kanban" | "list" | "table" | "timeline") => void
  userRole: string
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project, onNewTask, currentView, onViewChange, userRole }) => {
  const { shareTask } = useKanbanStore()
  const totalTasks = project.columns.reduce((acc, col) => acc + col.tasks.length, 0)
  const [showTeamDetails, setShowTeamDetails] = useState(false)
  const [showProjectDetails, setShowProjectDetails] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showChatbot, setShowChatbot] = useState(false)

  // Date fictive de création et dernière modification du projet
  const projectCreatedDate = new Date(2024, 3, 5) // 5 Avril 2024
  const projectLastModifiedDate = new Date() // Aujourd'hui
  const projectManager = project.team.find((member) => member.role === "manager")

  // Assurons-nous que le bouton de partage dans ProjectHeader fonctionne correctement
  const handleShare = () => {
    // Vérifier si l'utilisateur est un manager
    if (userRole !== "manager") {
      toast.error("Seuls les managers peuvent partager le projet")
      return
    }

    // Ouvrir le modal de partage
    setShowShareModal(true)
  }

  const handleNewTask = () => {
    // Vérifier si l'utilisateur a le droit de créer des tâches
    if (userRole === "observer") {
      toast.error("Les observateurs ne peuvent pas créer de tâches")
      return
    }

    onNewTask()
  }

  const closeTeamDetails = () => {
    setShowTeamDetails(false)
  }

  const closeProjectDetails = () => {
    setShowProjectDetails(false)
  }

  return (
    <div className="bg-white shadow-sm border-b p-4 sticky top-0 z-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold text-violet-800">{project.name}</h1>
          <button
            onClick={() => setShowProjectDetails(true)}
            className="p-1 text-violet-500 hover:text-violet-700 hover:bg-violet-50 rounded-full"
            title="Détails du projet"
          >
            <Info size={18} />
          </button>
        </div>

        <div className="flex flex-wrap items-center space-x-2">
          <div className="project-meta mr-4">
            <div className="project-meta-item">
              <Calendar size={14} className="mr-1" />
              <span>Créé le {format(projectCreatedDate, "dd/MM/yyyy")}</span>
            </div>

            <div className="project-meta-item">
              <UserCog size={14} className="mr-1" />
              <span>Manager: {projectManager?.name || "Non défini"}</span>
            </div>
          </div>

          <div className="mr-4 cursor-pointer" onClick={() => setShowTeamDetails(true)} title="Voir l'équipe">
            <TeamAvatars members={project.team} />
          </div>

          <Button
            onClick={() => setShowChatbot(true)}
            variant="outline"
            size="sm"
            className="flex items-center px-3 py-2 bg-white border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50 transition-colors mr-2"
          >
            <Bot size={16} className="mr-1" />
            Assistant IA
          </Button>

          <Button
            onClick={handleShare}
            variant="outline"
            size="sm"
            className="flex items-center px-3 py-2 bg-white border border-violet-300 text-violet-600 rounded-md hover:bg-violet-50 transition-colors"
          >
            <Share size={16} className="mr-1" />
            Partager
          </Button>

          <Button
            onClick={handleNewTask}
            size="sm"
            className="flex items-center px-4 py-2 bg-violet-500 text-white rounded-md hover:bg-violet-600 transition-colors"
          >
            <Plus size={16} className="mr-1" />
            Nouvelle tâche
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex space-x-1">
          <Toggle
            pressed={currentView === "kanban"}
            onClick={() => onViewChange("kanban")}
            className={`p-2 rounded-md flex items-center text-sm ${
              currentView === "kanban" ? "bg-violet-100 text-violet-700" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <LayoutGrid size={16} className="mr-1" />
            Kanban
          </Toggle>
          <Toggle
            pressed={currentView === "list"}
            onClick={() => onViewChange("list")}
            className={`p-2 rounded-md flex items-center text-sm ${
              currentView === "list" ? "bg-violet-100 text-violet-700" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <List size={16} className="mr-1" />
            Liste
          </Toggle>
          <Toggle
            pressed={currentView === "table"}
            onClick={() => onViewChange("table")}
            className={`p-2 rounded-md flex items-center text-sm ${
              currentView === "table" ? "bg-violet-100 text-violet-700" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Table size={16} className="mr-1" />
            Tableau
          </Toggle>
          <Toggle
            pressed={currentView === "timeline"}
            onClick={() => onViewChange("timeline")}
            className={`p-2 rounded-md flex items-center text-sm ${
              currentView === "timeline" ? "bg-violet-100 text-violet-700" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Clock size={16} className="mr-1" />
            Chronologie
          </Toggle>
        </div>

        <div className="text-sm text-gray-600">
          <span className="font-medium">{totalTasks}</span> tâches au total
        </div>
      </div>

      {/* Modal pour les détails du projet */}
      {showProjectDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-violet-800">Détails du projet</h2>
              <button onClick={closeProjectDetails} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700">Description</h3>
                <p className="mt-1 text-gray-600">
                  Refonte complète du site web vitrine et de la plateforme e-commerce associée. Mise en place d'une
                  nouvelle charte graphique et amélioration de l'expérience utilisateur.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-700">Date de création</h3>
                  <p className="mt-1 text-gray-600">{format(projectCreatedDate, "dd MMMM yyyy")}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Dernière modification</h3>
                  <p className="mt-1 text-gray-600">{format(projectLastModifiedDate, "dd MMMM yyyy")}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Chef de projet</h3>
                  <p className="mt-1 text-gray-600">{projectManager?.name || "Non défini"}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Statut</h3>
                  <p className="mt-1 text-gray-600">En cours</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-2">Objectifs</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                  <li>Moderniser l'identité visuelle du site</li>
                  <li>Améliorer l'expérience mobile</li>
                  <li>Optimiser le parcours client</li>
                  <li>Intégrer de nouvelles fonctionnalités de paiement</li>
                  <li>Améliorer les performances de chargement</li>
                </ul>
              </div>

              <div className="bg-violet-50 p-3 rounded-md border border-violet-200">
                <div className="flex items-center">
                  <AlertCircle size={18} className="text-violet-600 mr-2" />
                  <h3 className="font-medium text-violet-700">Notes importantes</h3>
                </div>
                <p className="mt-1 text-violet-600 text-sm">
                  La migration vers le nouveau système doit être terminée avant la fin du trimestre pour préparer les
                  soldes d'été. Prévoir une phase de tests utilisateurs intensifs.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour les détails de l'équipe */}
      {showTeamDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-violet-800">Équipe du projet</h2>
              <button onClick={closeTeamDetails} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {project.team.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-violet-50 transition-colors"
                >
                  <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                    <img
                      src={member.avatar || "/placeholder.svg"}
                      alt={member.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-violet-800">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal pour le partage */}
      {showShareModal && (
        <ProjectShareModal onClose={() => setShowShareModal(false)} projectName={project.name} projectId={project.id} />
      )}

      {/* Modal pour le chatbot */}
      {showChatbot && <ChatbotModal onClose={() => setShowChatbot(false)} />}
    </div>
  )
}

export default ProjectHeader
