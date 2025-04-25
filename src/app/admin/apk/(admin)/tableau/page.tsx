"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeftIcon,
  Cog8ToothIcon,
  PencilIcon,
  EyeIcon,
  UserGroupIcon,
  TableCellsIcon,
} from "@heroicons/react/24/outline"
import { Search, Users, UserCircle, Check, Bell } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"

// Palette de couleurs
const primaryColor = "#b03ff3" // mauve dominant

// --- Types et données initiales
type BoardPermission = "read" | "write" | "admin"
type MemberRole = "member" | "manager"

// Type pour un projet avec sa kanban
type Project = {
  id: string
  name: string
  startDate: Date
  manager: string
  kanban: {
    name: string
    lastModified: Date
  }
}

type Member = {
  id: string
  name: string
  email: string
  avatar?: string
  permission: BoardPermission
  role: MemberRole
}

// Données simulées pour les projets
const initialProjects: Project[] = [
  {
    id: "alpha",
    name: "Projet Alpha",
    startDate: new Date("2024-01-10"),
    manager: "Alice Dupont",
    kanban: {
      name: "Kanban Alpha",
      lastModified: new Date("2024-03-15"),
    },
  },
  {
    id: "beta",
    name: "Projet Beta",
    startDate: new Date("2024-02-15"),
    manager: "Bob Martin",
    kanban: {
      name: "Kanban Beta",
      lastModified: new Date("2024-03-12"),
    },
  },
  {
    id: "gamma",
    name: "Projet Gamma",
    startDate: new Date("2024-03-01"),
    manager: "Claire Legrand",
    kanban: {
      name: "Kanban Gamma",
      lastModified: new Date("2024-03-10"),
    },
  },
]

// Données simulées pour les membres
const initialMembers: Member[] = [
  {
    id: "1",
    name: "Sophie Martin",
    email: "sophie.martin@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    permission: "admin",
    role: "manager",
  },
  {
    id: "2",
    name: "Thomas Dubois",
    email: "thomas.dubois@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    permission: "write",
    role: "manager",
  },
  {
    id: "3",
    name: "Emma Lefebvre",
    email: "emma.lefebvre@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    permission: "read",
    role: "member",
  },
  {
    id: "4",
    name: "Lucas Bernard",
    email: "lucas.bernard@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    permission: "read",
    role: "member",
  },
  {
    id: "5",
    name: "Chloé Moreau",
    email: "chloe.moreau@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    permission: "write",
    role: "member",
  },
]

// Template d'email pour les notifications
interface EmailTemplateProps {
  username: string
  projectName: string
  boardName: string
  permission: string
  taskDetails?: string
}

