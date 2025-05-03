"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MagnifyingGlassIcon,
  UserIcon,
  TrashIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  PencilIcon,
  CheckIcon,
} from "@heroicons/react/24/outline"
import { Toaster, toast } from "sonner"
import {
  useGetAllUsersQuery,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
  useGetUserStatsQuery,
  useCreateUserMutation,
} from "@/app/state/api"
import { useAuth } from "@clerk/nextjs"

// Palette de couleurs
const primaryColor = "#b03ff3" // mauve dominant
const accentYellow = "#FFC107"
const accentGreen = "#4CAF50"
const accentRed = "#F44336"

// --- Types
type User = {
  id: number
  name: string
  email: string
  role: "admin" | "user"
  profile_picture_url?: string
  created_at: string
  clerk_user_id: string
  status: "active" | "pending" | "inactive"
}

// --- Composant Statistique (rectangle)
const StatsCard = ({
  title,
  value,
  icon,
  bgClass,
}: {
  title: string
  value: number
  icon: React.ReactNode
  bgClass: string
}) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className={`flex items-center p-4 ${bgClass} text-gray-800 rounded-xl shadow-lg`}
  >
    <div className="p-3 bg-white bg-opacity-50 rounded-full mr-4">{icon}</div>
    <div>
      <p className="text-sm">{title}</p>
      <p className="font-bold text-xl">{value}</p>
    </div>
  </motion.div>
)

