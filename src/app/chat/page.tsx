"use client"
import "./chat.css"
import type React from "react"
import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from "react"
import {
  Search,
  SlidersHorizontal,
  List,
  ArrowLeft,
  Reply,
  Forward,
  Trash2,
  PenSquare,
  FileEdit,
  SendHorizontal,
  Inbox,
  Paperclip,
  X,
  Save,
  Send,
  Sparkles,
  Star,
  StarOff,
  BookmarkIcon,
  Archive,
  Bell,
  MoreVertical,
  Calendar,
  FileText,
  ImageIcon,
  StickyNote,
  AtSign,
  Download,
  RefreshCw,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Palette,
  Headphones,
  Zap,
  Eye,
  EyeOff,
  Clock,
  ChevronDown,
  Tag,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/app/(components)/ui/button"
import { Input } from "@/app/(components)/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/(components)/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/(components)/ui/dropdown-menu"
import { Textarea } from "@/app/(components)/ui/textarea"
import { Separator } from "@/app/(components)/ui/separator"
import { Badge } from "@/app/(components)/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/app/(components)/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/(components)/ui/tabs"
import { Card, CardContent } from "@/app/(components)/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/(components)/ui/avatar"
import { Switch } from "@/app/(components)/ui/switch"
import { ScrollArea } from "@/app/(components)/ui/scroll-area"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

// Types
type Priority = "high" | "normal" | "low"
type Category = "inbox" | "drafts" | "sent" | "trash" | "starred" | "important" | "archived"
type View = "inbox" | "compose" | "settings" | "template"
type Theme = "light" | "dark" | "system"
type EmailLayout = "compact" | "comfortable" | "expanded"

interface Message {
  id: string
  content: string
  sender: string
  timestamp: string
}

interface User {
  id: string
  name: string
  avatar: string
  email: string
}

interface Email {
  id: string
  subject: string
  sender: string
  recipient: string
  content: string
  timestamp: string
  read: boolean
  aiGenerated: boolean
  folder: Category
  priority: Priority
  thread: Message[]
  attachments?: File[]
  starred?: boolean
  important?: boolean
  deletedAt?: number
  spans?: string[]
}

interface Template {
  id: string
  name: string
  subject: string
  content: string
}

// Main component
const MailPage = () => {
  // States
  const [spans, setSpans] = useState<string[]>(["Urgent", "Question", "Important", "Personnel"])
  const [selectedspans, setSelectedspans] = useState<string[]>([])

  // État pour le dialogue d'ajout d'étiquette
  const [isAddLabelDialogOpen, setIsAddLabelDialogOpen] = useState(false)
  const [newLabelText, setNewLabelText] = useState("")
  const [emails, setEmails] = useState<Email[]>([])
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [newEmail, setNewEmail] = useState<Partial<Email>>({})
  const [attachments, setAttachments] = useState<File[]>([])
  const [view, setView] = useState<View>("inbox")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<Category>("inbox")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOption, setSortOption] = useState<"dateAsc" | "dateDesc" | "priority">("dateDesc")
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768)
  const [showAIPrompt, setShowAIPrompt] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [theme, setTheme] = useState<Theme>("light")
  const [emailLayout, setEmailLayout] = useState<EmailLayout>("compact")
  const [showSettings, setShowSettings] = useState(false)
  const [showNotificationPrefs, setShowNotificationPrefs] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const [filters, setFilters] = useState<string[]>([])
  const [showStarred, setShowStarred] = useState(false)
  const [showScheduleSend, setShowScheduleSend] = useState(false)
  const [scheduledDate, setScheduledDate] = useState<string>("")
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: "1",
      name: "Réunion",
      subject: "Invitation à une réunion",
      content:
        "Bonjour,\n\nJe vous invite à une réunion qui se tiendra le [DATE] à [HEURE] dans [LIEU].\n\nL'ordre du jour sera le suivant:\n- Point 1\n- Point 2\n- Point 3\n\nMerci de confirmer votre présence.\n\nCordialement,",
    },
    {
      id: "2",
      name: "Remerciement",
      subject: "Remerciements",
      content:
        "Bonjour,\n\nJe tenais à vous remercier pour [RAISON].\n\nVotre contribution a été très appréciée.\n\nCordialement,",
    },
    {
      id: "3",
      name: "Excuse",
      subject: "Veuillez nous excuser",
      content:
        "Bonjour,\n\nJe vous prie de bien vouloir nous excuser pour [INCIDENT].\n\nNous mettons tout en œuvre pour résoudre ce problème dans les plus brefs délais.\n\nCordialement,",
    },
  ])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Users list
  const [users] = useState<User[]>([
    {
      id: "1",
      name: "Alice Dupont",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      email: "alice@example.com",
    },
    {
      id: "2",
      name: "Bob Martin",
      avatar:
        "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      email: "bob@example.com",
    },
    {
      id: "3",
      name: "Charlie Tech",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      email: "charlie@example.com",
    },
    {
      id: "4",
      name: "Diana Wong",
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      email: "diana@example.com",
    },
    {
      id: "5",
      name: "Ethan Jones",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      email: "ethan@example.com",
    },
  ])

  // Theme toggle
  useEffect(() => {
    const root = document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [theme])

  // Screen size monitoring
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Auto-delete emails in trash older than 15 days
  useEffect(() => {
    const interval = setInterval(() => {
      setEmails((prev) =>
        prev.filter((email) => {
          if (email.folder === "trash" && email.deletedAt) {
            return Date.now() - email.deletedAt < 15 * 24 * 3600 * 1000
          }
          return true
        }),
      )
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Initial mock data
  useEffect(() => {
    const mockEmails: Email[] = [
      {
        id: "1",
        subject: "Réunion de projet",
        sender: "alice@example.com",
        recipient: "moi@example.com",
        content:
          "Bonjour,\n\nMerci de confirmer votre présence à la réunion de présentation du nouveau projet qui aura lieu jeudi à 10h dans la salle de conférence principale. \n\nL'ordre du jour sera le suivant:\n- Présentation des objectifs\n- Répartition des tâches\n- Planning prévisionnel\n\nCordialement,\nAlice",
        timestamp: new Date().toISOString(), // Format ISO 8601 standard
        read: false,
        aiGenerated: false,
        folder: "inbox",
        priority: "high",
        starred: true,
        important: true,
        spans: ["Travail", "Projet X"],
        thread: [
          {
            id: "1-1",
            content: "Je suis disponible jeudi, merci pour l'invitation.",
            sender: "moi@example.com",
            timestamp: new Date(Date.now() - 86400000).toLocaleString(),
          },
          {
            id: "1-2",
            content:
              "Parfait, à jeudi 10h dans la salle de conférence principale. N'oubliez pas d'apporter vos documents.",
            sender: "alice@example.com",
            timestamp: new Date(Date.now() - 43200000).toLocaleString(),
          },
        ],
      },
      {
        id: "2",
        subject: "Rapport mensuel",
        sender: "bob@example.com",
        recipient: "moi@example.com",
        content:
          "Bonjour,\n\nVeuillez trouver ci-joint le rapport mensuel d'activité. Merci de me faire partie de vos retours avant vendredi.\n\nCordialement,\nBob",
        timestamp: new Date(Date.now() - 172800000).toLocaleString(),
        read: true,
        aiGenerated: false,
        folder: "inbox",
        priority: "normal",
        starred: false,
        important: false,
        spans: ["Travail"],
        thread: [],
      },
      {
        id: "3",
        subject: "Demande de congés",
        sender: "charlie@example.com",
        recipient: "moi@example.com",
        content:
          "Bonjour,\n\nJe souhaiterais poser des congés du 15 au 30 mars. Est-ce possible ?\n\nMerci d'avance,\nCharlie",
        timestamp: new Date(Date.now() - 259200000).toLocaleString(),
        read: true,
        aiGenerated: false,
        folder: "inbox",
        priority: "low",
        starred: false,
        important: false,
        spans: ["Personnel"],
        thread: [],
      },
      {
        id: "4",
        subject: "Brouillon: Idées pour la prochaine réunion",
        sender: "moi@example.com",
        recipient: "",
        content: "Points à discuter:\n- Nouvelles fonctionnalités\n- Calendrier\n- Budget",
        timestamp: new Date(Date.now() - 345600000).toLocaleString(),
        read: true,
        aiGenerated: false,
        folder: "drafts",
        priority: "normal",
        starred: false,
        important: false,
        thread: [],
      },
      {
        id: "5",
        subject: "Re: Problème technique",
        sender: "moi@example.com",
        recipient: "support@example.com",
        content: "Bonjour,\n\nMerci pour votre aide, le problème est maintenant résolu.\n\nCordialement,",
        timestamp: new Date(Date.now() - 432000000).toLocaleString(),
        read: true,
        aiGenerated: false,
        folder: "sent",
        priority: "normal",
        starred: false,
        important: false,
        thread: [],
      },
      {
        id: "6",
        subject: "Proposition de collaboration",
        sender: "diana@example.com",
        recipient: "moi@example.com",
        content:
          "Bonjour,\n\nSuite à notre conversation de la semaine dernière, je vous propose un partenariat pour le développement du nouveau projet.\n\nPouvons-nous planifier un appel pour en discuter plus en détail?\n\nBien cordialement,\nDiana",
        timestamp: new Date(Date.now() - 518400000).toLocaleString(),
        read: false,
        aiGenerated: false,
        folder: "inbox",
        priority: "high",
        starred: true,
        important: true,
        spans: ["Travail", "Urgent"],
        thread: [],
      },
      {
        id: "7",
        subject: "Mise à jour du système",
        sender: "ethan@example.com",
        recipient: "moi@example.com",
        content:
          "Bonjour,\n\nNous allons procéder à une mise à jour du système ce weekend. Le service sera indisponible de samedi 22h à dimanche 6h.\n\nCordialement,\nL'équipe technique",
        timestamp: new Date(Date.now() - 604800000).toLocaleString(),
        read: true,
        aiGenerated: false,
        folder: "inbox",
        priority: "normal",
        starred: false,
        important: false,
        spans: ["Travail"],
        thread: [],
      },
    ]
    setEmails(mockEmails)
  }, [])

  // Attachment handling
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      // Check if files are too large (limit: 20MB)
      const oversizedFiles = Array.from(files).filter((file) => file.size > 20 * 1024 * 1024)
      if (oversizedFiles.length > 0) {
        toast.error("Certains fichiers dépassent la limite de 20MB", {
          description: "Veuillez sélectionner des fichiers plus petits.",
          duration: 3000,
        })
        return
      }
      const newAttachments = [...attachments, ...Array.from(files)]
      setAttachments(newAttachments)
      e.target.value = ""

      // Success notification with animation
      toast.success("Pièce(s) jointe(s) ajoutée(s)", {
        description: `${files.length} fichier(s) ajouté(s) au message`,
        duration: 2000,
      })
    }
  }

  // AI content generation simulation
  const handleAIGeneration = async () => {
    if (!aiPrompt.trim()) return
    setIsGenerating(true)
    try {
      // Simulate AI generation with a delay
      const aiResponse = await new Promise<string>((resolve) =>
        setTimeout(
          () =>
            resolve(
              `Bonjour,\n\nSuite à votre demande "${aiPrompt}", voici un message professionnel généré automatiquement.\n\nLes points principaux que j'ai inclus:\n- Une introduction professionnelle et concise\n- Des détails pertinents basés sur votre demande\n- Une conclusion appropriée\n\nN'hésitez pas à modifier ce contenu selon vos besoins.\n\nCordialement,\n[Votre nom]`,
            ),
          1500,
        ),
      )
      const updatedEmail = {
        ...newEmail,
        content: aiResponse,
        aiGenerated: true,
      }
      setNewEmail(updatedEmail)
      setShowAIPrompt(false)
      setAiPrompt("")
      textareaRef.current?.focus()

      // Success notification with animation
      toast.success("Contenu généré avec succès", {
        duration: 3000,
      })
    } catch (error) {
      toast.error("Erreur lors de la génération du contenu", {
        description: "Veuillez réessayer plus tard.",
        duration: 3000,
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Send email
  const handleSend = (e: FormEvent) => {
    e.preventDefault()
    if (!newEmail.recipient) {
      toast.warning("Veuillez sélectionner un destinataire", {
        description: "Un destinataire est requis pour envoyer le message.",
        duration: 3000,
      })
      return
    }
    if (!newEmail.subject) {
      toast.warning("Votre message n'a pas d'objet", {
        description: "Le message sera envoyé sans objet.",
        duration: 3000,
      })
    }

    if (showScheduleSend && scheduledDate) {
      const scheduleTime = new Date(scheduledDate).getTime()
      const currentTime = new Date().getTime()

      if (scheduleTime <= currentTime) {
        toast.error("La date programmée doit être dans le futur", {
          duration: 3000,
        })
        return
      }

      toast.success("Message programmé pour envoi ultérieur", {
        description: `Sera envoyé le ${format(new Date(scheduledDate), "dd MMMM à HH:mm", { locale: fr })}`,
        duration: 3000,
      })

      // Simulate scheduled sending with setTimeout
      setTimeout(() => {
        sendEmailNow()
        toast.success("Message programmé envoyé", {
          description: `à ${new Date().toLocaleTimeString()}`,
          duration: 3000,
        })
      }, scheduleTime - currentTime)

      setShowScheduleSend(false)
      setScheduledDate("")
      setView("inbox")
      return
    }

    sendEmailNow()
  }

  const handleAddNewLabel = () => {
    if (newLabelText.trim()) {
      setSpans([...spans, newLabelText.trim()])
      setSelectedspans([...selectedspans, newLabelText.trim()])
      setNewLabelText("")
      setIsAddLabelDialogOpen(false)
    }
  }
  const handleAddNewTag = () => {
    // Demande à l'utilisateur de saisir le nom de la nouvelle étiquette.
    const newTag = prompt("Entrez le nom de la nouvelle étiquette:")
    // Vérifie que la saisie existe et qu'elle n'est pas déjà présente dans les étiquettes.
    if (newTag && !spans.includes(newTag)) {
      // Ajoute la nouvelle étiquette à la liste.
      setSpans([...spans, newTag])
    }
  }

  const sendEmailNow = () => {
    const email: Email = {
      id: Date.now().toString(),
      subject: newEmail.subject || "(Sans objet)",
      sender: "moi@example.com",
      recipient: newEmail.recipient || "",
      content: newEmail.content || "",
      timestamp: new Date().toISOString(), // Format ISO 8601 standard
      attachments,
      read: false,
      aiGenerated: newEmail.aiGenerated || false,
      folder: "sent",
      priority: (newEmail.priority as Priority) || "normal",
      thread: [],
      spans: selectedspans.length > 0 ? [...selectedspans] : undefined,
      starred: false,
      important: false,
    }
    setEmails((prev) => [email, ...prev])
    setNewEmail({})
    setAttachments([])
    setSelectedspans([])
    setView("inbox")
    setSelectedCategory("sent")

    // Success notification with animation
    toast.success("Message envoyé", {
      description: `à ${email.recipient}`,
      duration: 2000,
    })
  }

  // Save draft
  const handleSaveDraft = () => {
    if (!newEmail.subject && !newEmail.content) {
      toast.error("Impossible d'enregistrer un brouillon vide", {
        description: "Ajoutez du contenu ou un objet avant de sauvegarder.",
        duration: 3000,
      })
      return
    }
    const draft: Email = {
      id: Date.now().toString(),
      subject: newEmail.subject || "(Sans objet)",
      sender: "moi@example.com",
      recipient: newEmail.recipient || "",
      content: newEmail.content || "",
      timestamp: new Date().toISOString(), // Format ISO 8601 standard
      attachments,
      read: false,
      aiGenerated: newEmail.aiGenerated || false,
      folder: "drafts",
      priority: (newEmail.priority as Priority) || "normal",
      thread: [],
      spans: selectedspans.length > 0 ? [...selectedspans] : undefined,
      starred: false,
      important: false,
    }
    setEmails((prev) => [draft, ...prev])
    setNewEmail({})
    setAttachments([])
    setSelectedspans([])
    setView("inbox")
    setSelectedCategory("drafts")

    // Success notification with animation
    toast.success("Brouillon enregistré", {
      duration: 2000,
    })
  }

  const safeParseDate = (timestamp: string) => {
    const date = new Date(timestamp)

    // Vérifie si la date est valide
    if (isNaN(date.getTime())) {
      console.error("Date invalide :", timestamp)
      return new Date() // Retourne la date actuelle comme fallback
    }

    return date
  }
  // Delete email (move to trash)
  const handleDeleteEmail = (emailId: string) => {
    setEmails((prev) =>
      prev.map((email) => {
        if (email.id === emailId) {
          return { ...email, folder: "trash", deletedAt: Date.now() }
        }
        return email
      }),
    )
    setSelectedEmail(null)

    // Success notification with animation
    toast.success("Message déplacé vers la corbeille", {
      description: "Vous pouvez le récupérer depuis le dossier Corbeille",
      duration: 2000,
    })
  }

  // Toggle star status
  const handleToggleStar = (emailId: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation()

    setEmails((prev) =>
      prev.map((email) => {
        if (email.id === emailId) {
          const newStarred = !email.starred

          if (newStarred) {
            toast.success("Message marqué comme favori", {
              duration: 1500,
            })
          }

          return { ...email, starred: newStarred }
        }
        return email
      }),
    )
  }

  // Toggle important status
  const handleToggleImportant = (emailId: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation()

    setEmails((prev) =>
      prev.map((email) => {
        if (email.id === emailId) {
          return { ...email, important: !email.important }
        }
        return email
      }),
    )
  }

  // Archive email
  const handleArchiveEmail = (emailId: string) => {
    setEmails((prev) =>
      prev.map((email) => {
        if (email.id === emailId) {
          return { ...email, folder: "archived" }
        }
        return email
      }),
    )
    setSelectedEmail(null)

    toast.success("Message archivé", {
      duration: 2000,
    })
  }

  // Restore email from trash
  const handleRestoreEmail = (emailId: string) => {
    setEmails((prev) =>
      prev.map((email) => {
        if (email.id === emailId) {
          return { ...email, folder: "inbox", deletedAt: undefined }
        }
        return email
      }),
    )
    setSelectedEmail(null)

    toast.success("Message restauré dans la boîte de réception", {
      duration: 2000,
    })
  }

  // Move email to specific folder
  const handleMoveEmail = (emailId: string, targetFolder: Category) => {
    setEmails((prev) =>
      prev.map((email) => {
        if (email.id === emailId) {
          return { ...email, folder: targetFolder }
        }
        return email
      }),
    )
    setSelectedEmail(null)

    toast.success(`Message déplacé vers ${getFolderName(targetFolder)}`, {
      duration: 2000,
    })
  }

  // Add span to email
  const handleAddspan = (emailId: string, span: string) => {
    setEmails((prev) =>
      prev.map((email) => {
        if (email.id === emailId) {
          const currentspans = email.spans || []
          if (!currentspans.includes(span)) {
            return { ...email, spans: [...currentspans, span] }
          }
        }
        return email
      }),
    )
  }

  // Remove span from email
  const handleRemovespan = (emailId: string, span: string) => {
    setEmails((prev) =>
      prev.map((email) => {
        if (email.id === emailId && email.spans) {
          return { ...email, spans: email.spans.filter((l) => l !== span) }
        }
        return email
      }),
    )
  }

  // Apply template to new email
  const handleApplyTemplate = (template: Template) => {
    setNewEmail({
      ...newEmail,
      subject: template.subject,
      content: template.content,
    })
    setShowTemplates(false)
  }

  // Filter emails by category, search, and sorting
  const getFilteredEmails = () => {
    let filtered = emails

    // Filter by folder
    if (selectedCategory !== "starred") {
      filtered = filtered.filter((email) => email.folder === selectedCategory)
    } else {
      filtered = filtered.filter((email) => email.starred === true)
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (email) =>
          email.subject.toLowerCase().includes(query) ||
          email.content.toLowerCase().includes(query) ||
          email.sender.toLowerCase().includes(query) ||
          email.recipient.toLowerCase().includes(query),
      )
    }

    // Apply span filters
    if (filters.length > 0) {
      filtered = filtered.filter((email) => {
        if (!email.spans) return false
        return filters.some((filter) => email.spans?.includes(filter))
      })
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      if (sortOption === "dateAsc") {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      } else if (sortOption === "dateDesc") {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      } else if (sortOption === "priority") {
        const prioOrder: Record<Priority, number> = {
          high: 3,
          normal: 2,
          low: 1,
        }
        return prioOrder[b.priority] - prioOrder[a.priority]
      }
      return 0
    })
  }

  // Reply and Forward actions
  const handleReply = () => {
    if (!selectedEmail) return
    setView("compose")
    setNewEmail({
      recipient: selectedEmail.sender,
      subject: `Re: ${selectedEmail.subject}`,
      content: `\n\n----- Message original de ${selectedEmail.sender} le ${format(safeParseDate(selectedEmail.timestamp), "d MMMM yyyy à HH:mm", { locale: fr })} -----\n${selectedEmail.content}`,
    })
  }

  const handleForward = () => {
    if (!selectedEmail) return
    setView("compose")
    setNewEmail({
      recipient: "",
      subject: `Fwd: ${selectedEmail.subject}`,
      content: `\n\n----- Message transféré -----\nDe: ${selectedEmail.sender}\nDate: ${format(safeParseDate(selectedEmail.timestamp), "d MMMM yyyy à HH:mm", { locale: fr })}\nObjet: ${selectedEmail.subject}\n\n${selectedEmail.content}`,
    })

    // Forward attachments if any
    if (selectedEmail.attachments && selectedEmail.attachments.length > 0) {
      setAttachments([...selectedEmail.attachments])
    }
  }

  // Mark email as read
  const handleSelectEmail = (email: Email) => {
    if (!email.read) {
      setEmails((prev) => prev.map((e) => (e.id === email.id ? { ...e, read: true } : e)))
    }
    setSelectedEmail(email)
  }

  // Utility functions
  const getPriorityColor = (priority: Priority) => {
    if (priority === "high") return "bg-red-500"
    if (priority === "normal") return "bg-amber-400"
    return "bg-green-500"
  }

  const getPriorityBadge = (priority: Priority) => {
    if (priority === "high") return <Badge variant="destructive">Important</Badge>
    if (priority === "normal") return <Badge variant="outline">Normal</Badge>
    return <Badge variant="secondary">Faible</Badge>
  }

  const getRelativeTime = (timestamp: string) => {
    try {
      const date = safeParseDate(timestamp)

      if (isNaN(date.getTime())) {
        return "Date invalide"
      }
      const now = new Date()
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays === 0) {
        return format(date, "HH:mm", { locale: fr })
      } else if (diffDays < 7) {
        return format(date, "EEE", { locale: fr })
      } else {
        return format(date, "dd MMM", { locale: fr })
      }
    } catch (e) {
      console.error("Erreur de date :", e)
      return timestamp
    }
  }

  const getFolderName = (folder: Category) => {
    const folderNames: Record<Category, string> = {
      inbox: "Boîte de réception",
      drafts: "Brouillons",
      sent: "Envoyés",
      trash: "Corbeille",
      starred: "Favoris",
      important: "Important",
      archived: "Archives",
    }
    return folderNames[folder]
  }

  const getEmailCount = (folder: Category) => {
    if (folder === "starred") {
      return emails.filter((email) => email.starred).length
    }
    return emails.filter((email) => email.folder === folder).length
  }

  const getUnreadCount = (folder: Category) => {
    if (folder === "starred") {
      return emails.filter((email) => email.starred && !email.read).length
    }
    return emails.filter((email) => email.folder === folder && !email.read).length
  }

  const filteredEmails = getFilteredEmails()

  // Render component
  return (
    <div className={`h-screen flex flex-col ${theme === "dark" ? "dark-theme" : ""} transition-colors`}>
      {" "}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div
          className={cn(
            "h-full bg-sidebar flex flex-col border-r border-border transition-all duration-300 dark:bg-gray-900",
            sidebarOpen ? "w-64" : "w-16",
          )}
        >
          <div className="p-3 flex justify-between items-center">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="text-primary">
              <List className="h-5 w-5" />
            </Button>
            {sidebarOpen && <span className="font-semibold text-primary"></span>}
          </div>
          <div className="flex justify-center my-4">
            <Button
              size={sidebarOpen ? "default" : "icon"}
              onClick={() => {
                setView("compose")
                setNewEmail({})
                setSelectedEmail(null)
              }}
              className={cn(
                "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300",
                sidebarOpen ? "w-[90%] px-4 py-2 min-h-[44px]" : "w-12 h-12",
              )}
            >
              <PenSquare className={cn("h-5 w-5", sidebarOpen && "mr-2")} />
              {sidebarOpen && <span>Nouveau message</span>}
            </Button>
          </div>
          <ScrollArea className="flex-1 overflow-auto">
            <div className="space-y-1 px-2 mt-2">
              {[
                { id: "inbox", span: "Boîte de réception", icon: <Inbox className="h-5 w-5" /> },
                { id: "starred", span: "Favoris", icon: <Star className="h-5 w-5" /> },
                { id: "important", span: "Important", icon: <AlertCircle className="h-5 w-5" /> },
                { id: "drafts", span: "Brouillons", icon: <FileEdit className="h-5 w-5" /> },
                { id: "sent", span: "Envoyés", icon: <SendHorizontal className="h-5 w-5" /> },
                { id: "archived", span: "Archives", icon: <Archive className="h-5 w-5" /> },
                { id: "trash", span: "Corbeille", icon: <Trash2 className="h-5 w-5" /> },
              ].map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "secondary" : "ghost"}
                  className={cn("w-full justify-start", selectedCategory === category.id && "bg-accent/20 font-medium")}
                  onClick={() => {
                    setSelectedCategory(category.id as Category)
                    setSelectedEmail(null)
                    setView("inbox")
                  }}
                >
                  <span className={cn("flex items-center gap-2", !sidebarOpen && "justify-center w-full")}>
                    {category.icon}
                    {sidebarOpen && <span className="flex-1 truncate">{category.span}</span>}
                    {sidebarOpen && getUnreadCount(category.id as Category) > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {getUnreadCount(category.id as Category)}
                      </Badge>
                    )}
                  </span>
                </Button>
              ))}
            </div>

            {sidebarOpen && (
              <>
                <Separator className="my-4 mx-2" />
                <div className="px-3 mb-2">
                  <h3 className="text-sm font-medium mb-2">Étiquettes</h3>
                  <div className="space-y-1">
                    {spans.map((span) => (
                      <div
                        key={span}
                        className="flex items-center justify-between py-1 px-2 rounded hover:bg-accent/10 cursor-pointer text-sm"
                        onClick={() => {
                          if (filters.includes(span)) {
                            setFilters(filters.filter((f) => f !== span))
                          } else {
                            setFilters([...filters, span])
                          }
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <BookmarkIcon className="h-4 w-4" />
                          {span}
                        </span>
                        {filters.includes(span) && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </ScrollArea>

          <div className="p-3 border-t border-border">
            <div className="flex items-center justify-between">
              {sidebarOpen ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="w-full justify-start"
                >
                  <Palette className="h-4 w-4 mr-2" />
                  <span>Paramètres</span>
                </Button>
              ) : (
                <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
                  <Palette className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col h-full bg-background">
          {/* Search and sort bar */}
          <div className="bg-card/50 p-3 border-b flex items-center justify-between gap-2 backdrop-blur-sm sticky top-0 z-10">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-background/40 focus:bg-background"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => {
                  // Refresh animation
                  toast.success("Actualisation des messages")
                }}
                title="Actualiser"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-card" align="end">
                  <DropdownMenuItem onClick={() => setSortOption("dateDesc")}>Date (plus récentes)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOption("dateAsc")}>Date (plus anciennes)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOption("priority")}>Priorité</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Email list */}
            {view === "inbox" && (!selectedEmail || !isMobileView) && (
              <div
                className={cn(
                  "border-r overflow-y-auto",
                  selectedEmail && !isMobileView ? "w-1/2 md:w-[45%] lg:w-[35%]" : "w-full",
                )}
              >
                {filteredEmails.length === 0 ? (
                  <div className="flex items-center justify-center h-full p-6 text-center">
                    <div className="max-w-xs">
                      <h3 className="font-medium mb-1">Aucun message</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedCategory === "inbox"
                          ? "Votre boîte de réception est vide"
                          : `Aucun message dans ${getFolderName(selectedCategory)}`}
                      </p>
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="h-full w-full scroll-smooth">
                    <div className="divide-y mt-0  pt-0  divide-border ">
                      {filteredEmails.map((email) => {
                        const user = users.find((u) => u.email === email.sender)

                        return (
                          <div
                            key={email.id}
                            onClick={() => handleSelectEmail(email)}
                            className={cn(
                              "w-full flex items-start gap-3 cursor-pointer group transition-all duration-150 py-1 px-3",
                              "hover:bg-purple-100/30 dark:hover:bg-purple-900/10",
                              // Bande verticale épaisse pour tous les messages
                              "border-l-8 border-purple-700 pt-1 pb-3   mb-1",
                            )}
                          >
                            {/* Avatar */}
                            <div className="flex-shrink-0 mt-0.5">
                              <Avatar className="h-10 w-10 border border-border shadow-sm">
                                {user?.avatar ? (
                                  <>
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                  </>
                                ) : (
                                  <AvatarFallback>{email.sender.charAt(0).toUpperCase()}</AvatarFallback>
                                )}
                              </Avatar>
                            </div>

                            {/* Email Content */}
                            <div className="min-w-0 flex-1">
                              {/* Header : nom et date sur toute la largeur */}
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-base font-semibold text-foreground truncate">
                                  {user?.name || email.sender.split("@")[0]}
                                </span>
                                <div className="flex items-center gap-1">
                                  {/* Vérifie d'abord que email.attachments existe et contient au moins un élément */}
                                  {email.attachments && email.attachments.length > 0 && (
                                    <Paperclip className="h-4 w-4 text-purple-400" />
                                  )}
                                  <span className="text-base text-muted-foreground whitespace-nowrap">
                                    {getRelativeTime(email.timestamp)}
                                  </span>
                                </div>
                              </div>

                              {/* Sujet et action (étoile) */}
                              <div className="flex items-center gap-3 mb-1">
                                <span className={`w-2 h-2 rounded-full ${getPriorityColor(email.priority)}`} />
                                <span className="truncate flex-1 text-base font-medium text-foreground">
                                  {email.subject}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => handleToggleStar(email.id, e)}
                                >
                                  {email.starred ? (
                                    <Star className="h-5 w-5 fill-purple-500 text-purple-500" />
                                  ) : (
                                    <Star className="h-5 w-5 text-muted-foreground" />
                                  )}
                                </Button>
                              </div>

                              {/* Prévisualisation du contenu */}
                              {emailLayout !== "compact" && (
                                <p className="text-base text-muted-foreground leading-snug line-clamp-2">
                                  {email.content.replace(/\n/g, " ")}
                                </p>
                              )}

                              {/* Badges / Tags */}
                              {email.spans && email.spans.length > 0 && emailLayout === "expanded" && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {email.spans.map((span) => (
                                    <Badge
                                      key={span}
                                      variant="outline"
                                      className="text-sm py-0.5 px-1 h-5 border-purple-300 text-purple-700"
                                    >
                                      {span}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                )}
              </div>
            )}

            {/* Selected email view */}
            {view === "inbox" && selectedEmail && (
              <div className="flex-1 h-full flex flex-col animate-fade-in bg-background">
                <div className="sticky top-0 z-10 bg-card/90 backdrop-blur-sm border-b p-3 flex items-center justify-between">
                  <Button variant="ghost" size="sm" className="gap-2" onClick={() => setSelectedEmail(null)}>
                    <ArrowLeft className="h-4 w-4" />
                    Retour
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={selectedEmail.starred ? "default" : "outline"}
                      size="sm"
                      className={cn("gap-1", selectedEmail.starred && "bg-yellow-500 hover:bg-yellow-600")}
                      onClick={() => handleToggleStar(selectedEmail.id)}
                    >
                      {selectedEmail.starred ? (
                        <>
                          <StarOff className="h-4 w-4" />
                          <span className="hidden sm:inline">Retirer des favoris</span>
                        </>
                      ) : (
                        <>
                          <Star className="h-4 w-4" />
                          <span className="hidden sm:inline">Ajouter aux favoris</span>
                        </>
                      )}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1">
                          <MoreVertical className="h-4 w-4" />
                          <span className="hidden sm:inline">Plus</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card">
                        <DropdownMenuItem onClick={handleReply}>
                          <Reply className="h-4 w-4 mr-2" />
                          Répondre
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleForward}>
                          <Forward className="h-4 w-4 mr-2" />
                          Transférer
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleArchiveEmail(selectedEmail.id)}>
                          <Archive className="h-4 w-4 mr-2" />
                          Archiver
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleImportant(selectedEmail.id)}
                          className={selectedEmail.important ? "text-amber-500" : ""}
                        >
                          <AlertCircle className="h-4 w-4 mr-2" />
                          {selectedEmail.important ? "Retirer l'importance" : "Marquer comme important"}
                        </DropdownMenuItem>
                        {selectedEmail.folder === "trash" ? (
                          <DropdownMenuItem onClick={() => handleRestoreEmail(selectedEmail.id)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Restaurer
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleDeleteEmail(selectedEmail.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <ScrollArea className="flex-1 overflow-y-auto p-4 md:p-6">
                  <div className="max-w-3xl mx-auto">
                    <div className="bg-card rounded-xl p-4 md:p-6 shadow-md border animate-fade-in">
                      <h1 className="text-xl md:text-2xl font-bold mb-4">{selectedEmail.subject}</h1>

                      <div className="flex items-start gap-4 mb-6">
                        <Avatar className="h-12 w-12 border-2 border-background">
                          <AvatarImage
                            src={users.find((u) => u.email === selectedEmail.sender)?.avatar}
                            alt={users.find((u) => u.email === selectedEmail.sender)?.name || selectedEmail.sender}
                          />
                          <AvatarFallback>
                            {(users.find((u) => u.email === selectedEmail.sender)?.name || selectedEmail.sender)
                              .charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-lg flex items-start justify-between">
                            <div className="truncate flex-1">
                              {users.find((u) => u.email === selectedEmail.sender)?.name ||
                                selectedEmail.sender.split("@")[0]}
                              <span className="text-sm font-normal text-muted-foreground ml-2">
                                {`<${selectedEmail.sender}>`}
                              </span>
                            </div>

                            <div className="flex-shrink-0 ml-2">{getPriorityBadge(selectedEmail.priority)}</div>
                          </div>

                          <div className="text-sm text-muted-foreground flex flex-wrap gap-x-2 mt-1">
                            <span>À: {selectedEmail.recipient}</span>
                            <span className="hidden sm:inline">·</span>
                            <span className="whitespace-nowrap">
                              {format(new Date(selectedEmail.timestamp), "d MMMM yyyy 'à' HH:mm", {
                                locale: fr, // Option correctement passée
                              })}
                            </span>
                          </div>

                          {selectedEmail.spans && selectedEmail.spans.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {selectedEmail.spans.map((span) => (
                                <Badge key={span} variant="secondary" className="text-xs">
                                  {span}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {selectedEmail.aiGenerated && (
                        <div className="mb-6 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 py-2 px-3 rounded-md border border-blue-200 dark:border-blue-800 flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          <span>Contenu généré par IA</span>
                        </div>
                      )}

                      <div className="prose dark:prose-invert max-w-none mb-6 whitespace-pre-line">
                        {selectedEmail.content}
                      </div>

                      {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-sm font-medium mb-3">
                            Pièces jointes ({selectedEmail.attachments.length})
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {selectedEmail.attachments.map((file, i) => {
                              const isImage = file.type.startsWith("image/")
                              const isPdf = file.type === "application/pdf"
                              const isDoc = file.type.includes("document") || file.type.includes("msword")

                              return (
                                <div
                                  key={i}
                                  className="flex items-center gap-3 bg-accent/40 dark:bg-accent/20 px-3 py-2 rounded-lg text-sm border group hover:bg-accent/80 dark:hover:bg-accent/40 transition-colors"
                                >
                                  <div className="bg-background dark:bg-background/40 rounded-md p-2 flex-shrink-0">
                                    {isImage ? (
                                      <ImageIcon className="h-5 w-5 text-blue-500" />
                                    ) : isPdf ? (
                                      <FileText className="h-5 w-5 text-red-500" />
                                    ) : isDoc ? (
                                      <FileText className="h-5 w-5 text-blue-500" />
                                    ) : (
                                      <Paperclip className="h-5 w-5 text-gray-500" />
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="truncate font-medium">{file.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {(file.size / 1024).toFixed(1)} KB
                                    </div>
                                  </div>

                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Télécharger"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {selectedEmail.thread.length > 0 && (
                        <>
                          <Separator className="my-6" />
                          <div className="space-y-6">
                            <h3 className="text-sm font-medium flex items-center gap-2">
                              <AtSign className="h-3.5 w-3.5" />
                              Conversation précédente
                            </h3>
                            {selectedEmail.thread.map((message) => {
                              const messageUser = users.find((u) => u.email === message.sender)
                              return (
                                <div key={message.id} className="pl-3 border-l-2 border-l-primary/30 animate-fade-in">
                                  <div className="flex items-center gap-3 mb-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage
                                        src={messageUser?.avatar}
                                        alt={messageUser?.name || message.sender}
                                      />
                                      <AvatarFallback>
                                        {(messageUser?.name || message.sender).charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1">
                                      <div className="font-medium">
                                        {messageUser?.name || message.sender.split("@")[0]}
                                      </div>
                                      <span className="whitespace-nowrap">
                                        {format(safeParseDate(selectedEmail.timestamp), "d MMMM yyyy 'à' HH:mm", {
                                          locale: fr,
                                        })}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="text-sm pl-11 whitespace-pre-line">{message.content}</div>
                                </div>
                              )
                            })}
                          </div>
                        </>
                      )}

                      <div className="mt-6 flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={handleReply}>
                          <Reply className="h-4 w-4 mr-1" />
                          Répondre
                        </Button>
                        <Button variant="default" size="sm" onClick={handleForward}>
                          <Forward className="h-4 w-4 mr-1" />
                          Transférer
                        </Button>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Compose view */}
            {view === "compose" && (
              <div className="flex-1 p-4 md:p-6 flex flex-col h-full animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <PenSquare className="h-5 w-5 text-primary" />
                    Nouveau message
                  </h2>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setView("inbox")
                      if (Object.keys(newEmail).length > 0) {
                        const shouldSave = window.confirm("Voulez-vous enregistrer ce brouillon ?")
                        if (shouldSave) handleSaveDraft()
                      }
                    }}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <Card className="flex-1 flex flex-col overflow-hidden border shadow-sm">
                  <form onSubmit={handleSend} className="flex flex-col h-full">
                    <div className="border-b p-4">
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="min-w-20 font-medium">À:</span>
                          <Select
                            value={newEmail.recipient || ""}
                            onValueChange={(value) => setNewEmail({ ...newEmail, recipient: value })}
                          >
                            <SelectTrigger className="w-full bg-background/60">
                              <SelectValue placeholder="Sélectionner un destinataire" />
                            </SelectTrigger>
                            <SelectContent className="bg-background">
                              {users.map((user) => (
                                <SelectItem key={user.id} value={user.email}>
                                  <div className="flex items-center">
                                    <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full mr-2" />
                                    {user.name} ({user.email})
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="min-w-20 font-medium">Objet:</span>
                          <Input
                            id="subject"
                            placeholder="Objet du message"
                            value={newEmail.subject || ""}
                            onChange={(e) => setNewEmail({ ...newEmail, subject: e.target.value })}
                            className="bg-background/60"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="font-medium whitespace-nowrap">Priorité:</span>
                              <Select
                                value={newEmail.priority || "normal"}
                                onValueChange={(value) => setNewEmail({ ...newEmail, priority: value as Priority })}
                              >
                                <SelectTrigger className="w-[150px] bg-background/60">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-background">
                                  <SelectItem value="high">Important</SelectItem>
                                  <SelectItem value="normal">Normal</SelectItem>
                                  <SelectItem value="low">Peu important</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div
                              className={`w-3 h-3 rounded-full ${getPriorityColor(
                                (newEmail.priority as Priority) || "normal",
                              )}`}
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setShowTemplates(true)}
                              className="gap-1"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              Modèles
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button type="button" variant="outline" size="sm" className="gap-1">
                                  <Zap className="h-3.5 w-3.5" />
                                  Options
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-card">
                                <DropdownMenuItem onClick={() => setPreviewMode(!previewMode)}>
                                  {previewMode ? (
                                    <>
                                      <EyeOff className="h-4 w-4 mr-2" />
                                      Désactiver l'aperçu
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Aperçu du message
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setShowScheduleSend(!showScheduleSend)}>
                                  <Clock className="h-4 w-4 mr-2" />
                                  Programmer l'envoi
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setShowNotificationPrefs(true)}>
                                  <Bell className="h-4 w-4 mr-2" />
                                  Notifications de suivi
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {showScheduleSend && (
                          <div className="flex items-center gap-2 p-2 border rounded bg-background/60">
                            <Clock className="h-4 w-4 text-primary" />
                            <span className="whitespace-nowrap">Programmer pour:</span>
                            <Input
                              id="schedule-datetime"
                              type="datetime-local"
                              value={scheduledDate}
                              onChange={(e) => setScheduledDate(e.target.value)}
                              className="bg-background flex-1"
                            />
                          </div>
                        )}

                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-2">
                            <span className="w-full font-medium mb-1 text-purple-900 flex items-center gap-1">
                              <Tag className="h-4 w-4 text-purple-600" />
                              Étiquettes:
                            </span>
                            <div className="flex flex-wrap gap-2 w-full">
                              {spans.map((span) => (
                                <div
                                  key={span}
                                  onClick={() => {
                                    if (selectedspans.includes(span)) {
                                      setSelectedspans(selectedspans.filter((l) => l !== span))
                                    } else {
                                      setSelectedspans([...selectedspans, span])
                                    }
                                  }}
                                  className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer border transition-colors shadow-sm",
                                    selectedspans.includes(span)
                                      ? "bg-purple-600 text-white border-purple-600 hover:bg-purple-700"
                                      : "bg-purple-50 text-purple-800 hover:bg-purple-100 border-purple-200 hover:border-purple-300",
                                  )}
                                >
                                  {span}
                                </div>
                              ))}
                              <div
                                onClick={() => setIsAddLabelDialogOpen(true)}
                                className="px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer border border-dashed border-purple-300 hover:border-purple-500 hover:bg-purple-50 flex items-center gap-1 transition-colors text-purple-700 hover:text-purple-900 shadow-sm"
                              >
                                <PlusCircle className="h-3 w-3" />
                                Nouvelle
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Dialogue pour ajouter une nouvelle étiquette */}
                        <Dialog open={isAddLabelDialogOpen} onOpenChange={setIsAddLabelDialogOpen}>
                          <DialogContent className="bg-purple-50 border-purple-200">
                            <DialogHeader>
                              <DialogTitle className="text-purple-900">Ajouter une nouvelle étiquette</DialogTitle>
                              <DialogDescription className="text-purple-700">
                                Entrez le nom de la nouvelle étiquette ci-dessous.
                              </DialogDescription>
                            </DialogHeader>
                            <Input
                              value={newLabelText}
                              onChange={(e) => setNewLabelText(e.target.value)}
                              placeholder="Nom de l'étiquette"
                              className="mt-4 focus:border-purple-300 focus:ring focus:ring-purple-200"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleAddNewLabel()
                                }
                              }}
                            />
                            <DialogFooter className="mt-4">
                              <Button
                                variant="outline"
                                onClick={() => setIsAddLabelDialogOpen(false)}
                                className="text-purple-700 border-purple-300 hover:bg-purple-50"
                              >
                                Annuler
                              </Button>
                              <Button onClick={handleAddNewLabel} className="bg-purple-600 hover:bg-purple-700">
                                Ajouter
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    <CardContent className="p-0 flex-1 overflow-hidden">
                      {previewMode ? (
                        <div className="h-full overflow-y-auto p-2 compact-email">
                          <div className="prose dark:prose-invert max-w-none whitespace-pre-line">
                            {newEmail.content || (
                              <span className="text-muted-foreground italic">Aperçu du message...</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="relative h-full">
                          <Textarea
                            ref={textareaRef}
                            className="min-h-[200px] h-full resize-none rounded-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-card dark:bg-card/50 compact-email"
                            placeholder="Commencez à écrire..."
                            value={newEmail.content || ""}
                            onChange={(e) => setNewEmail({ ...newEmail, content: e.target.value })}
                          />
                          <div className="absolute bottom-3 right-3 flex gap-2">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => setShowAIPrompt(true)}
                              title="Générer avec l'IA"
                              className="rounded-full bg-primary/10 hover:bg-primary/20"
                            >
                              <Sparkles className="h-4 w-4 text-primary" />
                            </Button>
                            <input
                              type="file"
                              multiple
                              ref={fileInputRef}
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => fileInputRef.current?.click()}
                              title="Ajouter des pièces jointes"
                              className="rounded-full bg-primary/10 hover:bg-primary/20"
                            >
                              <Paperclip className="h-4 w-4 text-primary" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>

                    {attachments.length > 0 && (
                      <div className="p-3 border-t bg-muted/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Pièces jointes ({attachments.length})</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setAttachments([])}
                          >
                            Tout supprimer
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {attachments.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-lg text-sm border group hover:bg-accent/10 transition-colors"
                            >
                              <Paperclip className="h-3.5 w-3.5 text-primary" />
                              <span className="max-w-[150px] truncate">{file.name}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 rounded-full hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => {
                                  const newAttachments = [...attachments]
                                  newAttachments.splice(index, 1)
                                  setAttachments(newAttachments)
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="p-3 border-t flex justify-end gap-2 bg-card/50">
                      <Button type="button" variant="outline" onClick={handleSaveDraft} className="gap-1">
                        <Save className="h-4 w-4" />
                        Brouillon
                      </Button>

                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setView("inbox")
                          if (Object.keys(newEmail).length > 0) {
                            const shouldSave = window.confirm("Voulez-vous enregistrer ce brouillon ?")
                            if (shouldSave) handleSaveDraft()
                          }
                        }}
                      >
                        Annuler
                      </Button>

                      <Button
                        type="submit"
                        variant="default"
                        className="gap-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                      >
                        <Send className="h-4 w-4" />
                        {showScheduleSend && scheduledDate ? "Programmer" : "Envoyer"}
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>
            )}

            {/* Template view */}
            {view === "template" && selectedTemplate && (
              <div className="flex-1 p-4 md:p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Modifier le modèle</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setView("inbox")
                      setSelectedTemplate(null)
                    }}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <Card className="flex-1 flex flex-col overflow-hidden border shadow-sm">
                  <CardContent className="p-4 flex flex-col h-full">
                    <div className="space-y-4 flex-1">
                      <div className="space-y-2">
                        <span>Nom du modèle</span>
                        <Input
                          id="template-name"
                          value={selectedTemplate.name}
                          onChange={(e) => {
                            setSelectedTemplate({
                              ...selectedTemplate,
                              name: e.target.value,
                            })
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <span>Objet</span>
                        <Input
                          id="template-subject"
                          value={selectedTemplate.subject}
                          onChange={(e) => {
                            setSelectedTemplate({
                              ...selectedTemplate,
                              subject: e.target.value,
                            })
                          }}
                        />
                      </div>

                      <div className="space-y-2 flex-1">
                        <span>Contenu</span>
                        <Textarea
                          id="template-content"
                          value={selectedTemplate.content}
                          onChange={(e) => {
                            setSelectedTemplate({
                              ...selectedTemplate,
                              content: e.target.value,
                            })
                          }}
                          className="min-h-[250px] h-full"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setView("inbox")
                          setSelectedTemplate(null)
                        }}
                      >
                        Annuler
                      </Button>
                      <Button
                        type="button"
                        variant="default"
                        onClick={() => {
                          setTemplates((prev) => prev.map((t) => (t.id === selectedTemplate.id ? selectedTemplate : t)))
                          setView("inbox")
                          setSelectedTemplate(null)
                          toast.success("Modèle enregistré")
                        }}
                      >
                        Enregistrer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Dialogs */}
      <Dialog open={showAIPrompt} onOpenChange={setShowAIPrompt}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Génération de message par IA
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Décrivez le contenu que vous souhaitez générer pour votre message.
            </p>
            <Textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ex: Une réponse professionnelle confirmant ma disponibilité pour une réunion"
              className="min-h-[120px] bg-background/40"
            />

            <div className="bg-accent/40 rounded-md p-3 text-xs text-muted-foreground animate-fade-in">
              <p className="font-semibold mb-1">Suggestions:</p>
              <ul className="space-y-1">
                {[
                  "Une réponse courtoise déclinant une invitation",
                  "Un email de remerciement pour un service rendu",
                  "Une demande de rendez-vous avec un client",
                  "Une note d'information pour l'équipe",
                ].map((suggestion, i) => (
                  <li
                    key={i}
                    className="cursor-pointer hover:text-primary transition-colors"
                    onClick={() => setAiPrompt(suggestion)}
                  >
                    • {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="secondary" onClick={() => setShowAIPrompt(false)}>
              Annuler
            </Button>
            <Button
              variant="default"
              onClick={handleAIGeneration}
              disabled={isGenerating || !aiPrompt.trim()}
              className={isGenerating ? "bg-primary/70" : ""}
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
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
                  Génération...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Générer
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" />
              Paramètres
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Tabs defaultValue="Notifications<">
              <TabsList className="w-full">
                <TabsTrigger value="notifications" className="flex-1">
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="templates" className="flex-1">
                  Modèles
                </TabsTrigger>
              </TabsList>

              <TabsContent value="notifications" className="mt-4 space-y-4">
                <div className="space-y-2">
                  <span>Notifications</span>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      <span>Notifications sonores</span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Headphones className="h-4 w-4" />
                      <span>Sons d'alerte</span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Rappels de réponse</span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="templates" className="mt-4 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <span>Modèles de messages</span>
                  <Button variant="outline" size="sm" className="gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Nouveau</span>
                  </Button>
                </div>

                <div className="space-y-2">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-2 border rounded-md hover:bg-accent/10 cursor-pointer"
                      onClick={() => {
                        setSelectedTemplate(template)
                        setView("template")
                        setShowSettings(false)
                      }}
                    >
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-xs text-muted-foreground">{template.subject}</div>
                      </div>
                      <div className="flex items-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <StickyNote className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="default" onClick={() => setShowSettings(false)} className="w-full sm:w-auto">
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Modèles de messages
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <p className="text-sm text-muted-foreground">Sélectionnez un modèle pour l'appliquer à votre message.</p>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/10 cursor-pointer"
                  onClick={() => handleApplyTemplate(template)}
                >
                  <div>
                    <div className="font-medium">{template.name}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[250px]">{template.subject}</div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplates(false)}>
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showNotificationPrefs} onOpenChange={setShowNotificationPrefs}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              Préférences de notification
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <p className="text-sm text-muted-foreground">Configurer les notifications pour ce message.</p>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>Notification de lecture</span>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Rappel si pas de réponse</span>
                </div>
                <Switch />
              </div>

              <div className="space-y-2">
                <span>Délai de rappel</span>
                <Select defaultValue="3">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 jour</SelectItem>
                    <SelectItem value="2">2 jours</SelectItem>
                    <SelectItem value="3">3 jours</SelectItem>
                    <SelectItem value="7">1 semaine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotificationPrefs(false)} className="mr-2">
              Annuler
            </Button>
            <Button
              variant="default"
              onClick={() => {
                setShowNotificationPrefs(false)
                toast.success("Préférences de notification enregistrées")
              }}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default MailPage