const EmailTemplate = ({ username, projectName, boardName, permission, taskDetails }: EmailTemplateProps) => {
  const permissionLabel =
    permission === "admin" ? "Administrateur" : permission === "write" ? "Modification" : "Lecture"

  return (
    <Html>
      <Head />
      <Preview>Nouvelle permission sur le tableau Kanban {boardName}</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "Arial, sans-serif" }}>
        <Container
          style={{
            padding: "40px 20px",
            background: "#ffffff",
            borderRadius: "8px",
            maxWidth: "600px",
            margin: "40px auto",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Heading style={{ color: "#b03ff3", fontSize: "24px", textAlign: "center", margin: "30px 0" }}>
            Mise à jour de vos permissions
          </Heading>

          <Section style={{ padding: "20px", backgroundColor: "#f9f4ff", borderRadius: "8px" }}>
            <Text style={{ fontSize: "16px", color: "#333333" }}>Bonjour {username},</Text>
            <Text style={{ fontSize: "16px", color: "#333333" }}>
              Vos permissions ont été mises à jour sur le tableau Kanban du projet.
            </Text>

            <Text style={{ fontSize: "16px", color: "#333333", marginTop: "20px" }}>
              <strong>Projet :</strong> {projectName}
            </Text>
            <Text style={{ fontSize: "16px", color: "#333333" }}>
              <strong>Tableau Kanban :</strong> {boardName}
            </Text>
            <Text style={{ fontSize: "16px", color: "#333333" }}>
              <strong>Nouvelle permission :</strong> {permissionLabel}
            </Text>

            {taskDetails && (
              <Text style={{ fontSize: "16px", color: "#333333" }}>
                <strong>Détails des tâches :</strong> {taskDetails}
              </Text>
            )}
          </Section>

          <Text style={{ fontSize: "14px", color: "#666666", textAlign: "center", marginTop: "30px" }}>
            Ce message a été envoyé automatiquement. Merci de ne pas y répondre.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

// Modifier le composant PermissionBadge pour des textes plus clairs en mode sombre
function PermissionBadge({ permission, className }: { permission: BoardPermission; className?: string }) {
  const config = {
    admin: {
      label: "Administrateur",
      icon: Cog8ToothIcon,
      className:
        "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/40 dark:text-white dark:border-pink-800/50",
    },
    write: {
      label: "Modification",
      icon: PencilIcon,
      className:
        "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-white dark:border-blue-800/50",
    },
    read: {
      label: "Lecture",
      icon: EyeIcon,
      className:
        "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-white dark:border-green-800/50",
    },
  }

  const { label, icon: Icon, className: badgeClass } = config[permission]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border shadow-sm",
        badgeClass,
        className,
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  )
}

// Modifier le sélecteur de permission pour des textes plus clairs
function PermissionSelect({
  currentPermission,
  onChange,
  member,
  projectName,
  boardName,
}: {
  currentPermission: BoardPermission
  onChange: (permission: BoardPermission) => void
  member: Member
  projectName: string
  boardName: string
}) {
  const [open, setOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const { toast } = useToast()

  const permissions: { value: BoardPermission; label: string }[] = [
    { value: "read", label: "Lecture" },
    { value: "write", label: "Modification" },
    { value: "admin", label: "Administrateur" },
  ]

  const handlePermissionChange = async (permission: BoardPermission) => {
    if (permission === currentPermission) {
      setOpen(false)
      return
    }

    setSending(true)

    try {
      // Changer la permission
      onChange(permission)

      // Simuler l'envoi d'un email (dans un environnement réel, cela appellerait une API)
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Afficher une notification de succès
      toast({
        title: (
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-green-500 dark:text-green-400" />
            <span className="dark:text-white">Notification envoyée</span>
          </div>
        ),
        description: (
          <div className="mt-1">
            <p className="text-sm dark:text-white">
              Un email a été envoyé à <span className="font-semibold dark:text-white">{member.name}</span> pour
              l'informer de sa nouvelle permission.
            </p>
            <div className="mt-2 p-2 bg-slate-100 dark:bg-slate-700 rounded-md text-xs">
              <p className="dark:text-white">
                <span className="font-semibold dark:text-white">Projet:</span> {projectName}
              </p>
              <p className="dark:text-white">
                <span className="font-semibold dark:text-white">Kanban:</span> {boardName}
              </p>
              <p className="dark:text-white">
                <span className="font-semibold dark:text-white">Nouvelle permission:</span>{" "}
                {permission === "admin" ? "Administrateur" : permission === "write" ? "Modification" : "Lecture"}
              </p>
            </div>
          </div>
        ),
        duration: 5000,
        className: "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
      })
    } catch (error) {
      console.error("Erreur lors de l'envoi de la notification:", error)
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'email de notification.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setSending(false)
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-center bg-white border-purple-100 hover:bg-purple-50/50 shadow-sm dark:bg-slate-800 dark:border-purple-900/50 dark:hover:bg-purple-900/30 dark:text-white"
          disabled={sending}
        >
          <PermissionBadge permission={currentPermission} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700">
        <Command className="bg-white dark:bg-slate-800">
          <CommandList>
            <CommandEmpty className="dark:text-white">Aucune permission trouvée.</CommandEmpty>
            <CommandGroup>
              {permissions.map((permission) => (
                <CommandItem
                  key={permission.value}
                  value={permission.value}
                  onSelect={() => handlePermissionChange(permission.value as BoardPermission)}
                  className="flex items-center gap-2 py-2 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 dark:aria-selected:bg-slate-700"
                >
                  <Check
                    className={cn("h-4 w-4", currentPermission === permission.value ? "opacity-100" : "opacity-0")}
                  />
                  <PermissionBadge permission={permission.value as BoardPermission} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// Modifier la carte de membre pour qu'elle ne soit pas transparente
function MemberCard({
  member,
  projectName,
  boardName,
  onPermissionChange,
}: {
  member: Member
  projectName: string
  boardName: string
  onPermissionChange: (memberId: string, permission: BoardPermission) => void
}) {
  const [permission, setPermission] = useState<BoardPermission>(member.permission)

  const handlePermissionChange = (newPermission: BoardPermission) => {
    setPermission(newPermission)
    onPermissionChange(member.id, newPermission)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      className="group"
    >
      <Card className="overflow-hidden border-0 shadow-lg transition-all group-hover:shadow-xl bg-white dark:bg-slate-800/95">
        <CardContent className="p-6">
          <div className="flex items-center gap-5">
            <Avatar className="h-14 w-14 border-2 border-purple-100 ring-2 ring-purple-50 dark:border-purple-900/50 dark:ring-purple-950">
              <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
              <AvatarFallback className="bg-gradient-to-br from-purple-400 to-purple-600 text-white dark:from-purple-700 dark:to-purple-900">
                {getInitials(member.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base truncate dark:text-slate-100">{member.name}</h3>
                <Badge
                  variant={member.role === "manager" ? "default" : "secondary"}
                  className={`ml-1 ${
                    member.role === "manager"
                      ? "text-white bg-gradient-to-r from-purple-500 to-indigo-500 dark:from-purple-700/90 dark:to-indigo-700/90"
                      : "bg-gradient-to-r from-slate-200 to-slate-300 text-slate-700 dark:from-slate-700 dark:to-slate-600 dark:text-slate-300"
                  }`}
                >
                  {member.role === "manager" ? (
                    <UserCircle className="mr-1 h-3 w-3" />
                  ) : (
                    <Users className="mr-1 h-3 w-3" />
                  )}
                  {member.role === "manager" ? "Manager" : "Membre"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate dark:text-slate-400">{member.email}</p>
            </div>
            <div className="w-[160px]">
              <PermissionSelect
                currentPermission={permission}
                onChange={handlePermissionChange}
                member={member}
                projectName={projectName}
                boardName={boardName}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Modifier les statistiques pour des textes plus clairs
function PermissionStats({ members }: { members: Member[] }) {
  const total = members.length
  const admin = members.filter((m) => m.permission === "admin").length
  const write = members.filter((m) => m.permission === "write").length
  const read = members.filter((m) => m.permission === "read").length

  const stats = [
    {
      title: "Total Membres",
      value: total,
      icon: UserGroupIcon,
      bgClass: "bg-orange-50 border-orange-100 dark:bg-orange-900/20 dark:border-orange-800/30",
      iconClass: "text-orange-500 dark:text-white",
      textClass: "text-orange-800 dark:text-white",
    },
    {
      title: "Administrateurs",
      value: admin,
      icon: Cog8ToothIcon,
      bgClass: "bg-pink-50 border-pink-100 dark:bg-pink-900/20 dark:border-pink-800/30",
      iconClass: "text-pink-500 dark:text-white",
      textClass: "text-pink-800 dark:text-white",
    },
    {
      title: "Modification",
      value: write,
      icon: PencilIcon,
      bgClass: "bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800/30",
      iconClass: "text-blue-500 dark:text-white",
      textClass: "text-blue-800 dark:text-white",
    },
    {
      title: "Lecture",
      value: read,
      icon: EyeIcon,
      bgClass: "bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-800/30",
      iconClass: "text-green-500 dark:text-white",
      textClass: "text-green-800 dark:text-white",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.03 }}
        >
          <Card className={`${stat.bgClass} border shadow-lg overflow-hidden hover:shadow-xl transition-all`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white shadow-sm dark:bg-slate-700">
                  <stat.icon className={`w-7 h-7 ${stat.iconClass}`} />
                </div>
                <div>
                  <p className={`text-sm font-medium ${stat.textClass}`}>{stat.title}</p>
                  <p className={`text-3xl font-bold ${stat.textClass}`}>{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

// Modifier le composant KanbanMembers pour des textes plus clairs
function KanbanMembers({ projectName, boardName }: { projectName: string; boardName: string }) {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handlePermissionChange = (memberId: string, permission: BoardPermission) => {
    setMembers(members.map((member) => (member.id === memberId ? { ...member, permission } : member)))
  }

  return (
    <Card className="w-full border-0 shadow-xl bg-white dark:bg-slate-800">
      <CardContent className="space-y-8 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-700 dark:from-purple-300 dark:to-indigo-300">
              Permissions du Tableau Kanban
            </h2>
            <p className="text-base text-gray-600 dark:text-white">
              Gérez qui peut voir, modifier ou administrer le tableau "{boardName}" du projet "{projectName}".
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground dark:text-white" />
            <Input
              type="search"
              placeholder="Rechercher un membre..."
              className="w-full md:w-[250px] pl-8 bg-white border-purple-100 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder:text-slate-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Statistiques des permissions */}
        <PermissionStats members={members} />

        <div className="space-y-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent dark:from-purple-300 dark:to-indigo-300">
            <Users className="h-5 w-5 text-purple-600 dark:text-white" />
            <span>Membres de l'équipe</span>
          </h3>

          <div className="grid gap-4">
            <AnimatePresence>
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <MemberCard
                      member={member}
                      projectName={projectName}
                      boardName={boardName}
                      onPermissionChange={handlePermissionChange}
                    />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <Users className="h-16 w-16 text-muted-foreground/30 dark:text-white/30" />
                  <h3 className="mt-4 text-lg font-semibold dark:text-white">Aucun membre trouvé</h3>
                  <p className="text-muted-foreground dark:text-white">Aucun membre ne correspond à votre recherche.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Composant Header affichant le titre, la date et un slogan inspirant
function Header({ currentDate }: { currentDate: Date }) {
  return (
    <div className="mb-8">
      <motion.h1
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-indigo-400 flex items-center space-x-3"
      >
        <TableCellsIcon className="w-10 h-10 text-purple-600 dark:text-purple-400" />
        <span>Dashboard – Gestion des Permissions Kanban</span>
      </motion.h1>
      <p className="text-gray-600 dark:text-gray-300 mt-2">
        Bonjour, aujourd'hui c'est le{" "}
        {currentDate.toLocaleDateString("fr-FR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
      <p className="mt-2 text-lg font-medium text-gray-700 dark:text-gray-300">
        Permissions Intelligentes – Le Contrôle à Portée de Main
      </p>
    </div>
  )
}

// Modifier le composant ProjectList pour des textes plus clairs
function ProjectList({ projects, onSelect }: { projects: Project[]; onSelect: (project: Project) => void }) {
  return (
    <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl space-y-8">
      <h1 className="flex items-center text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent dark:from-purple-300 dark:to-indigo-300">
        <div className="p-3 rounded-xl bg-purple-200/50 dark:bg-purple-800/30"></div>
        <span className="ml-4">Sélectionnez un projet</span>
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => onSelect(project)}
            className="p-6 bg-white dark:bg-slate-700 rounded-2xl shadow-xl cursor-pointer border border-transparent hover:border-[3px] hover:border-[#b03ff3] dark:hover:border-[#9d5fd0] transition"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{project.name}</h3>
            <p className="text-sm text-gray-600 dark:text-white">
              Début : {project.startDate.toLocaleDateString("fr-FR")}
            </p>
            <p className="text-sm text-gray-600 dark:text-white">Chef de projet : {project.manager}</p>
            <p className="text-sm text-gray-600 dark:text-white mt-2">
              <span className="font-medium">Kanban :</span> {project.kanban.name}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Modifier le composant principal pour améliorer la visibilité en mode sombre
export default function ProjectsPage() {
  const [projects] = useState<Project[]>(initialProjects)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-slate-900">
      {!selectedProject ? (
        <ProjectList projects={projects} onSelect={(proj) => setSelectedProject(proj)} />
      ) : (
        <div className="space-y-6">
          <Button
            onClick={() => setSelectedProject(null)}
            variant="ghost"
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-white dark:hover:text-white dark:hover:bg-purple-900/30"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Retour à la liste des projets
          </Button>

          <div className="mb-6">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-bold flex items-center gap-3"
            >
              <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-800/30">
                <TableCellsIcon className="w-8 h-8 text-purple-600 dark:text-white" />
              </div>
              <div className="space-y-1">
                <span className="flex items-center text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent dark:from-purple-300 dark:to-indigo-300">
                  {selectedProject.name}
                </span>
                <div className="flex items-center gap-2">
                  <Separator className="w-10 h-0.5 bg-purple-200 dark:bg-purple-700" />
                  <span className="text-lg font-medium text-purple-600 dark:text-white">
                    {selectedProject.kanban.name}
                  </span>
                </div>
              </div>
            </motion.h1>
            <p className="text-gray-600 dark:text-white mt-2 ml-14">
              Début : {selectedProject.startDate.toLocaleDateString("fr-FR")} • Chef de projet :{" "}
              {selectedProject.manager}
            </p>
          </div>

          <KanbanMembers projectName={selectedProject.name} boardName={selectedProject.kanban.name} />
        </div>
      )}
      <Toaster />
    </div>
  )
}
