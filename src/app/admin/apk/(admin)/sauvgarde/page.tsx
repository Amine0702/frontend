"use client"

import { useState, useMemo, useEffect } from "react"
import {
  ArchiveBoxIcon,
  CloudArrowUpIcon,
  ClockIcon,
  ServerIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  SparklesIcon,
  ShieldCheckIcon,
  CogIcon,
  CalendarIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/outline"
import { motion, AnimatePresence } from "framer-motion"
import { ResponsiveContainer, XAxis, Tooltip, AreaChart, Area } from "recharts"

// Couleurs personnalisées
const primaryColor = "#8b5cf6" // Violet principal
const secondaryColor = "#6366f1" // Indigo
const accentColors = {
  blue: "#6366f1",
  purple: "#8b5cf6",
  pink: "#ec4899",
  teal: "#14b8a6",
  green: "#10b981",
}

type Backup = {
  id: number
  timestamp: Date
  status: "success" | "error" | "pending"
  size: string
  type: "auto" | "manual"
  details?: string
}

// Données initiales des sauvegardes
const initialBackups: Backup[] = [
  {
    id: 1,
    timestamp: new Date("2024-03-20T00:30"),
    status: "success",
    size: "2.4 GB",
    type: "auto",
    details: "Sauvegarde complète",
  },
  {
    id: 2,
    timestamp: new Date("2024-03-19T00:30"),
    status: "error",
    size: "N/A",
    type: "auto",
    details: "Erreur de connexion",
  },
  {
    id: 3,
    timestamp: new Date("2024-03-18T12:15"),
    status: "success",
    size: "1.8 GB",
    type: "manual",
    details: "Sauvegarde manuelle",
  },
  {
    id: 4,
    timestamp: new Date("2024-03-17T00:30"),
    status: "success",
    size: "2.2 GB",
    type: "auto",
    details: "Sauvegarde complète",
  },
  {
    id: 5,
    timestamp: new Date("2024-03-16T00:30"),
    status: "success",
    size: "2.1 GB",
    type: "auto",
    details: "Sauvegarde complète",
  },
]

const initialBackupGraphData = [
  { day: "Lun", backups: 2, taille: 4.2 },
  { day: "Mar", backups: 4, taille: 8.6 },
  { day: "Mer", backups: 3, taille: 6.3 },
  { day: "Jeu", backups: 5, taille: 10.5 },
  { day: "Ven", backups: 2, taille: 4.8 },
  { day: "Sam", backups: 1, taille: 2.4 },
  { day: "Dim", backups: 0, taille: 0 },
]

type AdvancedSettings = {
  compression: boolean
  encryption: boolean
  integrityCheck: boolean
  versionHistory: boolean
}

type NotificationType = "success" | "error" | "info" | "warning"

type Notification = {
  id: string
  type: NotificationType
  message: string
}

export default function Sauvegarde() {
  // États principaux
  const [backups, setBackups] = useState<Backup[]>(initialBackups)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [filter, setFilter] = useState<"all" | "auto" | "manual">("all")
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [backupFrequency, setBackupFrequency] = useState<"6h" | "12h" | "24h" | "48h">("24h")
  const [expandedBackupId, setExpandedBackupId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<"historique" | "parametres">("historique")
  const [backupGraphData, setBackupGraphData] = useState(initialBackupGraphData)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>({
    compression: true,
    encryption: true,
    integrityCheck: true,
    versionHistory: true,
  })
  const [isRestoring, setIsRestoring] = useState<number | null>(null)
  const [isDownloading, setIsDownloading] = useState<number | null>(null)
  const [usedSpace, setUsedSpace] = useState(15.2)
  const [totalSpace, setTotalSpace] = useState(24)
  const [showConfirmDelete, setShowConfirmDelete] = useState<number | null>(null)
  const [settingsModified, setSettingsModified] = useState(false)

  // Filtrer les sauvegardes selon le filtre sélectionné
  const filteredBackups = useMemo(() => {
    return backups.filter((backup) => (filter === "all" ? true : backup.type === filter))
  }, [backups, filter])

  // Surveiller les changements de paramètres
  useEffect(() => {
    setSettingsModified(true)
  }, [autoSaveEnabled, backupFrequency, advancedSettings])

  // Fonction pour ajouter une notification
  const addNotification = (type: NotificationType, message: string) => {
    const id = Date.now().toString()
    setNotifications((prev) => [...prev, { id, type, message }])

    // Supprimer la notification après 3 secondes
    setTimeout(() => {
      setNotifications((prev) => prev.filter((notif) => notif.id !== id))
    }, 3000)
  }

  // Fonction pour créer une nouvelle sauvegarde
  const handleCreateBackup = async () => {
    setIsCreatingBackup(true)

    // Simuler le processus de sauvegarde
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Générer une taille aléatoire entre 1.5 et 3.0 GB
    const size = (Math.random() * 1.5 + 1.5).toFixed(1) + " GB"

    // Créer une nouvelle sauvegarde
    const newBackup: Backup = {
      id: Date.now(),
      timestamp: new Date(),
      status: "success",
      size,
      type: "manual",
      details: "Sauvegarde manuelle créée par l'utilisateur",
    }

    // Ajouter la sauvegarde à la liste
    setBackups((prev) => [newBackup, ...prev])

    // Mettre à jour l'espace utilisé
    const sizeInGB = Number.parseFloat(size)
    setUsedSpace((prev) => Math.min(prev + sizeInGB, totalSpace))

    // Mettre à jour les données du graphique
    updateBackupGraphData()

    setIsCreatingBackup(false)
    addNotification("success", "Sauvegarde créée avec succès!")
  }

  // Fonction pour mettre à jour les données du graphique
  const updateBackupGraphData = () => {
    // Simuler une mise à jour des données du graphique
    setBackupGraphData((prev) =>
      prev.map((item) => ({
        ...item,
        backups: item.backups + (Math.random() > 0.7 ? 1 : 0),
        taille: item.backups > 0 ? item.backups * (Math.random() * 1.5 + 1.5) : 0,
      })),
    )
  }

  // Fonction pour restaurer une sauvegarde
  const handleRestore = async (id: number) => {
    setIsRestoring(id)

    // Simuler le processus de restauration
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsRestoring(null)
    addNotification("success", "Sauvegarde restaurée avec succès!")
  }

  // Fonction pour télécharger une sauvegarde
  const handleDownload = async (id: number) => {
    setIsDownloading(id)

    // Trouver la sauvegarde à télécharger
    const backup = backups.find((b) => b.id === id)
    if (!backup) {
      addNotification("error", "Sauvegarde introuvable")
      setIsDownloading(null)
      return
    }

    try {
      // Simuler la génération du fichier de sauvegarde (attendre un peu)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Créer un objet contenant les données de sauvegarde
      const backupData = {
        id: backup.id,
        date: backup.timestamp.toISOString(),
        type: backup.type,
        taille: backup.size,
        contenu: "Contenu de la sauvegarde " + backup.id,
        details: backup.details || "Aucun détail",
        metadata: {
          version: "1.0",
          compression: advancedSettings.compression,
          encryption: advancedSettings.encryption,
          integrityCheck: advancedSettings.integrityCheck,
          dateGeneration: new Date().toISOString(),
        },
      }

      // Convertir en JSON et créer un Blob
      const jsonData = JSON.stringify(backupData, null, 2)
      const blob = new Blob([jsonData], { type: "application/json" })

      // Créer une URL pour le Blob
      const url = URL.createObjectURL(blob)

      // Créer un élément <a> pour déclencher le téléchargement
      const link = document.createElement("a")
      link.href = url

      // Formater la date pour le nom du fichier
      const dateStr = new Intl.DateTimeFormat("fr-FR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
        .format(backup.timestamp)
        .replace(/[/:]/g, "-")

      // Définir le nom du fichier
      link.download = `sauvegarde_${backup.type === "auto" ? "auto" : "manuelle"}_${dateStr}.json`

      // Ajouter l'élément au DOM, cliquer dessus, puis le supprimer
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Libérer l'URL
      URL.revokeObjectURL(url)

      addNotification("success", "Téléchargement terminé!")
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error)
      addNotification("error", "Erreur lors du téléchargement")
    } finally {
      setIsDownloading(null)
    }
  }

  // Fonction pour supprimer une sauvegarde
  const handleDelete = (id: number) => {
    // Supprimer la sauvegarde
    const backupToDelete = backups.find((b) => b.id === id)
    if (backupToDelete && backupToDelete.status === "success") {
      const sizeInGB = Number.parseFloat(backupToDelete.size)
      if (!isNaN(sizeInGB)) {
        setUsedSpace((prev) => Math.max(prev - sizeInGB, 0))
      }
    }

    setBackups((prev) => prev.filter((backup) => backup.id !== id))
    setShowConfirmDelete(null)
    setExpandedBackupId(null)
    addNotification("info", "Sauvegarde supprimée")
  }

  // Fonction pour basculer les détails d'une sauvegarde
  const toggleBackupDetails = (id: number) => {
    if (expandedBackupId === id) {
      setExpandedBackupId(null)
    } else {
      setExpandedBackupId(id)
    }
  }

  // Fonction pour enregistrer les modifications des paramètres
  const saveSettings = () => {
    addNotification("success", "Paramètres enregistrés avec succès!")
    setSettingsModified(false)
  }

  // Fonction pour réinitialiser les paramètres
  const resetSettings = () => {
    setAutoSaveEnabled(true)
    setBackupFrequency("24h")
    setAdvancedSettings({
      compression: true,
      encryption: true,
      integrityCheck: true,
      versionHistory: true,
    })
    addNotification("info", "Paramètres réinitialisés")
    setSettingsModified(false)
  }

  // Fonction pour obtenir la configuration d'état d'une sauvegarde
  const getStatusConfig = (status: Backup["status"]) => {
    const config = {
      success: {
        icon: CheckCircleIcon,
        color: "text-green-500",
        bg: "bg-green-100",
        label: "Succès",
      },
      error: {
        icon: ExclamationTriangleIcon,
        color: "text-rose-500",
        bg: "bg-rose-100",
        label: "Erreur",
      },
      pending: {
        icon: ArrowPathIcon,
        color: "text-amber-500",
        bg: "bg-amber-100",
        label: "En cours",
      },
    }
    return config[status]
  }

  // Fonction pour obtenir l'heure de la prochaine sauvegarde
  const getNextBackupTime = () => {
    const now = new Date()
    let hours = 0

    switch (backupFrequency) {
      case "6h":
        hours = 6
        break
      case "12h":
        hours = 12
        break
      case "24h":
        hours = 24
        break
      case "48h":
        hours = 48
        break
    }

    const nextBackup = new Date(now.getTime() + hours * 60 * 60 * 1000)
    return new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(nextBackup)
  }

  // Fonction pour obtenir l'icône et la couleur d'une notification
  const getNotificationConfig = (type: NotificationType) => {
    const config = {
      success: {
        icon: CheckCircleIcon,
        bg: "bg-green-500",
      },
      error: {
        icon: ExclamationTriangleIcon,
        bg: "bg-rose-500",
      },
      warning: {
        icon: ExclamationTriangleIcon,
        bg: "bg-amber-500",
      },
      info: {
        icon: CloudArrowUpIcon,
        bg: "bg-blue-500",
      },
    }
    return config[type]
  }

  return (
    <section className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl space-y-8">
      {/* Notifications */}
      <AnimatePresence>
        {notifications.map((notification) => {
          const { icon: Icon, bg } = getNotificationConfig(notification.type)
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className={`fixed top-6 right-6 z-50 flex items-center gap-3 ${bg} text-white px-6 py-4 rounded-xl shadow-lg`}
            >
              <Icon className="w-6 h-6" />
              <span>{notification.message}</span>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Confirmation de suppression */}
      <AnimatePresence>
        {showConfirmDelete !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-xl max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Confirmer la suppression</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Êtes-vous sûr de vouloir supprimer cette sauvegarde ? Cette action est irréversible.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmDelete(null)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDelete(showConfirmDelete)}
                  className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors flex items-center gap-2"
                >
                  <TrashIcon className="w-5 h-5" />
                  Supprimer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* En-tête avec animation fluide */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-xl"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <motion.div
            whileHover={{ rotate: -15, scale: 1.1 }}
            className="p-4 bg-white/10 rounded-xl backdrop-blur-sm shadow-inner"
          >
            <CloudArrowUpIcon className="w-14 h-14 text-white" />
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white mb-2">Sauvegarde Automatique</h1>
              <span
                className={`${
                  autoSaveEnabled
                    ? "bg-green-500/20 text-green-100 border-green-500/30"
                    : "bg-rose-500/20 text-rose-100 border-rose-500/30"
                } text-xs font-medium px-3 py-1 rounded-full border`}
              >
                {autoSaveEnabled ? "✅ Active" : "❌ Inactive"}
              </span>
            </div>
            <p className="text-white/90 font-light max-w-2xl">
              Protection automatique de vos données avec chiffrement AES-256 et vérification d'intégrité.
              <span className="block mt-2 text-sm opacity-80 flex items-center gap-2">
                <ClockIcon className="w-4 h-4" />
                Dernière synchronisation:{" "}
                {new Intl.DateTimeFormat("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date())}
              </span>
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreateBackup}
            disabled={isCreatingBackup}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-violet-600 font-medium rounded-xl shadow-lg disabled:opacity-70 transition-all relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <ArrowPathIcon className={`w-5 h-5 ${isCreatingBackup ? "animate-spin" : ""}`} />
              {isCreatingBackup ? "Sauvegarde en cours..." : "Sauvegarder maintenant"}
            </span>
            <div className="absolute inset-0 bg-violet-600/10 opacity-0 hover:opacity-100 transition-opacity" />
          </motion.button>
        </div>
      </motion.header>

      {/* Cartes de statistiques avec effet de profondeur */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: ArchiveBoxIcon,
            title: "Espace utilisé",
            value: `${usedSpace.toFixed(1)} GB`,
            subtitle: `${Math.round((usedSpace / totalSpace) * 100)}% de ${totalSpace} GB`,
            color: accentColors.purple,
          },
          {
            icon: ClockIcon,
            title: "Fréquence",
            value:
              backupFrequency === "6h"
                ? "Toutes les 6h"
                : backupFrequency === "12h"
                  ? "Toutes les 12h"
                  : backupFrequency === "24h"
                    ? "Toutes les 24h"
                    : "Toutes les 48h",
            color: accentColors.blue,
          },
          {
            icon: ServerIcon,
            title: "Prochaine sauvegarde",
            value: getNextBackupTime(),
            subtitle: "Estimation",
            color: accentColors.teal,
          },
          {
            icon: ShieldCheckIcon,
            title: "Niveau de sécurité",
            value: advancedSettings.encryption ? "Élevé" : "Standard",
            subtitle: advancedSettings.encryption ? "Chiffrement AES-256" : "Sans chiffrement",
            color: accentColors.green,
          },
        ].map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: `${card.color}20` }}>
                <card.icon className="w-8 h-8" style={{ color: card.color }} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.title}</h3>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{card.value}</p>
                {card.subtitle && <p className="text-sm text-slate-400 dark:text-slate-500">{card.subtitle}</p>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Onglets */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab("historique")}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
              activeTab === "historique"
                ? "text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-400"
                : "text-slate-600 dark:text-slate-400 hover:text-violet-500 dark:hover:text-violet-300"
            }`}
          >
            <CalendarIcon className="w-5 h-5" />
            Historique
          </button>
          <button
            onClick={() => setActiveTab("parametres")}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
              activeTab === "parametres"
                ? "text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-400"
                : "text-slate-600 dark:text-slate-400 hover:text-violet-500 dark:hover:text-violet-300"
            }`}
          >
            <CogIcon className="w-5 h-5" />
            Paramètres
          </button>
        </div>

        <div className="p-6">
          {activeTab === "historique" ? (
            <div className="space-y-6">
              {/* Filtres */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                  <ChartBarIcon className="w-6 h-6 text-violet-500" />
                  Historique des sauvegardes
                </h3>

                <motion.select
  whileHover={{ scale: 1.02 }}
  value={filter}
  onChange={(e) => setFilter(e.target.value as any)}
  className="w-60 px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik03LjQxIDguNTlMMTIgMTMuMTdsNC41OS00LjU4TDE4IDlsLTYgNi02LTYgMS40MS0xLjQxeiIvPjwvc3ZnPg==')] bg-no-repeat bg-[right_1rem_center]"
>
  <option value="all">Toutes les sauvegardes</option>
  <option value="auto">Automatiques</option>
  <option value="manual">Manuelles</option>
</motion.select>

              </div>

              {/* Liste des sauvegardes */}
              <div className="space-y-3">
                {filteredBackups.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    Aucune sauvegarde trouvée avec les filtres actuels
                  </div>
                ) : (
                  filteredBackups.map((backup, index) => {
                    const { icon: Icon, color, bg, label } = getStatusConfig(backup.status)

                    return (
                      <motion.div
                        key={backup.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="overflow-hidden"
                      >
                        <div
                          onClick={() => toggleBackupDetails(backup.id)}
                          className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${bg} transition-colors`}>
                              <Icon className={`w-5 h-5 ${color}`} />
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              {new Intl.DateTimeFormat("fr-FR", {
                                dateStyle: "long",
                                timeStyle: "short",
                              }).format(backup.timestamp)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${bg} ${color}`}>
                              {backup.type === "auto" ? "Automatique" : "Manuelle"}
                            </span>
                          </div>

                          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                            <span className={`mr-2 ${color}`}>{label}</span>
                            {backup.status === "success" && (
                              <span className="flex items-center gap-1">
                                <DocumentDuplicateIcon className="w-4 h-4" />
                                {backup.size}
                              </span>
                            )}
                          </div>

                          <div className="text-right">
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {expandedBackupId === backup.id ? "Cliquez pour réduire" : "Cliquez pour plus de détails"}
                            </span>
                          </div>
                        </div>

                        {/* Détails de la sauvegarde */}
                        <AnimatePresence>
                          {expandedBackupId === backup.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 rounded-b-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Détails</h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                      {backup.details || "Aucun détail disponible"}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Actions</h4>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleRestore(backup.id)
                                        }}
                                        disabled={isRestoring === backup.id || backup.status !== "success"}
                                        className="px-3 py-1 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1 disabled:opacity-50"
                                      >
                                        {isRestoring === backup.id ? (
                                          <ArrowPathIcon className="w-4 h-4 animate-spin mr-1" />
                                        ) : (
                                          <ArrowUturnLeftIcon className="w-4 h-4 mr-1" />
                                        )}
                                        {isRestoring === backup.id ? "Restauration..." : "Restaurer"}
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleDownload(backup.id)
                                        }}
                                        disabled={isDownloading === backup.id || backup.status !== "success"}
                                        className="px-3 py-1 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1 disabled:opacity-50"
                                      >
                                        {isDownloading === backup.id ? (
                                          <ArrowPathIcon className="w-4 h-4 animate-spin mr-1" />
                                        ) : (
                                          <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                                        )}
                                        {isDownloading === backup.id ? "Téléchargement..." : "Télécharger"}
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setShowConfirmDelete(backup.id)
                                        }}
                                        className="px-3 py-1 text-sm bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded-md hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors flex items-center gap-1"
                                      >
                                        <TrashIcon className="w-4 h-4 mr-1" />
                                        Supprimer
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  })
                )}
              </div>

              {/* Graphique interactif */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-3 mb-6">
                  <SparklesIcon className="w-6 h-6 text-violet-500" />
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Activité des sauvegardes</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={backupGraphData}>
                    <defs>
                      <linearGradient id="colorBackups" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={primaryColor} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={primaryColor} stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="colorTaille" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={secondaryColor} stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="day"
                      stroke="#94a3b8"
                      tick={{ fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#ffffff",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                      formatter={(value, name) => {
                        if (name === "backups") return [`${value} sauvegardes`, "Nombre"]
                        if (name === "taille") return [`${value} GB`, "Taille"]
                        return [value, name]
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="backups"
                      stroke={primaryColor}
                      fillOpacity={1}
                      fill="url(#colorBackups)"
                      strokeWidth={2}
                      dot={{ fill: primaryColor, r: 4 }}
                      activeDot={{ r: 6 }}
                      name="backups"
                    />
                    <Area
                      type="monotone"
                      dataKey="taille"
                      stroke={secondaryColor}
                      fillOpacity={1}
                      fill="url(#colorTaille)"
                      strokeWidth={2}
                      dot={{ fill: secondaryColor, r: 4 }}
                      activeDot={{ r: 6 }}
                      name="taille"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                <CogIcon className="w-6 h-6 text-violet-500" />
                Paramètres de sauvegarde
              </h3>

              <div className="space-y-6">
                {/* Activation de la sauvegarde automatique */}
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-medium text-slate-800 dark:text-slate-200">Sauvegarde automatique</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Activez cette option pour sauvegarder automatiquement vos données selon la fréquence définie
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoSaveEnabled}
                        onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-8 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none rounded-full peer-checked:bg-violet-500 transition-colors">
                        <div className="absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-md transform peer-checked:translate-x-6 transition-all" />
                      </div>
                    </label>
                  </div>
                </div>

                {/* Fréquence de sauvegarde */}
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-3">Fréquence de sauvegarde</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { value: "6h", label: "Toutes les 6h" },
                      { value: "12h", label: "Toutes les 12h" },
                      { value: "24h", label: "Toutes les 24h" },
                      { value: "48h", label: "Toutes les 48h" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setBackupFrequency(option.value as any)}
                        className={`p-3 rounded-lg text-center transition-all ${
                          backupFrequency === option.value
                            ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-2 border-violet-500"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Options avancées */}
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-3">Options avancées</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-700 dark:text-slate-300">Compression des données</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Réduire la taille des sauvegardes</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={advancedSettings.compression}
                          onChange={(e) => setAdvancedSettings((prev) => ({ ...prev, compression: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none rounded-full peer-checked:bg-violet-500 transition-colors">
                          <div className="absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full shadow-md transform peer-checked:translate-x-5 transition-all" />
                        </div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-700 dark:text-slate-300">Chiffrement AES-256</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Protection maximale des données</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={advancedSettings.encryption}
                          onChange={(e) => setAdvancedSettings((prev) => ({ ...prev, encryption: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none rounded-full peer-checked:bg-violet-500 transition-colors">
                          <div className="absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full shadow-md transform peer-checked:translate-x-5 transition-all" />
                        </div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-700 dark:text-slate-300">Vérification d'intégrité</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Détection des corruptions de données
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={advancedSettings.integrityCheck}
                          onChange={(e) =>
                            setAdvancedSettings((prev) => ({ ...prev, integrityCheck: e.target.checked }))
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none rounded-full peer-checked:bg-violet-500 transition-colors">
                          <div className="absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full shadow-md transform peer-checked:translate-x-5 transition-all" />
                        </div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-700 dark:text-slate-300">Conservation des anciennes versions</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Garder l'historique des modifications
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={advancedSettings.versionHistory}
                          onChange={(e) =>
                            setAdvancedSettings((prev) => ({ ...prev, versionHistory: e.target.checked }))
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none rounded-full peer-checked:bg-violet-500 transition-colors">
                          <div className="absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full shadow-md transform peer-checked:translate-x-5 transition-all" />
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={resetSettings}
                    className="px-6 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    Réinitialiser
                  </button>
                  <button
                    onClick={saveSettings}
                    disabled={!settingsModified}
                    className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50"
                  >
                    Enregistrer les modifications
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Informations supplémentaires */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-3 mb-4">
          <ShieldCheckIcon className="w-6 h-6 text-violet-500" />
          Informations sur la sauvegarde
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <p className="text-slate-600 dark:text-slate-400">
              La sauvegarde automatique protège vos données contre les pertes accidentelles et garantit la continuité de
              votre travail.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Toutes les modifications sont enregistrées automatiquement</span>
              </li>
              <li className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Restauration facile en cas de problème</span>
              </li>
              <li className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Chiffrement de bout en bout pour une sécurité maximale</span>
              </li>
              <li className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Conservation de l'historique des versions</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-lg">
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">Conseils d'utilisation</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                <span className="text-violet-500 font-bold">•</span>
                <span>Définissez une fréquence de sauvegarde adaptée à votre rythme de travail</span>
              </li>
              <li className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                <span className="text-violet-500 font-bold">•</span>
                <span>Créez des sauvegardes manuelles avant d'effectuer des modifications importantes</span>
              </li>
              <li className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                <span className="text-violet-500 font-bold">•</span>
                <span>Vérifiez régulièrement l'état de vos sauvegardes</span>
              </li>
              <li className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                <span className="text-violet-500 font-bold">•</span>
                <span>Testez occasionnellement la restauration pour vous assurer que tout fonctionne correctement</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
