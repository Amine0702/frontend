"use client"

import Modal from "@/app/(components)/Modal"
import { useState } from "react"
import { formatISO } from "date-fns"
import { useCreateProjectMutation } from "@/app/state/api"
import { useUser } from "@clerk/nextjs"

type Props = {
  isOpen: boolean
  onClose: () => void
}

const ModalNewProject = ({ isOpen, onClose }: Props) => {
  const [createProject, { isLoading, isError }] = useCreateProjectMutation()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Gestion de la liste des emails invités
  const [memberEmail, setMemberEmail] = useState("")
  const [invitedMembers, setInvitedMembers] = useState<string[]>([])

  // Récupération de l'utilisateur connecté via Clerk
  const { user, isLoaded } = useUser()
  if (!isLoaded) return <p>Loading...</p>

  const clerkUserId = user?.id || ""

  const handleAddMember = () => {
    const trimmedEmail = memberEmail.trim()
    if (trimmedEmail && !invitedMembers.includes(trimmedEmail)) {
      setInvitedMembers([...invitedMembers, trimmedEmail])
      setMemberEmail("")
    }
  }

  const handleRemoveMember = (emailToRemove: string) => {
    setInvitedMembers(invitedMembers.filter((email) => email !== emailToRemove))
  }

  const handleSubmit = async () => {
    // Vérification de la complétude du formulaire
    if (!name || !description || !startDate || !endDate || !clerkUserId) return

    try {
      const formattedStartDate = formatISO(new Date(startDate), {
        representation: "complete",
      })
      const formattedEndDate = formatISO(new Date(endDate), {
        representation: "complete",
      })

      // La méthode .unwrap() permet de récupérer directement l'erreur si la mutation échoue
      await createProject({
        name,
        description,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        clerkUserId,
        invitedMembers,
      }).unwrap()

      onClose() // Fermer la modal après succès
    } catch (err) {
      console.error("Erreur lors de la création du projet:", err)
      // Vous pouvez afficher ici un message d'erreur à l'utilisateur
    }
  }

  const isFormValid = () => name && description && startDate && endDate && clerkUserId

  const inputStyles =
    "w-full rounded border border-gray-300 p-2 shadow-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none"

  return (
    <Modal isOpen={isOpen} onClose={onClose} name="Create New Project">
      <form
        className="mt-4 space-y-6"
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
      >
        <input
          type="text"
          className={inputStyles}
          placeholder="Project Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className={inputStyles}
          placeholder="Project Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-2">
          <input type="date" className={inputStyles} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <input type="date" className={inputStyles} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>

        {/* Zone pour inviter des membres */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Inviter des membres</label>
          <div className="flex gap-2 mt-1">
            <input
              type="email"
              placeholder="Email du membre"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              className={inputStyles}
            />
            <button
              type="button"
              onClick={handleAddMember}
              className="px-3 py-2 rounded-md border border-transparent bg-blue-primary text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              Ajouter
            </button>
          </div>
          {invitedMembers.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {invitedMembers.map((email, index) => (
                <div key={index} className="inline-flex items-center gap-1 rounded-full bg-gray-200 px-2 py-1 text-sm">
                  <span>{email}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(email)}
                    className="text-red-500 hover:text-red-700"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className={`mt-4 flex w-full justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
            !isFormValid() || isLoading ? "cursor-not-allowed opacity-50" : ""
          }`}
          disabled={!isFormValid() || isLoading}
        >
          {isLoading ? "Creating..." : "Create Project"}
        </button>

        {isError && <p className="text-red-500 mt-2">Une erreur est survenue lors de la création du projet.</p>}
      </form>
    </Modal>
  )
}

export default ModalNewProject
