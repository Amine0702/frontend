"use client"

import React, { useState } from "react"
import {
  Users,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Download,
  UserCheck,
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/app/(components)/ui/card"
import { Button } from "@/app/(components)/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/(components)/ui/table"
import { Badge } from "@/app/(components)/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/app/(components)/ui/popover"
import { Checkbox } from "@/app/(components)/ui/checkbox"
import { Slider } from "@/app/(components)/slider"

// === Types ===

export type Tache = {
  id: number
  titre: string
  statut: string
  priorite: string
  progression: number
}

export type Membre = {
  id: number
  nom: string
  role: string
  email: string
  statut: string
  taches: Tache[]
}

export type Team = {
  id: number
  nom: string
  chefDeProjet: string
  membres: Membre[]
  projetsActifs: number
  tauxCompletion: number
  derniereMaj: string
  statut: string
  priorite: string
}

// === Données simulées ===

const mockTeams: Team[] = [
  {
    id: 1,
    nom: "Équipe Alpha",
    chefDeProjet: "Martin Dupont",
    membres: [
      {
        id: 1,
        nom: "Jean Moreau",
        role: "Développeur Frontend",
        email: "jean.moreau@example.com",
        statut: "actif",
        taches: [
          { id: 1, titre: "Refonte page d'accueil", statut: "en_cours", priorite: "haute", progression: 70 },
          { id: 2, titre: "Optimisation CSS", statut: "terminé", priorite: "moyenne", progression: 100 },
        ],
      },
      {
        id: 2,
        nom: "Marie Dufresne",
        role: "Designer UI/UX",
        email: "marie.dufresne@example.com",
        statut: "actif",
        taches: [
          { id: 3, titre: "Maquettes dashboard", statut: "en_cours", priorite: "haute", progression: 60 },
          { id: 4, titre: "Icônes pour mobile", statut: "en_attente", priorite: "basse", progression: 0 },
        ],
      },
      {
        id: 3,
        nom: "Pierre Lambert",
        role: "Développeur Backend",
        email: "pierre.lambert@example.com",
        statut: "actif",
        taches: [
          { id: 5, titre: "API authentication", statut: "terminé", priorite: "haute", progression: 100 },
          { id: 6, titre: "Optimisation des requêtes", statut: "en_cours", priorite: "haute", progression: 40 },
        ],
      },
    ],
    projetsActifs: 3,
    tauxCompletion: 78,
    derniereMaj: "2025-04-08",
    statut: "actif",
    priorite: "haute",
  },
  {
    id: 2,
    nom: "Équipe Beta",
    chefDeProjet: "Jean Moreau",
    membres: [
      {
        id: 4,
        nom: "Claire Martin",
        role: "Développeuse Full Stack",
        email: "claire.martin@example.com",
        statut: "actif",
        taches: [
          { id: 7, titre: "Intégration API paiement", statut: "en_cours", priorite: "haute", progression: 80 },
          { id: 8, titre: "Tests unitaires frontend", statut: "terminé", priorite: "moyenne", progression: 100 },
        ],
      },
      {
        id: 5,
        nom: "Thomas Petit",
        role: "DevOps",
        email: "thomas.petit@example.com",
        statut: "actif",
        taches: [
          { id: 9, titre: "Configuration CI/CD", statut: "terminé", priorite: "haute", progression: 100 },
          { id: 10, titre: "Monitoring serveurs", statut: "en_cours", priorite: "moyenne", progression: 60 },
        ],
      },
    ],
    projetsActifs: 2,
    tauxCompletion: 92,
    derniereMaj: "2025-04-10",
    statut: "actif",
    priorite: "moyenne",
  },
  {
    id: 3,
    nom: "Équipe Gamma",
    chefDeProjet: "Lucie Bernard",
    membres: [
      {
        id: 6,
        nom: "Antoine Dubois",
        role: "Chef de projet technique",
        email: "antoine.dubois@example.com",
        statut: "actif",
        taches: [
          { id: 11, titre: "Planning sprint 2", statut: "terminé", priorite: "haute", progression: 100 },
          { id: 12, titre: "Réunion clients", statut: "en_attente", priorite: "moyenne", progression: 0 },
        ],
      },
      {
        id: 7,
        nom: "Sarah Colin",
        role: "Développeuse Backend",
        email: "sarah.colin@example.com",
        statut: "pause",
        taches: [{ id: 13, titre: "Microservices commandes", statut: "en_cours", priorite: "haute", progression: 35 }],
      },
      {
        id: 8,
        nom: "Lucas Mercier",
        role: "Testeur QA",
        email: "lucas.mercier@example.com",
        statut: "actif",
        taches: [
          { id: 14, titre: "Tests de régression", statut: "en_cours", priorite: "moyenne", progression: 50 },
          { id: 15, titre: "Automatisation tests", statut: "en_cours", priorite: "haute", progression: 30 },
        ],
      },
    ],
    projetsActifs: 1,
    tauxCompletion: 65,
    derniereMaj: "2025-04-05",
    statut: "actif",
    priorite: "basse",
  },
  {
    id: 4,
    nom: "Équipe Delta",
    chefDeProjet: "Pierre Lambert",
    membres: [
      {
        id: 9,
        nom: "Émilie Rousseau",
        role: "Architecte solution",
        email: "emilie.rousseau@example.com",
        statut: "actif",
        taches: [
          { id: 16, titre: "Architecture microservices", statut: "terminé", priorite: "haute", progression: 100 },
          { id: 17, titre: "Documentation technique", statut: "en_cours", priorite: "moyenne", progression: 75 },
        ],
      },
      {
        id: 10,
        nom: "Hugo Leroy",
        role: "Développeur Mobile",
        email: "hugo.leroy@example.com",
        statut: "actif",
        taches: [{ id: 18, titre: "Application iOS", statut: "en_cours", priorite: "haute", progression: 40 }],
      },
    ],
    projetsActifs: 2,
    tauxCompletion: 45,
    derniereMaj: "2025-04-01",
    statut: "pause",
    priorite: "basse",
  },
  {
    id: 5,
    nom: "Équipe Epsilon",
    chefDeProjet: "Antoine Dubois",
    membres: [
      {
        id: 11,
        nom: "Sophie Lefebvre",
        role: "Analyste fonctionnelle",
        email: "sophie.lefebvre@example.com",
        statut: "actif",
        taches: [
          { id: 19, titre: "Spécifications module RH", statut: "terminé", priorite: "haute", progression: 100 },
          { id: 20, titre: "Cahier de tests", statut: "en_cours", priorite: "moyenne", progression: 80 },
        ],
      },
      {
        id: 12,
        nom: "Vincent Martin",
        role: "Développeur Backend",
        email: "vincent.martin@example.com",
        statut: "actif",
        taches: [
          { id: 21, titre: "API de reporting", statut: "en_cours", priorite: "haute", progression: 65 },
          { id: 22, titre: "Optimisation cache", statut: "en_attente", priorite: "basse", progression: 0 },
        ],
      },
      {
        id: 13,
        nom: "Julie Lemoine",
        role: "Designer UX",
        email: "julie.lemoine@example.com",
        statut: "actif",
        taches: [
          { id: 23, titre: "Parcours utilisateur", statut: "terminé", priorite: "haute", progression: 100 },
          { id: 24, titre: "Tests utilisateurs", statut: "en_cours", priorite: "moyenne", progression: 50 },
        ],
      },
    ],
    projetsActifs: 4,
    tauxCompletion: 81,
    derniereMaj: "2025-04-09",
    statut: "actif",
    priorite: "haute",
  },
]

// === Fonctions utilitaires ===

// Télécharge les membres d'une équipe en CSV
const downloadTeamsData = (team: Team): void => {
  const membersData = team.membres.map((membre: Membre) => [
    membre.id,
    membre.nom,
    membre.role,
    membre.email,
    membre.statut,
    membre.taches.map((t: Tache) => `${t.titre} (${t.progression}%)`).join("; "),
  ])

  const teamsDataCsv = [["ID", "Nom", "Rôle", "Email", "Statut", "Tâches"], ...membersData]
    .map((e) => e.join(","))
    .join("\n")

  const blob = new Blob([teamsDataCsv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", `equipe_${team.nom}_membres.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const getProgressColor = (progress: number): string => {
  if (progress < 30) return "bg-amber-500"
  if (progress < 70) return "bg-blue-500"
  return "bg-green-500"
}

const getStatusDisplay = (status: string): JSX.Element => {
  switch (status) {
    case "actif":
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800"
        >
          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Actif
        </Badge>
      )
    case "pause":
      return (
        <Badge
          variant="outline"
          className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800"
        >
          <Clock className="w-3.5 h-3.5 mr-1" /> En pause
        </Badge>
      )
    case "terminé":
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800"
        >
          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Terminé
        </Badge>
      )
    case "en_cours":
      return (
        <Badge
          variant="outline"
          className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800"
        >
          <Clock className="w-3.5 h-3.5 mr-1" /> En cours
        </Badge>
      )
    case "en_attente":
      return (
        <Badge
          variant="outline"
          className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-800"
        >
          <AlertCircle className="w-3.5 h-3.5 mr-1" /> En attente
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300">
          {status}
        </Badge>
      )
  }
}

const getPriorityDisplay = (priority: string): JSX.Element => {
  switch (priority) {
    case "haute":
      return <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border-0">Haute</Badge>
    case "moyenne":
      return (
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-0">Moyenne</Badge>
      )
    case "basse":
      return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300 border-0">Basse</Badge>
    default:
      return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300">{priority}</Badge>
  }
}

// === Composant ReportMetric ===

type ReportMetricProps = {
  icon: React.ReactNode
  title: string
  value: number | string
}

const ReportMetric = ({ icon, title, value }: ReportMetricProps): JSX.Element => {
  return (
    <Card className="border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
      <CardContent className="p-6">
        <div className="flex justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{value}</p>
          </div>
          <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// === Composant principal Index ===

const Index = (): JSX.Element => {
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [expandedTeam, setExpandedTeam] = useState<number | null>(null)
  const [expandedMember, setExpandedMember] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<keyof Team | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // États pour les filtres
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const [statusFilter, setStatusFilter] = useState<{ actif: boolean; pause: boolean }>({
    actif: true,
    pause: true,
  })
  const [priorityFilter, setPriorityFilter] = useState<{ haute: boolean; moyenne: boolean; basse: boolean }>({
    haute: true,
    moyenne: true,
    basse: true,
  })
  const [completionFilter, setCompletionFilter] = useState<[number, number]>([0, 100])

  // État pour le graphique (non utilisé ici, mais laissé pour la suite)
  const [chartView, setChartView] = useState<string>("statut")

  // Calcul des métriques
  const totalTeams: number = mockTeams.length
  const totalActiveTeams: number = mockTeams.filter((t) => t.statut === "actif").length
  const totalMembers: number = mockTeams.reduce((sum, team) => sum + team.membres.length, 0)

  // Filtrage des équipes selon les critères
  const filteredTeams: Team[] = mockTeams.filter((team) => {
    // Filtrage par recherche
    const matchesSearch: boolean =
      team.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.chefDeProjet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.membres.some((m) => m.nom.toLowerCase().includes(searchTerm.toLowerCase()))

    // Filtrage par statut
    const matchesStatus: boolean = statusFilter[team.statut as "actif" | "pause"] || false

    // Filtrage par priorité
    const matchesPriority: boolean = priorityFilter[team.priorite as "haute" | "moyenne" | "basse"] || false

    // Filtrage par taux de complétion
    const matchesCompletion: boolean =
      team.tauxCompletion >= completionFilter[0] && team.tauxCompletion <= completionFilter[1]

    return matchesSearch && matchesStatus && matchesPriority && matchesCompletion
  })

  // Tri des équipes
  let sortedTeams: Team[] = [...filteredTeams]
  if (sortBy) {
    sortedTeams = sortedTeams.sort((a, b) => {
      // Valeurs à comparer (on peut être amené à utiliser @ts-ignore si sortBy est dynamique)
      // Ici, comme sortBy est une clé de Team, on peut accéder directement sans problème
      const valueA = a[sortBy]
      const valueB = b[sortBy]

      if (typeof valueA === "string" && typeof valueB === "string") {
        return sortDirection === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
      } else if (typeof valueA === "number" && typeof valueB === "number") {
        return sortDirection === "asc" ? valueA - valueB : valueB - valueA
      }
      return 0
    })
  }

  // Gestion du tri
  const handleSort = (column: keyof Team) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortDirection("asc")
    }
  }

  // Affichage de la flèche de tri
  const getSortIcon = (column: keyof Team) => {
    if (sortBy !== column) return null
    return sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  // Gestion du clic sur une équipe
  const toggleTeamDetails = (id: number) => {
    setExpandedTeam(expandedTeam === id ? null : id)
    // Réinitialise le membre développé lors du changement d'équipe
    setExpandedMember(null)
  }

  // Gestion du clic sur un membre
  const toggleMemberDetails = (id: number) => {
    setExpandedMember(expandedMember === id ? null : id)
  }

  // Réinitialisation des filtres
  const resetFilters = () => {
    setStatusFilter({ actif: true, pause: true })
    setPriorityFilter({ haute: true, moyenne: true, basse: true })
    setCompletionFilter([0, 100])
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in dashboard-container">
      {/* En-tête de la page */}
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-3 shadow-sm border border-indigo-100 mb-6 dark:border-gray-700 pt-8 animate-fade-in">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
            Gestion des Équipes
          </h1>
          <p className="text-muted-foreground">
            Visualisez et explorez les équipes de vos projets. Vous avez actuellement {totalTeams} équipes avec{" "}
            {totalMembers} membres.
          </p>
        </div>
      </div>

      {/* Cartes métriques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <ReportMetric
          icon={<Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
          title="Équipes Actives"
          value={`${totalActiveTeams}/${totalTeams}`}
        />
        <ReportMetric
          icon={<UserCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
          title="Membres"
          value={totalMembers.toString()}
        />
        <ReportMetric
          icon={<Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
          title="Projets en Cours"
          value={mockTeams.reduce((sum, team) => sum + team.projetsActifs, 0).toString()}
        />
      </div>

      {/* Barre d'actions */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une équipe, un membre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
          />
        </div>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900/30 flex gap-2 dark:text-white"
              >
                <Filter className="h-4 w-4" /> Filtres
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 filter-popover">
              <h3 className="font-medium mb-4 flex items-center justify-between">
                Filtres
                <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 text-xs">
                  Réinitialiser
                </Button>
              </h3>

              <div className="space-y-4">
                {/* Filtres de statut */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Statut</h4>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center">
                      <Checkbox
                        id="status-active"
                        checked={statusFilter.actif}
                        onCheckedChange={(checked) => setStatusFilter({ ...statusFilter, actif: !!checked })}
                      />
                      <span className="ml-2">Actif</span>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="status-pause"
                        checked={statusFilter.pause}
                        onCheckedChange={(checked) => setStatusFilter({ ...statusFilter, pause: !!checked })}
                      />
                      <span className="ml-2">En pause</span>
                    </div>
                  </div>
                </div>

                {/* Filtres de priorité */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Priorité</h4>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center">
                      <Checkbox
                        id="priority-high"
                        checked={priorityFilter.haute}
                        onCheckedChange={(checked) => setPriorityFilter({ ...priorityFilter, haute: !!checked })}
                      />
                      <span className="ml-2">Haute</span>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="priority-medium"
                        checked={priorityFilter.moyenne}
                        onCheckedChange={(checked) => setPriorityFilter({ ...priorityFilter, moyenne: !!checked })}
                      />
                      <span className="ml-2">Moyenne</span>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="priority-low"
                        checked={priorityFilter.basse}
                        onCheckedChange={(checked) => setPriorityFilter({ ...priorityFilter, basse: !!checked })}
                      />
                      <span className="ml-2">Basse</span>
                    </div>
                  </div>
                </div>

                {/* Filtre de progression */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">Taux de complétion</h4>
                    <span className="text-xs text-muted-foreground">
                      {completionFilter[0]}% - {completionFilter[1]}%
                    </span>
                  </div>
                  <Slider
                    value={completionFilter}
                    min={0}
                    max={100}
                    step={5}
                    className="mb-6"
                    onValueChange={(value) => setCompletionFilter(value as [number, number])}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Table principale */}
      <Card
        className="border-purple-200 dark:border-purple-800 shadow-md animate-fade-in overflow-hidden"
        style={{ animationDelay: "0.3s" }}
      >
        <CardHeader className="bg-purple-50 dark:bg-purple-900/20 border-b border-purple-100 dark:border-purple-800/50 pb-4">
          <CardTitle className="text-purple-900 dark:text-purple-100 text-xl">Liste des Équipes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-purple-50/50 dark:bg-purple-900/10">
                <TableRow>
                  <TableHead className="w-[50px] cursor-pointer" onClick={() => handleSort("id")}>
                    <div className="flex items-center">ID {getSortIcon("id")}</div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("nom")}>
                    <div className="flex items-center">Nom de l'équipe {getSortIcon("nom")}</div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("chefDeProjet")}>
                    <div className="flex items-center">Chef de projet {getSortIcon("chefDeProjet")}</div>
                  </TableHead>
                  <TableHead className="cursor-pointer text-center" onClick={() => handleSort("tauxCompletion")}>
                    <div className="flex items-center justify-center">Complétion {getSortIcon("tauxCompletion")}</div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("statut")}>
                    <div className="flex items-center">Statut {getSortIcon("statut")}</div>
                  </TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTeams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                        <p>Aucune équipe trouvée</p>
                        <p className="text-sm text-muted-foreground">Essayez de modifier vos critères de recherche</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedTeams.map((team) => (
                    <React.Fragment key={team.id}>
                      <TableRow
                        className={`
                          hover:bg-purple-50/50 
                          dark:hover:bg-purple-900/10 
                          ${expandedTeam === team.id ? "bg-purple-50 dark:bg-purple-900/20" : ""}
                        `}
                      >
                        <TableCell className="font-medium">
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-100 rounded-md">
                            {team.id}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-purple-900 dark:text-purple-100">{team.nom}</div>
                        </TableCell>
                        <TableCell>{team.chefDeProjet}</TableCell>
                        <TableCell>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div
                              className="bg-purple-600 dark:bg-purple-500 h-2.5 rounded-full"
                              style={{ width: `${team.tauxCompletion}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-center mt-1">{team.tauxCompletion}%</div>
                        </TableCell>
                        <TableCell>{getStatusDisplay(team.statut)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => toggleTeamDetails(team.id)}
                          >
                            {expandedTeam === team.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>

                      {/* Détails de l'équipe et membres */}
                      {expandedTeam === team.id && (
                        <TableRow className="bg-purple-50/50 dark:bg-purple-900/10">
                          <TableCell colSpan={6} className="p-0">
                            <div className="p-4">
                              <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-purple-800 dark:text-purple-200">
                                  Membres de l'équipe
                                </h3>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:text-white dark:hover:bg-purple-900/30 flex gap-2"
                                  onClick={() => downloadTeamsData(team)}
                                >
                                  <Download className="h-3.5 w-3.5" /> Exporter les membres
                                </Button>
                              </div>
                              <div className="border rounded-md overflow-hidden dark:border-purple-800/50">
                                <Table>
                                  <TableHeader className="bg-purple-100/50 dark:bg-purple-900/30">
                                    <TableRow>
                                      <TableHead className="w-[40px]">ID</TableHead>
                                      <TableHead>Nom</TableHead>
                                      <TableHead className="hidden md:table-cell">Rôle</TableHead>
                                      <TableHead className="hidden lg:table-cell">Email</TableHead>
                                      <TableHead>Statut</TableHead>
                                      <TableHead className="w-[60px] text-right">Actions</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {team.membres.map((membre: Membre) => (
                                      <React.Fragment key={membre.id}>
                                        <TableRow
                                          className={`hover:bg-purple-100/30 dark:hover:bg-purple-900/20 ${
                                            expandedMember === membre.id ? "bg-purple-100/40 dark:bg-purple-900/30" : ""
                                          }`}
                                        >
                                          <TableCell>{membre.id}</TableCell>
                                          <TableCell className="font-medium">{membre.nom}</TableCell>
                                          <TableCell className="hidden md:table-cell">{membre.role}</TableCell>
                                          <TableCell className="hidden lg:table-cell">{membre.email}</TableCell>
                                          <TableCell>{getStatusDisplay(membre.statut)}</TableCell>
                                          <TableCell className="text-right">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-8 w-8 p-0"
                                              onClick={() => toggleMemberDetails(membre.id)}
                                            >
                                              {expandedMember === membre.id ? (
                                                <ChevronUp className="h-4 w-4" />
                                              ) : (
                                                <ChevronDown className="h-4 w-4" />
                                              )}
                                            </Button>
                                          </TableCell>
                                        </TableRow>

                                        {/* Détails des tâches du membre */}
                                        {expandedMember === membre.id && (
                                          <TableRow className="bg-purple-100/20 dark:bg-purple-900/20">
                                            <TableCell colSpan={6} className="p-4">
                                              <h4 className="text-sm font-medium mb-2 text-purple-700 dark:text-purple-300">
                                                Tâches assignées
                                              </h4>
                                              <div className="space-y-3">
                                                {membre.taches.length === 0 ? (
                                                  <p className="text-sm text-muted-foreground">Aucune tâche assignée</p>
                                                ) : (
                                                  membre.taches.map((tache: Tache) => (
                                                    <div
                                                      key={tache.id}
                                                      className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm border border-gray-200 dark:border-gray-700"
                                                    >
                                                      <div className="flex justify-between items-start">
                                                        <div>
                                                          <h5 className="font-medium">{tache.titre}</h5>
                                                          <div className="flex gap-2 mt-1">
                                                            {getStatusDisplay(tache.statut)}
                                                            {getPriorityDisplay(tache.priorite)}
                                                          </div>
                                                        </div>
                                                        <span className="text-sm font-medium">
                                                          {tache.progression}%
                                                        </span>
                                                      </div>
                                                      <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                                        <div
                                                          className={`${getProgressColor(tache.progression)} h-1.5 rounded-full`}
                                                          style={{ width: `${tache.progression}%` }}
                                                        ></div>
                                                      </div>
                                                    </div>
                                                  ))
                                                )}
                                              </div>
                                            </TableCell>
                                          </TableRow>
                                        )}
                                      </React.Fragment>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Index
