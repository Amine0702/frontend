"use client"

import type React from "react"
import { useState } from "react"
import { X, Mail, Check, Eye, Edit, UserCog, AlertCircle, Plus } from "lucide-react"
import { toast } from "sonner"

interface ProjectShareModalProps {
  onClose: () => void
  projectName: string
  projectId: string
}

type PermissionLevel = "observer" | "member" | "manager"

interface InviteeData {
  email: string
  permission: PermissionLevel
}

const ProjectShareModal: React.FC<ProjectShareModalProps> = ({ onClose, projectName, projectId }) => {
  const [invitees, setInvitees] = useState<InviteeData[]>([{ email: "", permission: "observer" }])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleEmailChange = (index: number, email: string) => {
    const newInvitees = [...invitees]
    newInvitees[index].email = email
    setInvitees(newInvitees)
  }

  const handlePermissionChange = (index: number, permission: PermissionLevel) => {
    const newInvitees = [...invitees]
    newInvitees[index].permission = permission
    setInvitees(newInvitees)
  }

  const addInviteeField = () => {
    setInvitees([...invitees, { email: "", permission: "observer" }])
  }

  const removeInviteeField = (index: number) => {
    if (invitees.length > 1) {
      const newInvitees = [...invitees]
      newInvitees.splice(index, 1)
      setInvitees(newInvitees)
    }
  }

  // Modifier la fonction handleSubmit pour s'assurer que les invitations sont correctement envoyées
  const handleSubmit = async () => {
    // Validation des emails
    const validInvitees = invitees.filter(
      (inv) => inv.email.trim() !== "" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inv.email),
    )

    if (validInvitees.length === 0) {
      toast.error("Veuillez saisir au moins une adresse email valide")
      return
    }

    setIsSubmitting(true)

    try {
      // Appel à l'API pour envoyer les invitations
      const response = await fetch(`http://localhost:8000/api/projects/${projectId}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Clerk-User-Id": localStorage.getItem("currentUserId") || "",
        },
        body: JSON.stringify({
          invitations: validInvitees.map((inv) => ({
            email: inv.email,
            permission: inv.permission,
          })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("API error:", errorData)
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      toast.success(`${validInvitees.length} invitation(s) envoyée(s) avec succès`)
      onClose()
    } catch (error) {
      console.error("Error sending invitations:", error)
      toast.error("Erreur lors de l'envoi des invitations")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-violet-800">Inviter des collaborateurs</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Invitez des personnes à collaborer sur le projet <span className="font-semibold">{projectName}</span>
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {invitees.map((invitee, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="flex-grow">
                <div className="flex items-center border rounded-md overflow-hidden">
                  <span className="bg-gray-100 p-2 text-gray-500">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    value={invitee.email}
                    onChange={(e) => handleEmailChange(index, e.target.value)}
                    placeholder="email@exemple.com"
                    className="flex-grow p-2 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex-shrink-0">
                <select
                  value={invitee.permission}
                  onChange={(e) => handlePermissionChange(index, e.target.value as PermissionLevel)}
                  className="p-2 border rounded-md bg-white"
                >
                  <option value="observer">Observateur</option>
                  <option value="member">Membre</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              <button
                onClick={() => removeInviteeField(index)}
                className="p-1 text-gray-400 hover:text-red-500"
                disabled={invitees.length === 1}
              >
                <X size={18} />
              </button>
            </div>
          ))}

          <button onClick={addInviteeField} className="flex items-center text-sm text-violet-600 hover:text-violet-800">
            <Plus size={16} className="mr-1" /> Ajouter un autre email
          </button>
        </div>

        <div className="bg-violet-50 p-3 rounded-md mb-6 border border-violet-200">
          <div className="flex items-center">
            <AlertCircle size={18} className="text-violet-600 mr-2" />
            <h3 className="text-sm font-medium text-violet-800">Niveaux de permission</h3>
          </div>
          <ul className="text-xs text-violet-700 space-y-1 mt-2">
            <li className="flex items-center">
              <Eye size={12} className="mr-1" />
              <b>Observateur:</b> Peut voir les tâches mais ne peut rien modifier
            </li>
            <li className="flex items-center">
              <Edit size={12} className="mr-1" />
              <b>Membre:</b> Peut modifier ses propres tâches et en créer de nouvelles
            </li>
            <li className="flex items-center">
              <UserCog size={12} className="mr-1" />
              <b>Manager:</b> Accès complet, peut assigner des tâches et modifier toutes les tâches
            </li>
          </ul>
        </div>

        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-violet-500 text-white rounded-md hover:bg-violet-600 flex items-center"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Envoi en cours...
              </>
            ) : (
              <>
                <Check size={16} className="mr-2" />
                Envoyer les invitations
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProjectShareModal
