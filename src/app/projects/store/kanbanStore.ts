import { create } from "zustand"
import type { Project, Task, TeamMember, Column, Comment, Attachment } from "../types/kanban"

// Données initiales pour les membres d'équipe
const teamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Thomas Dubois",
    avatar: "https://randomuser.me/api/portraits/men/41.jpg",
    role: "Chef de Projet",
  },
  {
    id: "2",
    name: "Marie Laurent",
    avatar: "https://randomuser.me/api/portraits/women/31.jpg",
    role: "Designer UI/UX",
  },
  {
    id: "3",
    name: "Lucas Martin",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    role: "Développeur Frontend",
  },
  {
    id: "4",
    name: "Sophie Mercier",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    role: "Développeur Backend",
  },
  {
    id: "5",
    name: "Alexandre Petit",
    avatar: "https://randomuser.me/api/portraits/men/36.jpg",
    role: "QA Tester",
  },
]

// Données initiales pour les colonnes et tâches
const initialColumns: Column[] = [
  {
    id: "col-1",
    title: "À faire",
    tasks: [
      {
        id: "task-1",
        title: "Concevoir la maquette du site",
        description: "Créer les wireframes et le design du site web en suivant la charte graphique.",
        status: "à_faire",
        priority: "haute",
        assigneeId: "2",
        estimatedTime: 480, // 8 heures en minutes
        actualTime: 0,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // dans 7 jours
        timerActive: false,
        tags: ["design", "ui/ux"],
        attachments: [],
        comments: [],
      },
      {
        id: "task-2",
        title: "Analyse des besoins clients",
        description: "Recueillir et analyser les exigences du client pour le projet.",
        status: "à_faire",
        priority: "moyenne",
        assigneeId: "1",
        estimatedTime: 360, // 6 heures en minutes
        actualTime: 0,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // dans 3 jours
        timerActive: false,
        tags: ["analyse", "client"],
        attachments: [],
        comments: [],
      },
    ],
  },
  {
    id: "col-2",
    title: "En cours",
    tasks: [
      {
        id: "task-3",
        title: "Développer la page d'accueil",
        description: "Implémenter la page d'accueil selon les maquettes approuvées.",
        status: "en_cours",
        priority: "haute",
        assigneeId: "3",
        estimatedTime: 720, // 12 heures en minutes
        actualTime: 240, // 4 heures en minutes
        startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // il y a 2 jours
        timerActive: true,
        tags: ["développement", "frontend"],
        attachments: [],
        comments: [
          {
            id: "comment-1",
            authorId: "1",
            text: "N'oublie pas d'optimiser les images pour le mobile.",
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // il y a 1 jour
          },
        ],
      },
    ],
  },
  {
    id: "col-3",
    title: "En révision",
    tasks: [
      {
        id: "task-4",
        title: "Configuration de la base de données",
        description: "Mettre en place la structure de la base de données et les migrations.",
        status: "en_révision",
        priority: "urgente",
        assigneeId: "4",
        estimatedTime: 240, // 4 heures en minutes
        actualTime: 300, // 5 heures en minutes
        startedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // il y a 4 jours
        timerActive: false,
        tags: ["backend", "database"],
        attachments: [
          {
            id: "attachment-1",
            name: "schema_db.pdf",
            type: "application/pdf",
            url: "#",
            size: 1240000,
          },
        ],
        comments: [],
      },
    ],
  },
  {
    id: "col-4",
    title: "Terminé",
    tasks: [
      {
        id: "task-5",
        title: "Définir l'architecture technique",
        description: "Choisir les technologies et définir l'architecture globale du projet.",
        status: "terminé",
        priority: "haute",
        assigneeId: "1",
        estimatedTime: 300, // 5 heures en minutes
        actualTime: 270, // 4.5 heures en minutes
        startedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // il y a 10 jours
        completedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // il y a 8 jours
        timerActive: false,
        tags: ["architecture", "planification"],
        attachments: [],
        comments: [],
      },
    ],
  },
]

// Projet initial
const initialProject: Project = {
  id: "proj-1",
  name: "Projet Refonte Site Web",
  description: "Projet Refonte Site Web",
  team: teamMembers,
  columns: initialColumns,
}

// Types pour le store
interface KanbanState {
  projects: Project[]
  currentProject: Project | null
  selectedTask: Task | null
  isTaskModalOpen: boolean
  isNewTaskModalOpen: boolean
  isAITaskCreationSelected: boolean

  // Actions
  setCurrentProject: (projectId: string) => void
  openTaskModal: (taskId: string) => void
  closeTaskModal: () => void
  openNewTaskModal: (useAI: boolean) => void
  closeNewTaskModal: () => void
  moveTask: (taskId: string, sourceColId: string, destColId: string) => void
  addTask: (task: Task) => void
  updateTask: (taskId: string, updates: Partial<Task>) => void
  deleteTask: (taskId: string) => void
  toggleTaskTimer: (taskId: string) => void
  addComment: (taskId: string, comment: Omit<Comment, "id">) => void
  addAttachment: (taskId: string, attachment: Omit<Attachment, "id">) => void
  generateTaskWithAI: (description: string) => Promise<void>
  addColumn: (column: Column) => void
  reorderColumns: (columns: Column[]) => void
  shareTask: (taskId: string) => void
}

// Créer le store
export const useKanbanStore = create<KanbanState>((set, get) => ({
  projects: [initialProject],
  currentProject: initialProject,
  selectedTask: null,
  isTaskModalOpen: false,
  isNewTaskModalOpen: false,
  isAITaskCreationSelected: false,

  // Setter pour le projet courant
  setCurrentProject: (projectId: string) => {
    const project = get().projects.find((p) => p.id === projectId)
    if (project) {
      set({ currentProject: project })
    }
  },

  // Ouvrir le modal d'une tâche
  openTaskModal: (taskId: string) => {
    const { currentProject } = get()
    if (!currentProject) return

    const task = currentProject.columns.flatMap((col) => col.tasks).find((t) => t.id === taskId)

    if (task) {
      set({ selectedTask: task, isTaskModalOpen: true })
    }
  },

  // Fermer le modal d'une tâche
  closeTaskModal: () => {
    set({ isTaskModalOpen: false, selectedTask: null })
  },

  // Ouvrir le modal pour créer une nouvelle tâche
  openNewTaskModal: (useAI: boolean) => {
    set({ isNewTaskModalOpen: true, isAITaskCreationSelected: useAI })
  },

  // Fermer le modal de création de tâche
  closeNewTaskModal: () => {
    set({ isNewTaskModalOpen: false })
  },

  // Déplacer une tâche d'une colonne à une autre
  moveTask: (taskId: string, sourceColId: string, destColId: string) => {
    set((state) => {
      if (!state.currentProject) return state

      // Copie profonde du projet
      const updatedProject = JSON.parse(JSON.stringify(state.currentProject)) as Project

      // Trouver les colonnes source et destination
      const sourceCol = updatedProject.columns.find((col) => col.id === sourceColId)
      const destCol = updatedProject.columns.find((col) => col.id === destColId)

      if (!sourceCol || !destCol) return state

      // Trouver et retirer la tâche de la colonne source
      const taskIndex = sourceCol.tasks.findIndex((t) => t.id === taskId)
      if (taskIndex === -1) return state

      const [task] = sourceCol.tasks.splice(taskIndex, 1)

      // Mettre à jour le statut de la tâche selon la colonne de destination
      switch (destCol.title.toLowerCase()) {
        case "à faire":
          task.status = "à_faire"
          break
        case "en cours":
          task.status = "en_cours"
          break
        case "en révision":
          task.status = "en_révision"
          break
        case "terminé":
          task.status = "terminé"
          break
      }

      // Ajouter la tâche à la colonne de destination
      destCol.tasks.push(task)

      // Mettre à jour le projet dans la liste
      const updatedProjects = state.projects.map((p) => (p.id === updatedProject.id ? updatedProject : p))

      return {
        ...state,
        projects: updatedProjects,
        currentProject: updatedProject,
      }
    })
  },

  // Ajouter une nouvelle tâche
  addTask: (task: Task) => {
    set((state) => {
      if (!state.currentProject) return state

      // Copie profonde du projet
      const updatedProject = JSON.parse(JSON.stringify(state.currentProject)) as Project

      // Trouver la première colonne (généralement "À faire")
      const firstColumn = updatedProject.columns[0]
      if (!firstColumn) return state

      // Ajouter la tâche
      firstColumn.tasks.push({
        ...task,
        timerActive: true,
        startedAt: new Date(),
      })

      // Mettre à jour le projet dans la liste
      const updatedProjects = state.projects.map((p) => (p.id === updatedProject.id ? updatedProject : p))

      return {
        ...state,
        projects: updatedProjects,
        currentProject: updatedProject,
        isNewTaskModalOpen: false,
      }
    })
  },

  // Mettre à jour une tâche
  updateTask: (taskId: string, updates: Partial<Task>) => {
    set((state) => {
      if (!state.currentProject) return state

      // Copie profonde du projet
      const updatedProject = JSON.parse(JSON.stringify(state.currentProject)) as Project

      // Parcourir toutes les colonnes pour trouver la tâche
      let taskUpdated = false

      updatedProject.columns = updatedProject.columns.map((col) => {
        col.tasks = col.tasks.map((task) => {
          if (task.id === taskId) {
            taskUpdated = true
            return { ...task, ...updates }
          }
          return task
        })
        return col
      })

      if (!taskUpdated) return state

      // Mettre à jour le projet dans la liste
      const updatedProjects = state.projects.map((p) => (p.id === updatedProject.id ? updatedProject : p))

      // Mettre à jour la tâche sélectionnée si elle est ouverte
      const updatedSelectedTask =
        state.selectedTask && state.selectedTask.id === taskId
          ? { ...state.selectedTask, ...updates }
          : state.selectedTask

      return {
        ...state,
        projects: updatedProjects,
        currentProject: updatedProject,
        selectedTask: updatedSelectedTask,
      }
    })
  },

  // Supprimer une tâche
  deleteTask: (taskId: string) => {
    set((state) => {
      if (!state.currentProject) return state

      // Copie profonde du projet
      const updatedProject = JSON.parse(JSON.stringify(state.currentProject)) as Project

      // Parcourir toutes les colonnes pour trouver et supprimer la tâche
      updatedProject.columns = updatedProject.columns.map((col) => {
        col.tasks = col.tasks.filter((task) => task.id !== taskId)
        return col
      })

      // Mettre à jour le projet dans la liste
      const updatedProjects = state.projects.map((p) => (p.id === updatedProject.id ? updatedProject : p))

      return {
        ...state,
        projects: updatedProjects,
        currentProject: updatedProject,
        isTaskModalOpen: false,
        selectedTask: null,
      }
    })
  },

  // Démarrer/Arrêter le compteur de temps d'une tâche
  toggleTaskTimer: (taskId: string) => {
    set((state) => {
      if (!state.currentProject) return state

      // Copie profonde du projet
      const updatedProject = JSON.parse(JSON.stringify(state.currentProject)) as Project

      // Parcourir toutes les colonnes pour trouver la tâche
      let taskUpdated = false

      updatedProject.columns = updatedProject.columns.map((col) => {
        col.tasks = col.tasks.map((task) => {
          if (task.id === taskId) {
            taskUpdated = true
            const now = new Date()

            if (task.timerActive) {
              // Arrêter le timer
              const started = task.startedAt ? new Date(task.startedAt) : new Date()
              const elapsedMinutes = Math.floor((now.getTime() - started.getTime()) / 60000)

              return {
                ...task,
                timerActive: false,
                actualTime: (task.actualTime || 0) + elapsedMinutes,
              }
            } else {
              // Démarrer ou reprendre le timer
              return {
                ...task,
                timerActive: true,
                startedAt: now,
              }
            }
          }
          return task
        })
        return col
      })

      if (!taskUpdated) return state

      // Mettre à jour le projet dans la liste
      const updatedProjects = state.projects.map((p) => (p.id === updatedProject.id ? updatedProject : p))

      // Mettre à jour la tâche sélectionnée si elle est ouverte
      const selectedTask = state.selectedTask
      let updatedSelectedTask = selectedTask

      if (selectedTask && selectedTask.id === taskId) {
        const now = new Date()

        if (selectedTask.timerActive) {
          // Arrêter le timer
          const started = selectedTask.startedAt ? new Date(selectedTask.startedAt) : new Date()
          const elapsedMinutes = Math.floor((now.getTime() - started.getTime()) / 60000)

          updatedSelectedTask = {
            ...selectedTask,
            timerActive: false,
            actualTime: (selectedTask.actualTime || 0) + elapsedMinutes,
          }
        } else {
          // Démarrer ou reprendre le timer
          updatedSelectedTask = {
            ...selectedTask,
            timerActive: true,
            startedAt: now,
          }
        }
      }

      return {
        ...state,
        projects: updatedProjects,
        currentProject: updatedProject,
        selectedTask: updatedSelectedTask,
      }
    })
  },

  // Ajouter un commentaire à une tâche
  addComment: (taskId: string, comment: Omit<Comment, "id">) => {
    const newComment: Comment = {
      ...comment,
      id: `comment-${Date.now()}`,
    }

    const { selectedTask } = get()

    if (selectedTask && selectedTask.id === taskId) {
      const updatedComments = [...selectedTask.comments, newComment]
      get().updateTask(taskId, { comments: updatedComments })
    }
  },

  // Ajouter une pièce jointe à une tâche
  addAttachment: (taskId: string, attachment: Omit<Attachment, "id">) => {
    const newAttachment: Attachment = {
      ...attachment,
      id: `attachment-${Date.now()}`,
    }

    const { selectedTask } = get()

    if (selectedTask && selectedTask.id === taskId) {
      const updatedAttachments = [...selectedTask.attachments, newAttachment]
      get().updateTask(taskId, { attachments: updatedAttachments })
    }
  },

  // Générer une tâche avec l'IA
  generateTaskWithAI: async (description: string) => {
    // Simuler un appel API à un service d'IA
    // Dans un cas réel, ce serait un appel à une API comme GPT
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // Déterminer la priorité en fonction du contenu
        let priority: "basse" | "moyenne" | "haute" | "urgente" = "moyenne"

        if (description.toLowerCase().includes("urgent") || description.toLowerCase().includes("critique")) {
          priority = "urgente"
        } else if (
          description.toLowerCase().includes("important") ||
          description.toLowerCase().includes("prioritaire")
        ) {
          priority = "haute"
        } else if (description.toLowerCase().includes("simple") || description.toLowerCase().includes("facile")) {
          priority = "basse"
        }

        // Déterminer le temps estimé en fonction de la complexité
        // Plus intelligent que simplement basé sur la longueur
        let estimatedTime = 60 // Par défaut 1h

        if (description.length > 300) {
          estimatedTime = 240 // Tâche longue: 4h
        } else if (description.length > 150) {
          estimatedTime = 120 // Tâche moyenne: 2h
        } else if (description.length < 50) {
          estimatedTime = 30 // Tâche courte: 30min
        }

        // Analyse des mots-clés pour affiner l'estimation
        if (
          description.toLowerCase().includes("développer") ||
          description.toLowerCase().includes("créer") ||
          description.toLowerCase().includes("implémenter")
        ) {
          estimatedTime += 60
        }

        if (description.toLowerCase().includes("designer") || description.toLowerCase().includes("maquette")) {
          estimatedTime += 90
        }

        if (description.toLowerCase().includes("tester") || description.toLowerCase().includes("vérifier")) {
          estimatedTime += 30
        }

        // Extraire des tags potentiels
        const commonTags = [
          "design",
          "développement",
          "backend",
          "frontend",
          "test",
          "debug",
          "ux",
          "ui",
          "documentation",
          "optimisation",
        ]
        const tags = commonTags.filter((tag) => description.toLowerCase().includes(tag))

        if (priority === "urgente" && !tags.includes("urgent")) {
          tags.push("urgent")
        }

        // Ne pas dupliquer le tag "généré_par_ia"
        if (!tags.includes("généré_par_ia")) {
          tags.push("généré_par_ia")
        }

        const generatedTask: Task = {
          id: `task-${Date.now()}`,
          title: description.substring(0, 60) + (description.length > 60 ? "..." : ""),
          description: description,
          status: "à_faire",
          priority: priority,
          estimatedTime: estimatedTime,
          actualTime: 0,
          timerActive: true,
          startedAt: new Date(),
          tags: tags,
          attachments: [],
          comments: [],
        }

        get().addTask(generatedTask)
        resolve()
      }, 1500) // Simuler un délai de traitement
    })
  },

  // Ajouter une nouvelle colonne
  addColumn: (column: Column) => {
    set((state) => {
      if (!state.currentProject) return state

      // Copie profonde du projet
      const updatedProject = JSON.parse(JSON.stringify(state.currentProject)) as Project

      // Ajouter la nouvelle colonne
      updatedProject.columns.push(column)

      // Mettre à jour le projet dans la liste
      const updatedProjects = state.projects.map((p) => (p.id === updatedProject.id ? updatedProject : p))

      return {
        ...state,
        projects: updatedProjects,
        currentProject: updatedProject,
      }
    })
  },

  // Réordonner les colonnes
  reorderColumns: (columns: Column[]) => {
    set((state) => {
      if (!state.currentProject) return state

      // Copie profonde du projet
      const updatedProject = JSON.parse(JSON.stringify(state.currentProject)) as Project

      // Mettre à jour l'ordre des colonnes
      updatedProject.columns = columns

      // Mettre à jour le projet dans la liste
      const updatedProjects = state.projects.map((p) => (p.id === updatedProject.id ? updatedProject : p))

      return {
        ...state,
        projects: updatedProjects,
        currentProject: updatedProject,
      }
    })
  },

  // Partager une tâche
  shareTask: (taskId: string) => {
    console.log(`Partage du kanban/tâche ${taskId} avec les membres de l'équipe`)
    alert(`Lien de partage pour la tâche copié dans le presse-papier! La tâche a été partagée avec votre équipe.`)
  },
}))