// --- Composant principal UsersPage
export default function UsersPage() {
  const { userId, isSignedIn } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "user">("all")

  // RTK Query hooks
  const { data: usersData, isLoading: isUsersLoading, refetch: refetchUsers } = useGetAllUsersQuery()
  const { data: statsData, isLoading: isStatsLoading } = useGetUserStatsQuery()
  const [updateUserRole, { isLoading: isUpdatingRole }] = useUpdateUserRoleMutation()
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation()
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation()

  // Filter users based on search query and role filter
  const filteredUsers = usersData?.users
    ? usersData.users.filter((user: User) => {
        const matchesSearch =
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesFilter = filterRole === "all" || user.role === filterRole

        return matchesSearch && matchesFilter
      })
    : []

  // Handle role change
  const handleRoleChange = async (user: User, newRole: "admin" | "user") => {
    try {
      await updateUserRole({ id: user.id, role: newRole }).unwrap()
      toast.success(`Le rôle de ${user.name} a été changé en ${newRole}`)
      refetchUsers()
    } catch (error) {
      console.error("Erreur lors de la mise à jour du rôle:", error)
      toast.error("Erreur lors de la mise à jour du rôle")
    }
  }

  // Handle user deletion
  const handleDeleteUser = async (user: User) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${user.name} ?`)) {
      try {
        await deleteUser(user.id).unwrap()
        toast.success(`${user.name} a été supprimé avec succès`)
        refetchUsers()
      } catch (error) {
        console.error("Erreur lors de la suppression de l'utilisateur:", error)
        toast.error("Erreur lors de la suppression de l'utilisateur")
      }
    }
  }

  // Handle user creation
  const handleCreateUser = async (userData: { name: string; email: string; role: "admin" | "user" }) => {
    try {
      // In a real app, you would generate a temporary password or send an invitation
      await createUser({
        name: userData.name,
        email: userData.email,
        role: userData.role,
        // Add other required fields as needed
      }).unwrap()
      toast.success(`${userData.name} a été créé avec succès`)
      setIsModalOpen(false)
      refetchUsers()
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error)
      toast.error("Erreur lors de la création de l'utilisateur")
    }
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-slate-900">
      <Toaster position="top-right" richColors />

      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Gestion des Utilisateurs</h1>

        {/* Stats Cards */}
        {!isStatsLoading && statsData && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatsCard
              title="Total Utilisateurs"
              value={statsData.total}
              icon={<UserIcon className="w-6 h-6" />}
              bgClass="bg-purple-100"
            />
            <StatsCard
              title="Administrateurs"
              value={statsData.admins}
              icon={<ShieldCheckIcon className="w-6 h-6" />}
              bgClass="bg-blue-100"
            />
            <StatsCard
              title="Utilisateurs Standard"
              value={statsData.users}
              icon={<UserCircleIcon className="w-6 h-6" />}
              bgClass="bg-green-100"
            />
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex flex-1 gap-3 items-center">
            <div className="relative flex-1 max-w-xs">
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-[#b03ff3] focus:border-[#b03ff3]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400 dark:text-gray-300" />
            </div>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as "all" | "admin" | "user")}
              className="w-40 rounded-lg border border-gray-300 dark:border-gray-600 
                bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-[#b03ff3] focus:border-[#b03ff3] py-2 px-3"
            >
              <option value="all">Tous les rôles</option>
              <option value="admin">Administrateurs</option>
              <option value="user">Utilisateurs</option>
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md shadow hover:from-purple-700 hover:to-pink-700 transition flex items-center gap-2"
          >
            <UserPlusIcon className="w-5 h-5" />
            Ajouter un utilisateur
          </motion.button>
        </div>

        {/* Users Table */}
        {isUsersLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Utilisateur
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Rôle
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Date d'inscription
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user: User) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={user.profile_picture_url || "/placeholder.svg?height=40&width=40"}
                            alt={user.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.role === "admin" ? "Administrateur" : "Utilisateur"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setIsEditModalOpen(true)
                          }}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          title="Modifier"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Supprimer"
                          disabled={isDeleting}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <UserIcon className="w-12 h-12 mx-auto text-gray-400" />
            <p className="mt-4 text-gray-500 dark:text-gray-300">Aucun utilisateur trouvé</p>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <AddUserModal onClose={() => setIsModalOpen(false)} onSubmit={handleCreateUser} isLoading={isCreating} />
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {isEditModalOpen && selectedUser && (
          <EditUserModal
            user={selectedUser}
            onClose={() => {
              setIsEditModalOpen(false)
              setSelectedUser(null)
            }}
            onRoleChange={handleRoleChange}
            isLoading={isUpdatingRole}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Modal d'ajout d'un nouvel utilisateur
const AddUserModal = ({
  onClose,
  onSubmit,
  isLoading,
}: {
  onClose: () => void
  onSubmit: (userData: { name: string; email: string; role: "admin" | "user" }) => void
  isLoading: boolean
}) => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    role: "user" as "admin" | "user",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setUserData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(userData)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
          <UserPlusIcon className="w-6 h-6 text-purple-600" />
          <span>Ajouter un nouvel utilisateur</span>
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom</label>
            <input
              name="name"
              type="text"
              value={userData.name}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-[#b03ff3] focus:border-[#b03ff3] dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              name="email"
              type="email"
              value={userData.email}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-[#b03ff3] focus:border-[#b03ff3] dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rôle</label>
            <select
              name="role"
              value={userData.role}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-[#b03ff3] focus:border-[#b03ff3] dark:bg-gray-700 dark:text-white"
            >
              <option value="user">Utilisateur</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-4 px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Création en cours...</span>
                </>
              ) : (
                <>
                  <UserPlusIcon className="w-5 h-5" />
                  <span>Créer l'utilisateur</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// Modal de modification d'un utilisateur
const EditUserModal = ({
  user,
  onClose,
  onRoleChange,
  isLoading,
}: {
  user: User
  onClose: () => void
  onRoleChange: (user: User, newRole: "admin" | "user") => void
  isLoading: boolean
}) => {
  const [newRole, setNewRole] = useState<"admin" | "user">(user.role)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newRole !== user.role) {
      onRoleChange(user, newRole)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
          <PencilIcon className="w-6 h-6 text-purple-600" />
          <span>Modifier l'utilisateur</span>
        </h2>
        <div className="mb-4 flex items-center">
          <img
            src={user.profile_picture_url || "/placeholder.svg?height=48&width=48"}
            alt={user.name}
            className="h-12 w-12 rounded-full mr-4"
          />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rôle</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as "admin" | "user")}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-[#b03ff3] focus:border-[#b03ff3] dark:bg-gray-700 dark:text-white"
            >
              <option value="user">Utilisateur</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-4 px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Mise à jour en cours...</span>
                </>
              ) : (
                <>
                  <CheckIcon className="w-5 h-5" />
                  <span>Enregistrer les modifications</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
