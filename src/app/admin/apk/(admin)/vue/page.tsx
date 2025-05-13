"use client";
import {
  ChartBarIcon,
  UsersIcon,
  ClipboardDocumentCheckIcon,
  ArrowTrendingUpIcon,
  BriefcaseIcon,
  ClockIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  SparklesIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CheckCircleIcon,
  PresentationChartLineIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import React from "react";
import { format, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createGlobalStyle } from "styled-components";
import { useGetDashboardDataQuery } from "@/app/state/api";
import type { BackendTeamMember } from "@/app/projects/types/kanban";

// Ajouter des styles CSS personnalisés pour la barre de défilement

const GlobalStyle = createGlobalStyle`
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(139, 92, 246, 0.5);
    border-radius: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(139, 92, 246, 0.7);
  }

  
  
  /* Empêcher le défilement horizontal dans le calendrier */
  .rdp-months {
    width: 100% !important;
    justify-content: center !important;
  }
  
  .rdp-month {
    width: 100% !important;
    max-width: 100% !important;
  }
  
  .rdp-table {
    width: 100% !important;
    max-width: 100% !important;
    table-layout: fixed !important;
  }
  
  .rdp-head_cell {
    font-weight: 600 !important;
    text-transform: uppercase !important;
    font-size: 0.75rem !important;
    text-align: center !important;
    padding: 0.5rem 0 !important;
    color: #6b7280 !important;
  }
  
  .rdp-cell {
    padding: 0 !important;
    text-align: center !important;
    height: 40px !important;
  }
  
  .rdp-button {
    width: 100% !important;
    max-width: 40px !important;
    height: 40px !important;
    margin: 0 auto !important;
    padding: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    border-radius: 9999px !important;
  }
  
  /* Style pour les jours du mois actuel */
  .rdp-day_today:not(.rdp-day_outside) {
    background-color: rgba(139, 92, 246, 0.1) !important;
    font-weight: bold !important;
  }
  
  /* Style pour les jours des autres mois */
  .rdp-day_outside {
    opacity: 0.5 !important;
  }

  /* Styles pour les jours avec événements */
  .day-with-event {
    position: relative;
  }
  
  .day-with-event::after {
    content: '';
    position: absolute;
    bottom: 2px;
    left: 50%;
    transform: translateX(-50%);
    width: 5px;
    height: 5px;
    background-color: #8B5CF6;
    border-radius: 50%;
  }

  /* Style pour aujourd'hui */
  .today-circle {
    position: relative;
  }
  
  .today-circle::before {
    content: '';
    position: absolute;
    inset: 0;
    border: 2px solid #8B5CF6;
    border-radius: 9999px;
  }
  
  /* Style pour le calendrier personnalisé */
  .custom-calendar {
    width: 100%;
    border-collapse: collapse;
    dark:color: #e2e8f0;
  }
  
  .custom-calendar th {
    padding: 8px 0;
    text-align: center;
    font-weight: 600;
    font-size: 0.75rem;
    text-transform: uppercase;
    color: #6b7280;
  }

  .dark .custom-calendar th {
    color: #ffffff;
  }

  .dark .custom-calendar-day {
    color: #ffffff;
  }
  
  .custom-calendar td {
    padding: 0;
    text-align: center;
    height: 40px;
    width: calc(100% / 7);
  }
  
  .custom-calendar-day {
    width: 40px;
    height: 40px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    cursor: pointer;
    font-size: 0.875rem;
    position: relative;
  }
  
  .custom-calendar-day:hover {
    background-color: rgba(139, 92, 246, 0.1);
    dark:background-color: rgba(139, 92, 246, 0.3);
  }
  
  .custom-calendar-day.today {
    background-color: rgba(139, 92, 246, 0.1);
    font-weight: bold;
    dark:background-color: rgba(139, 92, 246, 0.3);
    dark:color: white;
  }
  
  .custom-calendar-day.selected {
    background-color: #8B5CF6;
    color: white;
    dark:background-color: #8B5CF6;
    dark:color: white;
  }
  
  .custom-calendar-day.other-month {
    opacity: 0.5;
    dark:opacity: 0.3;
  }
  
  .custom-calendar-day.has-event::after {
    content: '';
    position: absolute;
    bottom: 2px;
    left: 50%;
    transform: translateX(-50%);
    width: 5px;
    height: 5px;
    background-color: #8B5CF6;
    border-radius: 50%;
    dark:background-color: #c4b5fd;
  }

  /* Améliorer la visibilité des jours avec événements */
  .custom-calendar-day .event-indicator {
    position: absolute;
    bottom: 1px;
    left: 50%;
    transform: translateX(-50%);
    width: 5px;
    height: 5px;
    background-color: #8B5CF6;
    border-radius: 50%;
    dark:background-color: #c4b5fd;
  }

  /* Ajouter des styles pour les échelles du graphique en mode sombre */
  .dark .recharts-cartesian-axis-tick-value {
    fill: #ffffff;
  }

  /* Ajouter des styles pour les emails et badges en mode sombre */
  .dark .badge-email {
    color: #ffffff !important;
    border-color: #ffffff !important;
  }

  /* Ajouter des styles pour le bouton fermer en mode sombre */
  .dark .close-button {
    color: #ffffff !important;
  }
`;

// Ajouter cette déclaration au début du fichier, juste après les imports
declare global {
  interface Window {
    calendarEvents?: CalendarEvent[];
    selectedCalendarDate?: string;
  }
}

/* =================== Types & Interfaces =================== */

interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  notes: string;
  time: string;
  invitees: string[];
}

type ModalType =
  | "projets_actifs"
  | "taches_completees"
  | "calendrier"
  | "activite_recente"
  | "taches_en_cours"
  | "projets_termines"
  | "projets_prioritaires"
  | "projets_section"
  | "projet_details"
  | "tache_details"
  | "equipes"
  | "equipe_details"
  | "member_details"
  | "projets_en_attente"
  | null;

interface Project {
  id: number;
  name: string;
  progress: number;
  deadline: string;
  color: string;
  details: string;
  team?: BackendTeamMember[];
  end_date?: string;
  description?: string;
  status?: string;
}

interface PendingProject {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  clerk_user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  team_members: BackendTeamMember[];
}

interface Task {
  id: number;
  title: string;
  progress: string;
  details: string;
  assignedTo: string;
  assignee?: BackendTeamMember;
  deadline: string;
  priority: "high" | "medium" | "low";
  description: string;
  due_date: string;
  assignee_id: number | null;
  project_name?: string;
}

interface Meeting {
  title: string;
  time: string;
  details: string;
}

interface Message {
  from: string;
  message: string;
}

interface Activity {
  id: number;
  user: string;
  action: string;
  time: string;
}

interface QuickAction {
  icon: React.ReactElement;
  label: string;
  color: string;
}

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

interface StatBlockProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactElement;
  onClick?: () => void;
}

interface ClickableProps {
  onClick?: () => void;
}

interface ProjectTimelineProps extends ClickableProps {}

interface CalendarWidgetProps extends ClickableProps {
  className?: string;
}

interface RecentActivityProps extends ClickableProps {
  className?: string;
}

interface ProjectSectionProps {
  onProjectClick: (project: Project) => void;
  summary?: boolean;
  projects: Project[];
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  avatar: string;
  status: "active" | "inactive";
  email: string;
  phone?: string;
  address?: string;
  project?: string;
  post?: string;
}

interface TeamGroup {
  projectName: string;
  projectColor: string;
  members: TeamMember[];
}

interface InnovationDetail {
  title: string;
  description: string;
  benefits: string[];
  timeline: string;
  budget: string;
  team: string[];
  steps: { title: string; description: string }[];
}

/* =================== Données de démonstration =================== */

const colors = {
  primary: "#8B5CF6",
  secondary: "#6366F1",
  accent: "#EC4899",
  background: "#F8FAFC",
  text: "#1E293B",
};

const data = [
  { name: "Jan", value: 65, details: "Objectif intermédiaire atteint" },
  { name: "Fév", value: 78, details: "Bonne progression" },
  { name: "Mar", value: 83, details: "Baisse de rythme" },
  { name: "Avr", value: 92, details: "Excellente performance" },
  { name: "Mai", value: 81, details: "Objectif presque atteint" },
];

const innovationIdeas = [
  {
    icon: <LightBulbIcon className="h-6 w-6" />,
    title: "IA Prédictive",
    description:
      "Utiliser l'IA pour prédire les tendances du marché et anticiper les besoins clients.",
    color: "bg-purple-100 dark:bg-purple-900/30",
  },
  {
    icon: <RocketLaunchIcon className="h-6 w-6" />,
    title: "Expansion Internationale",
    description:
      "Stratégie d'expansion sur les marchés asiatiques et américains.",
    color: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    icon: <SparklesIcon className="h-6 w-6" />,
    title: "Produit Innovant",
    description:
      "Développement d'une solution révolutionnaire basée sur la blockchain.",
    color: "bg-amber-100 dark:bg-amber-900/30",
  },
];

// Ajouter des données pour les détails d'innovation
const innovationDetails: Record<string, InnovationDetail> = {
  "IA Prédictive": {
    title: "Intelligence Artificielle Prédictive",
    description:
      "Utilisation de l'IA pour analyser les données historiques et prédire les tendances futures du marché, permettant une prise de décision proactive et stratégique.",
    benefits: [
      "Anticipation des besoins clients",
      "Optimisation des stocks et de la chaîne d'approvisionnement",
      "Détection précoce des opportunités de marché",
      "Réduction des risques commerciaux",
    ],
    timeline: "6-8 mois",
    budget: "150 000 €",
    team: ["Data Scientists", "Analystes Business", "Développeurs IA"],
    steps: [
      {
        title: "Collecte de données",
        description:
          "Rassembler et structurer les données historiques de l'entreprise",
      },
      {
        title: "Développement d'algorithmes",
        description:
          "Créer des modèles prédictifs basés sur le machine learning",
      },
      {
        title: "Phase de test",
        description: "Valider la précision des prédictions sur des cas réels",
      },
      {
        title: "Déploiement",
        description: "Intégrer la solution dans les systèmes existants",
      },
      {
        title: "Formation",
        description: "Former les équipes à l'utilisation des insights générés",
      },
    ],
  },
  "Expansion Internationale": {
    title: "Stratégie d'Expansion Internationale",
    description:
      "Plan stratégique pour pénétrer les marchés asiatiques et américains, en adaptant nos produits et services aux spécificités locales tout en maintenant notre identité de marque.",
    benefits: [
      "Diversification des revenus",
      "Réduction de la dépendance aux marchés actuels",
      "Accès à de nouveaux segments de clientèle",
      "Renforcement de la notoriété mondiale",
    ],
    timeline: "12-18 mois",
    budget: "500 000 €",
    team: [
      "Responsables Régionaux",
      "Équipe Marketing International",
      "Juristes Internationaux",
    ],
    steps: [
      {
        title: "Étude de marché",
        description:
          "Analyser les opportunités et contraintes des marchés cibles",
      },
      {
        title: "Adaptation produit",
        description: "Modifier les offres pour répondre aux besoins locaux",
      },
      {
        title: "Partenariats locaux",
        description: "Identifier et établir des partenariats stratégiques",
      },
      {
        title: "Conformité réglementaire",
        description: "S'assurer du respect des lois et normes locales",
      },
      {
        title: "Lancement",
        description:
          "Déployer progressivement la présence sur les nouveaux marchés",
      },
    ],
  },
  "Produit Innovant": {
    title: "Solution Blockchain Révolutionnaire",
    description:
      "Développement d'une plateforme basée sur la blockchain pour sécuriser et optimiser les transactions et la gestion des données, offrant une transparence et une sécurité inégalées.",
    benefits: [
      "Sécurité renforcée des données",
      "Réduction des coûts de transaction",
      "Élimination des intermédiaires",
      "Traçabilité complète des opérations",
    ],
    timeline: "10-12 mois",
    budget: "300 000 €",
    team: [
      "Ingénieurs Blockchain",
      "Architectes Système",
      "Experts en Sécurité",
    ],
    steps: [
      {
        title: "Conception",
        description:
          "Définir l'architecture et les fonctionnalités de la solution",
      },
      {
        title: "Prototype",
        description: "Développer une version minimale viable",
      },
      {
        title: "Tests de sécurité",
        description: "Vérifier la robustesse contre les attaques potentielles",
      },
      {
        title: "Bêta-test",
        description: "Déployer auprès d'un groupe restreint d'utilisateurs",
      },
      {
        title: "Lancement commercial",
        description: "Déploiement complet et campagne marketing",
      },
    ],
  },
};

// Exemple de données d'événements prédéfinies pour le calendrier
const exampleEvents: CalendarEvent[] = [
  {
    id: "1",
    date: format(new Date(), "yyyy-MM-dd"),
    title: "Réunion équipe",
    notes: "Revue des objectifs trimestriels",
    time: "10:00",
    invitees: ["alice@example.com", "bob@example.com"],
  },
  {
    id: "2",
    date: format(addDays(new Date(), 2), "yyyy-MM-dd"),
    title: "Présentation client",
    notes: "Démonstration de la nouvelle interface",
    time: "14:30",
    invitees: ["alice@example.com"],
  },
];

const recentActivities: Activity[] = [
  {
    id: 1,
    user: "Alice",
    action: "a mis à jour le projet X",
    time: "Il y a 2 heures",
  },
  {
    id: 2,
    user: "Bob",
    action: "a commenté la tâche Y",
    time: "Il y a 5 heures",
  },
  {
    id: 3,
    user: "Charlie",
    action: "a créé un nouveau projet Z",
    time: "Il y a 1 jour",
  },
  {
    id: 4,
    user: "David",
    action: "a terminé la tâche A",
    time: "Il y a 2 jours",
  },
  {
    id: 5,
    user: "Eve",
    action: "a rejoint l'équipe B",
    time: "Il y a 3 jours",
  },
];

/* =================== Composants =================== */

// Composant Modal générique (affiche en recouvrant entièrement l'écran, sans navbar)
const Modal: React.FC<ModalProps> = ({ title, children, onClose }) => (
  <motion.div
    className="fixed inset-0 z-50 flex items-center justify-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
    <motion.div
      className="relative z-10 max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-8 dark:bg-slate-800"
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          {title}
        </h2>
        <Button
          variant="ghost"
          onClick={onClose}
          className="close-button hover:bg-slate-100 dark:text-white dark:hover:bg-slate-700"
        >
          Fermer
        </Button>
      </div>
      {children}
    </motion.div>
  </motion.div>
);

// Composant StatBlock cliquable
const StatBlock: React.FC<StatBlockProps> = ({
  title,
  value,
  change,
  icon,
  onClick,
}) => (
  <motion.div
    onClick={onClick}
    whileHover={{ scale: 1.03 }}
    className="cursor-pointer rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all hover:border-purple-200 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-purple-400"
  >
    <div className="flex items-center gap-4">
      <div className="rounded-xl bg-purple-500/10 p-3">
        {React.cloneElement(icon, { className: "w-8 h-8 text-purple-600" })}
      </div>
      <div>
        <p className="mb-1 text-sm text-slate-500 dark:text-slate-300">
          {title}
        </p>
        <p className="text-3xl font-bold text-slate-800 dark:text-white">
          {value}
        </p>
        <div className="mt-2 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
          <ArrowTrendingUpIcon className="h-4 w-4" />
          <span>{change}</span>
        </div>
      </div>
    </div>
  </motion.div>
);

// Modifier le composant ProjectTimeline pour supprimer la barre de défilement horizontale
const ProjectTimeline: React.FC<
  ProjectTimelineProps & { priorityProjects: Project[] }
> = ({ onClick, priorityProjects }) => {
  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cursor-pointer rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all hover:border-purple-200 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-purple-400"
    >
      <h3 className="mb-6 flex items-center gap-3 text-xl font-semibold text-slate-800 dark:text-white">
        <BriefcaseIcon className="h-7 w-7 text-purple-600" />
        Projets prioritaires
      </h3>
      <div className="custom-scrollbar max-h-[400px] space-y-6 overflow-y-auto pr-2">
        {priorityProjects.length > 0 ? (
          priorityProjects.map((project) => (
            <div key={project.id} className="space-y-3">
              <div className="flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300">
                <span>{project.name}</span>
                <span className="text-slate-500">{project.deadline}</span>
              </div>
              <div className="relative h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${project.progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${project.color} 0%, ${colors.secondary} 100%)`,
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {project.details.substring(0, 80)}...
              </p>
            </div>
          ))
        ) : (
          <p className="text-center text-slate-500 dark:text-slate-400">
            Aucun projet prioritaire trouvé
          </p>
        )}
      </div>
    </motion.div>
  );
};

// Modifier le composant RecentActivity pour supprimer la barre de défilement horizontale
const RecentActivity: React.FC<RecentActivityProps> = ({
  onClick,
  className,
}) => (
  <motion.div
    onClick={onClick}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex h-full cursor-pointer flex-col rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all hover:border-purple-200 dark:border-slate-700 dark:bg-slate-800 ${className || ""}`}
  >
    <h3 className="mb-4 flex items-center gap-3 text-xl font-semibold text-slate-800 dark:text-white">
      <ClockIcon className="h-7 w-7 text-purple-600" />
      Activité Récente
    </h3>
    <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto overflow-x-hidden">
      {recentActivities.map((activity) => (
        <motion.div
          key={activity.id}
          className="flex items-start gap-4 rounded-lg bg-purple-50/50 p-4 dark:bg-slate-700/50"
          whileHover={{ x: 5 }}
        >
          <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-purple-600" />
          <div className="min-w-0 flex-1">
            <p className="break-words text-sm text-slate-800 dark:text-white">
              <span className="font-medium">{activity.user}</span>{" "}
              {activity.action}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {activity.time}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

// Composant ProjectSection (affiche tous les projets)
const ProjectSection: React.FC<ProjectSectionProps> = ({
  onProjectClick,
  summary = false,
  projects,
}) => {
  const list = summary ? projects.slice(0, 3) : projects;
  return (
    <motion.div
      className="rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="mb-4 flex items-center gap-3 text-xl font-semibold text-slate-800 dark:text-white">
        <BriefcaseIcon className="h-7 w-7 text-purple-600" />
        Projets
      </h3>
      <div className="space-y-4">
        {list.length > 0 ? (
          list.map((project, index) => (
            <motion.div
              key={project.id}
              onClick={() => onProjectClick(project)}
              className="flex cursor-pointer items-center gap-4 rounded-lg p-3 transition-colors hover:bg-purple-50/50 dark:hover:bg-slate-700/50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                className="rounded-full p-2"
                style={{ background: project.color }}
              >
                <BriefcaseIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-800 dark:text-white">
                  {project.name}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Deadline: {project.deadline}
                </p>
              </div>
              <div className="w-16">
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${project.progress}%`,
                      background: project.color,
                    }}
                  />
                </div>
                <p className="mt-1 text-right text-xs text-slate-500">
                  {project.progress}%
                </p>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-slate-500 dark:text-slate-400">
            Aucun projet trouvé
          </p>
        )}
      </div>
    </motion.div>
  );
};

// Modifier le composant TeamGroups pour limiter l'affichage à 3 équipes et ajouter une scrollbar
const TeamGroups: React.FC<{
  onTeamClick: (projectName: string, members: TeamMember[]) => void;
  teamGroups: TeamGroup[];
}> = ({ onTeamClick, teamGroups }) => {
  return (
    <motion.div
      className="rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="mb-4 flex items-center gap-3 text-xl font-semibold text-slate-800 dark:text-white">
        <UserGroupIcon className="h-7 w-7 text-purple-600" />
        Équipes par Projet
      </h3>
      <div className="custom-scrollbar max-h-[300px] space-y-4 overflow-y-auto pr-2">
        {teamGroups.length > 0 ? (
          teamGroups.map((group, index) => (
            <motion.div
              key={group.projectName}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="cursor-pointer rounded-lg border-l-4 p-4 transition-colors hover:bg-purple-50/50 dark:hover:bg-slate-700/50"
              style={{ borderColor: group.projectColor }}
              onClick={() => onTeamClick(group.projectName, group.members)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-800 dark:text-white">
                    {group.projectName}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {group.members.length} membres
                  </p>
                </div>
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full font-medium text-white"
                  style={{ background: group.projectColor }}
                >
                  {group.members.length}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-slate-500 dark:text-slate-400">
            Aucune équipe trouvée
          </p>
        )}
      </div>
    </motion.div>
  );
};

// TaskDetails Component
const TaskDetails: React.FC<{ task: Task; onClose: () => void }> = ({
  task,
  onClose,
}) => (
  <Modal title={task.title} onClose={onClose}>
    <div className="space-y-4">
      <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-700/50">
        <h4 className="font-medium text-slate-800 dark:text-white">Détails</h4>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {task.details}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-700/50">
          <h4 className="font-medium text-slate-800 dark:text-white">
            Assigné à
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {task.assignedTo}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-700/50">
          <h4 className="font-medium text-slate-800 dark:text-white">
            Deadline
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {task.deadline}
          </p>
        </div>
      </div>
      {task.project_name && (
        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-700/50">
          <h4 className="font-medium text-slate-800 dark:text-white">Projet</h4>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {task.project_name}
          </p>
        </div>
      )}
      <Button
        onClick={onClose}
        className="bg-purple-600 text-white hover:bg-purple-700"
      >
        Fermer
      </Button>
    </div>
  </Modal>
);

// TeamDetails Component
const TeamDetails: React.FC<{
  projectName: string;
  members: TeamMember[];
  onClose: () => void;
  onMemberClick: (member: TeamMember) => void;
}> = ({ projectName, members, onClose, onMemberClick }) => (
  <Modal title={`Équipe - ${projectName}`} onClose={onClose}>
    <div className="space-y-4">
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Cette équipe est responsable du projet <strong>{projectName}</strong>.
      </p>
      <h4 className="font-medium text-slate-800 dark:text-white">
        Membres de l'équipe
      </h4>
      <div className="space-y-2">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex cursor-pointer items-center justify-between rounded-lg bg-slate-50 p-3 transition-colors hover:bg-purple-50 dark:bg-slate-700/50 dark:hover:bg-purple-900/20"
            onClick={() => onMemberClick(member)}
          >
            <div className="flex items-center gap-3">
              <img
                src={member.avatar || "/placeholder.svg"}
                alt={member.name}
                className="h-8 w-8 rounded-full"
              />
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-white">
                  {member.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {member.role}
                </p>
              </div>
            </div>
            <Badge variant="outline">{member.status}</Badge>
          </div>
        ))}
      </div>
      <Button
        onClick={onClose}
        className="bg-purple-600 text-white hover:bg-purple-700"
      >
        Fermer
      </Button>
    </div>
  </Modal>
);

// MemberDetails Component
const MemberDetails: React.FC<{ member: TeamMember; onClose: () => void }> = ({
  member,
  onClose,
}) => (
  <Modal title={`Détails de ${member.name}`} onClose={onClose}>
    <div className="space-y-4">
      <div className="flex items-center gap-6">
        <img
          src={member.avatar || "/placeholder.svg"}
          alt={member.name}
          className="h-20 w-20 rounded-full"
        />
        <div>
          <h4 className="text-lg font-medium text-slate-800 dark:text-white">
            {member.name}
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {member.role}
          </p>
        </div>
      </div>
      <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-700/50">
        <h4 className="font-medium text-slate-800 dark:text-white">
          Informations de contact
        </h4>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Email: {member.email}
        </p>
        {member.phone && (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Téléphone: {member.phone}
          </p>
        )}
        {member.address && (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Adresse: {member.address}
          </p>
        )}
      </div>
      <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-700/50">
        <h4 className="font-medium text-slate-800 dark:text-white">
          Informations supplémentaires
        </h4>
        {member.project && (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Projet: {member.project}
          </p>
        )}
        {member.post && (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Poste: {member.post}
          </p>
        )}
      </div>
      <Button
        onClick={onClose}
        className="bg-purple-600 text-white hover:bg-purple-700"
      >
        Fermer
      </Button>
    </div>
  </Modal>
);

interface InnovationDetailsProps {
  innovation: InnovationDetail;
  onClose: () => void;
}

const InnovationDetails: React.FC<InnovationDetailsProps> = ({
  innovation,
  onClose,
}) => (
  <Modal title={innovation.title} onClose={onClose}>
    <div className="space-y-4">
      <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-700/50">
        <h4 className="font-medium text-slate-800 dark:text-white">
          Description
        </h4>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {innovation.description}
        </p>
      </div>

      <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-700/50">
        <h4 className="font-medium text-slate-800 dark:text-white">
          Avantages
        </h4>
        <ul className="list-inside list-disc text-sm text-slate-600 dark:text-slate-300">
          {innovation.benefits.map((benefit) => (
            <li key={benefit}>{benefit}</li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-700/50">
          <h4 className="font-medium text-slate-800 dark:text-white">
            Timeline
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {innovation.timeline}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-700/50">
          <h4 className="font-medium text-slate-800 dark:text-white">Budget</h4>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {innovation.budget}
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-700/50">
        <h4 className="font-medium text-slate-800 dark:text-white">Équipe</h4>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {innovation.team.join(", ")}
        </p>
      </div>

      <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-700/50">
        <h4 className="font-medium text-slate-800 dark:text-white">Étapes</h4>
        <ol className="list-inside list-decimal text-sm text-slate-600 dark:text-slate-300">
          {innovation.steps.map((step, index) => (
            <li key={index}>
              <span className="font-medium">{step.title}:</span>{" "}
              {step.description}
            </li>
          ))}
        </ol>
      </div>

      <Button
        onClick={onClose}
        className="bg-purple-600 text-white hover:bg-purple-700"
      >
        Fermer
      </Button>
    </div>
  </Modal>
);

// Composant pour afficher les projets en attente d'approbation
const PendingProjectsSection: React.FC<{
  pendingProjects: PendingProject[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}> = ({ pendingProjects, onApprove, onReject }) => {
  return (
    <motion.div
      className="rounded-2xl border border-amber-200 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:border-amber-700 dark:bg-slate-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="mb-4 flex items-center gap-3 text-xl font-semibold text-slate-800 dark:text-white">
        <BriefcaseIcon className="h-7 w-7 text-amber-600" />
        Projets en attente d'approbation ({pendingProjects.length})
      </h3>
      <div className="custom-scrollbar max-h-[400px] space-y-4 overflow-y-auto pr-2">
        {pendingProjects.length > 0 ? (
          pendingProjects.map((project) => (
            <div
              key={project.id}
              className="rounded-lg border border-amber-100 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-900/20"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-slate-800 dark:text-white">
                    {project.name}
                  </h4>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Créé le {new Date(project.created_at).toLocaleDateString()}
                  </p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {project.description}
                  </p>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Créé par:{" "}
                    {project.team_members.find(
                      (m) => m.clerk_user_id === project.clerk_user_id,
                    )?.name || "Utilisateur inconnu"}
                  </p>
                </div>
                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                  En attente
                </Badge>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => onReject(project.id)}
                >
                  <XMarkIcon className="mr-1 h-4 w-4" />
                  Rejeter
                </Button>
                <Button
                  className="bg-green-600 text-white hover:bg-green-700"
                  onClick={() => onApprove(project.id)}
                >
                  <CheckIcon className="mr-1 h-4 w-4" />
                  Approuver
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="py-8 text-center text-slate-500 dark:text-slate-400">
            Aucun projet en attente d'approbation
          </p>
        )}
      </div>
    </motion.div>
  );
};

// Modifier le composant principal pour gérer les clics sur les innovations
export default function GlobalDashboard() {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [selectedModal, setSelectedModal] = useState<ModalType>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTeamProject, setSelectedTeamProject] = useState<string | null>(
    null,
  );
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<TeamMember[]>(
    [],
  );
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [selectedInnovation, setSelectedInnovation] = useState<string | null>(
    null,
  );
  const [calendarEvents, setCalendarEvents] =
    useState<CalendarEvent[]>(exampleEvents);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [pendingProjects, setPendingProjects] = useState<PendingProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Référence pour le champ de date dans le formulaire
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [newEvent, setNewEvent] = useState<Omit<CalendarEvent, "id">>({
    date: format(new Date(), "yyyy-MM-dd"),
    title: "",
    notes: "",
    time: format(new Date(), "HH:mm"),
    invitees: [],
  });
  const [selectedInvitees, setSelectedInvitees] = useState<string[]>([]);
  const [iaDescription, setIaDescription] = useState<string>("");

  // Get the current user ID from localStorage
  const [clerkUserId, setClerkUserId] = useState<string | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem("currentUserId");
    if (userId) {
      setClerkUserId(userId);
    }
  }, []);

  // Fetch dashboard data
  const {
    data: dashboardData,
    isLoading: isLoadingDashboard,
    error: dashboardError,
  } = useGetDashboardDataQuery(undefined, { skip: !clerkUserId });

  // Fetch pending projects
  useEffect(() => {
    const fetchPendingProjects = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/admin/projects/pending",
        );
        if (response.ok) {
          const data = await response.json();
          setPendingProjects(data.pendingProjects || []);
        } else {
          console.error("Failed to fetch pending projects");
        }
      } catch (error) {
        console.error("Error fetching pending projects:", error);
      }
    };

    fetchPendingProjects();
  }, []);

  // Handle project approval
  const handleApproveProject = async (projectId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/projects/${projectId}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        // Remove the approved project from the list
        setPendingProjects((prev) =>
          prev.filter((project) => project.id !== projectId),
        );
        // Show success message or notification
        alert("Projet approuvé avec succès");
      } else {
        console.error("Failed to approve project");
        alert("Échec de l'approbation du projet");
      }
    } catch (error) {
      console.error("Error approving project:", error);
      alert("Erreur lors de l'approbation du projet");
    } finally {
      setIsLoading(false);
    }
  };

  // Mettre à jour le message d'alerte dans handleRejectProject pour refléter la suppression
  const handleRejectProject = async (projectId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/projects/${projectId}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        // Remove the rejected project from the list
        setPendingProjects((prev) =>
          prev.filter((project) => project.id !== projectId),
        );
        // Show success message or notification
        alert("Projet rejeté et supprimé de la base de données");
      } else {
        console.error("Failed to reject project");
        alert("Échec du rejet du projet");
      }
    } catch (error) {
      console.error("Error rejecting project:", error);
      alert("Erreur lors du rejet du projet");
    } finally {
      setIsLoading(false);
    }
  };

  // Define project colors
  const projectColors = [
    "#EC4899",
    "#8B5CF6",
    "#6366F1",
    "#10B981",
    "#F59E0B",
    "#3B82F6",
    "#EF4444",
    "#14B8A6",
    "#8B5CF6",
    "#F97316",
  ];

  // Transform backend data to match UI components
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [completedProjects, setCompletedProjects] = useState<Project[]>([]);
  const [priorityProjects, setPriorityProjects] = useState<Project[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [ongoingTasks, setOngoingTasks] = useState<Task[]>([]);
  const [teamGroups, setTeamGroups] = useState<TeamGroup[]>([]);

  useEffect(() => {
    if (dashboardData) {
      // Transform projects data
      const transformedActiveProjects = dashboardData.active_projects.map(
        (project: any, index: number) => ({
          id: project.id,
          name: project.name,
          progress: project.progress,
          deadline: project.end_date
            ? format(new Date(project.end_date), "dd/MM/yy")
            : "N/A",
          color: projectColors[index % projectColors.length],
          details: project.description || "Aucune description",
          team: project.team || [],
          end_date: project.end_date,
          description: project.description,
        }),
      );

      const transformedCompletedProjects = dashboardData.completed_projects.map(
        (project: any, index: number) => ({
          id: project.id,
          name: project.name,
          progress: project.progress,
          deadline: project.end_date
            ? format(new Date(project.end_date), "dd/MM/yy")
            : "N/A",
          color:
            projectColors[
              (index + transformedActiveProjects.length) % projectColors.length
            ],
          details: project.description || "Aucune description",
          team: project.team || [],
          end_date: project.end_date,
          description: project.description,
        }),
      );

      const transformedPriorityProjects = dashboardData.priority_projects.map(
        (project: any, index: number) => ({
          id: project.id,
          name: project.name,
          progress: project.progress,
          deadline: project.end_date
            ? format(new Date(project.end_date), "dd/MM/yy")
            : "N/A",
          color: projectColors[index % projectColors.length],
          details: project.description || "Aucune description",
          team: project.team || [],
          end_date: project.end_date,
          description: project.description,
        }),
      );

      // Transform tasks data
      const transformedCompletedTasks = dashboardData.completed_tasks.map(
        (task: any) => ({
          id: task.id,
          title: task.title,
          progress: "100%",
          details: task.description || "Aucune description",
          assignedTo: task.assignee ? task.assignee.name : "Non assigné",
          assignee: task.assignee,
          deadline: task.due_date
            ? format(new Date(task.due_date), "dd/MM/yy")
            : "N/A",
          priority: "medium",
          description: task.description || "",
          due_date: task.due_date || "",
          assignee_id: task.assignee_id,
          project_name: task.project_name,
        }),
      );

      const transformedOngoingTasks = dashboardData.ongoing_tasks.map(
        (task: any) => {
          let progress = "25%";
          if (task.status === "en_cours") progress = "50%";
          if (task.status === "en_révision") progress = "75%";

          return {
            id: task.id,
            title: task.title,
            progress: progress,
            details: task.description || "Aucune description",
            assignedTo: task.assignee ? task.assignee.name : "Non assigné",
            assignee: task.assignee,
            deadline: task.due_date
              ? format(new Date(task.due_date), "dd/MM/yy")
              : "N/A",
            priority: "medium",
            description: task.description || "",
            due_date: task.due_date || "",
            assignee_id: task.assignee_id,
            project_name: task.project_name,
          };
        },
      );

      // Transform team data
      const transformedTeamGroups = dashboardData.teams_by_project
        .map((team: any, index: number) => ({
          projectName: team.project_name,
          projectColor: projectColors[index % projectColors.length],
          members: team.members.map((member: any) => ({
            id: member.id,
            name: member.name,
            role: member.pivot.role,
            avatar:
              member.avatar ||
              `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? "men" : "women"}/${Math.floor(Math.random() * 10)}.jpg`,
            status: "active",
            email: member.email,
          })),
        }))
        .filter((group: any) => group.members.length > 0);

      // Set state with transformed data
      setAllProjects([
        ...transformedActiveProjects,
        ...transformedCompletedProjects,
      ]);
      setActiveProjects(transformedActiveProjects);
      setCompletedProjects(transformedCompletedProjects);
      setPriorityProjects(transformedPriorityProjects);
      setCompletedTasks(transformedCompletedTasks);
      setOngoingTasks(transformedOngoingTasks);
      setTeamGroups(transformedTeamGroups);
    }
  }, [dashboardData]);

  return (
    <>
      <GlobalStyle />
      <section
        className="min-h-screen bg-gradient-to-br from-purple-50/50 to-blue-50/50 p-6 dark:from-slate-900 dark:to-slate-800 md:p-8"
        onClick={(e) => {
          if (e.target === e.currentTarget && selectedModal) {
            setSelectedModal(null);
          }
        }}
      >
        {/* Important: Ne pas afficher la navbar dans les modales */}
        {!selectedModal && (
          <header className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-6"
            >
              <div className="rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/10 p-4">
                <ChartBarIcon className="h-10 w-10 text-purple-600" />
              </div>
              <div>
                <h1 className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
                  Tableau de Bord Exécutif
                </h1>
                <p className="mt-2 text-slate-600 dark:text-slate-300">
                  Vue d'ensemble des performances
                </p>
              </div>
            </motion.div>
          </header>
        )}

        {/* Section des projets en attente d'approbation */}
        {pendingProjects.length > 0 && (
          <div className="mb-8">
            <PendingProjectsSection
              pendingProjects={pendingProjects}
              onApprove={handleApproveProject}
              onReject={handleRejectProject}
            />
          </div>
        )}

        {/* Première rangée de statistiques */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-5">
          <StatBlock
            title="Projets Actifs"
            value={activeProjects.length.toString()}
            change="+5%"
            icon={<BriefcaseIcon />}
            onClick={() => setSelectedModal("projets_actifs")}
          />
          <StatBlock
            title="Tâches Complétées"
            value={completedTasks.length.toString()}
            change="+18%"
            icon={<ClipboardDocumentCheckIcon />}
            onClick={() => setSelectedModal("taches_completees")}
          />
          <StatBlock
            title="Projets"
            value={allProjects.length.toString()}
            change="+2"
            icon={<UsersIcon />}
            onClick={() => setSelectedModal("projets_section")}
          />
          <StatBlock
            title="Tâches en cours"
            value={ongoingTasks.length.toString()}
            change="+3"
            icon={<DocumentTextIcon />}
            onClick={() => setSelectedModal("taches_en_cours")}
          />
          <StatBlock
            title="Projets terminés"
            value={completedProjects.length.toString()}
            change="+4"
            icon={<CheckCircleIcon />}
            onClick={() => setSelectedModal("projets_termines")}
          />
        </div>

        {/* Widgets */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <motion.div
              className="rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h2 className="mb-6 flex items-center gap-3 text-xl font-semibold text-slate-800 dark:text-white">
                <PresentationChartLineIcon className="h-7 w-7 text-purple-600" />
                Progression globale
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-slate-200 dark:stroke-slate-700"
                    />
                    <XAxis
                      dataKey="name"
                      stroke={colors.text}
                      className="text-xs dark:stroke-slate-400"
                    />
                    <YAxis
                      stroke={colors.text}
                      className="text-xs dark:stroke-slate-400"
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(255, 255, 255, 0.9)",
                        border: `1px solid ${colors.primary}20`,
                        borderRadius: "12px",
                        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
                        color: "#1E293B",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={colors.primary}
                      strokeWidth={3}
                      dot={{ fill: colors.primary, strokeWidth: 2, r: 4 }}
                      activeDot={{
                        r: 8,
                        fill: colors.primary,
                        stroke: "white",
                        strokeWidth: 2,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <div className="grid h-[400px] grid-cols-1 gap-8 md:grid-cols-2">
              <RecentActivity
                onClick={() => setSelectedModal("activite_recente")}
              />
            </div>
          </div>

          <div className="space-y-8">
            <div
              className="cursor-pointer"
              onClick={() => setSelectedModal("projets_prioritaires")}
            >
              <ProjectTimeline
                onClick={() => setSelectedModal("projets_prioritaires")}
                priorityProjects={priorityProjects}
              />
            </div>
            <div
              className="cursor-pointer"
              onClick={() => setSelectedModal("equipes")}
            >
              <TeamGroups
                teamGroups={teamGroups}
                onTeamClick={(projectName, members) => {
                  setSelectedTeamProject(projectName);
                  setSelectedTeamMembers(members);
                  setSelectedModal("equipe_details");
                }}
              />
            </div>
            <div></div>
          </div>
        </div>

        {/* Modales */}
        {selectedModal === "projets_actifs" && (
          <Modal
            title="Détails des Projets Actifs"
            onClose={() => setSelectedModal(null)}
          >
            <div className="space-y-4">
              {activeProjects.length > 0 ? (
                activeProjects.map((project) => (
                  <div
                    key={project.id}
                    className="rounded-lg bg-slate-50 p-4 dark:bg-slate-700/50"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-slate-800 dark:text-white">
                        {project.name}
                      </h4>
                      <Badge variant="outline">{`${project.progress}%`}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      Deadline: {project.deadline}
                    </p>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      {project.details}
                    </p>
                    <div className="mt-2 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-600">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${project.progress}%`,
                          background: `linear-gradient(90deg, ${project.color} 0%, ${colors.secondary} 100%)`,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 dark:text-slate-400">
                  Aucun projet actif trouvé
                </p>
              )}
            </div>
          </Modal>
        )}

        {selectedModal === "taches_completees" && (
          <Modal
            title="Tâches Complétées"
            onClose={() => setSelectedModal(null)}
          >
            <div className="space-y-4">
              {completedTasks.length > 0 ? (
                completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="cursor-pointer rounded-lg bg-slate-50 p-4 transition-colors hover:bg-purple-50 dark:bg-slate-700/50 dark:hover:bg-purple-900/20"
                    onClick={() => {
                      setSelectedTask(task);
                      setSelectedModal("tache_details");
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 dark:text-white">
                        {task.title}
                      </h4>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                      >
                        {task.progress}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      {task.details.substring(0, 100)}...
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Assigné à: {task.assignedTo}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Deadline: {task.deadline}
                      </span>
                    </div>
                    {task.project_name && (
                      <div className="mt-2">
                        <span className="text-xs text-purple-600 dark:text-purple-400">
                          Projet: {task.project_name}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 dark:text-slate-400">
                  Aucune tâche complétée trouvée
                </p>
              )}
            </div>
          </Modal>
        )}

        {selectedModal === "tache_details" && selectedTask && (
          <TaskDetails
            task={selectedTask}
            onClose={() => {
              setSelectedTask(null);
              setSelectedModal("taches_completees");
            }}
          />
        )}

        {selectedModal === "taches_en_cours" && (
          <Modal title="Tâches en cours" onClose={() => setSelectedModal(null)}>
            <div className="space-y-4">
              {ongoingTasks.length > 0 ? (
                ongoingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="cursor-pointer rounded-lg bg-slate-50 p-4 transition-colors hover:bg-purple-50 dark:bg-slate-700/50 dark:hover:bg-purple-900/20"
                    onClick={() => {
                      setSelectedTask(task);
                      setSelectedModal("tache_details");
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 dark:text-white">
                        {task.title}
                      </h4>
                      <Badge variant="outline">{task.progress}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      {task.details.substring(0, 100)}...
                    </p>
                    <div className="mt-2 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-600">
                      <div
                        className="h-full rounded-full bg-purple-500"
                        style={{ width: task.progress }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Assigné à: {task.assignedTo}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Deadline: {task.deadline}
                      </span>
                    </div>
                    {task.project_name && (
                      <div className="mt-2">
                        <span className="text-xs text-purple-600 dark:text-purple-400">
                          Projet: {task.project_name}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 dark:text-slate-400">
                  Aucune tâche en cours trouvée
                </p>
              )}
            </div>
          </Modal>
        )}

        {selectedModal === "projets_termines" && (
          <Modal
            title="Projets terminés"
            onClose={() => setSelectedModal(null)}
          >
            <div className="custom-scrollbar max-h-[70vh] space-y-4 overflow-y-auto pr-2">
              {completedProjects.length > 0 ? (
                completedProjects.map((project) => (
                  <div
                    key={project.id}
                    className="rounded-lg bg-slate-50 p-4 dark:bg-slate-700/50"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 dark:text-white">
                        {project.name}
                      </h4>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                        Terminé
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      {project.details}
                    </p>
                    <div className="mt-2 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-600">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${project.progress}%`,
                          background: `linear-gradient(90deg, ${project.color} 0%, ${colors.secondary} 100%)`,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 dark:text-slate-400">
                  Aucun projet terminé trouvé
                </p>
              )}
            </div>
          </Modal>
        )}

        {selectedModal === "projets_prioritaires" && (
          <Modal
            title="Projets Prioritaires"
            onClose={() => setSelectedModal(null)}
          >
            <div className="custom-scrollbar max-h-[70vh] space-y-4 overflow-y-auto pr-2">
              {priorityProjects.length > 0 ? (
                priorityProjects.map((project) => (
                  <div
                    key={project.id}
                    className="rounded-lg border-l-4 bg-slate-50 p-4 dark:bg-slate-700/50"
                    style={{ borderColor: project.color }}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 dark:text-white">
                        {project.name}
                      </h4>
                      <Badge variant="outline">{`${project.progress}%`}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      Deadline: {project.deadline}
                    </p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      {project.details}
                    </p>
                    <div className="mt-2 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-600">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${project.progress}%`,
                          background: `linear-gradient(90deg, ${project.color} 0%, ${colors.secondary} 100%)`,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 dark:text-slate-400">
                  Aucun projet prioritaire trouvé
                </p>
              )}
            </div>
          </Modal>
        )}

        {selectedModal === "activite_recente" && (
          <Modal
            title="Activité Récente"
            onClose={() => setSelectedModal(null)}
          >
            <div className="custom-scrollbar max-h-[70vh] space-y-4 overflow-y-auto pr-2">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-700/50"
                >
                  <div className="mt-2 h-2 w-2 rounded-full bg-purple-600" />
                  <div>
                    <p className="text-sm text-slate-800 dark:text-white">
                      <span className="font-medium text-purple-600 dark:text-purple-400">
                        {activity.user}
                      </span>{" "}
                      {activity.action}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Modal>
        )}

        {selectedModal === "projets_section" && (
          <Modal
            title="Tous les Projets"
            onClose={() => setSelectedModal(null)}
          >
            <ProjectSection
              projects={allProjects}
              onProjectClick={(project) => {
                setSelectedProject(project);
                setSelectedModal("projet_details");
              }}
              summary={false}
            />
          </Modal>
        )}

        {selectedModal === "projet_details" && selectedProject && (
          <Modal
            title={selectedProject.name}
            onClose={() => {
              setSelectedProject(null);
              setSelectedModal("projets_section");
            }}
          >
            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-700/50">
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-slate-800 dark:text-white">
                    Détails du projet
                  </h4>
                  <Badge
                    variant="outline"
                    className="border-purple-300 text-purple-800 dark:border-purple-700 dark:text-purple-300"
                  >
                    {selectedProject.progress}% complété
                  </Badge>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Deadline
                    </p>
                    <p className="text-slate-800 dark:text-white">
                      {selectedProject.deadline}
                    </p>
                  </div>

                  <div className="mt-2 md:mt-0">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Progression
                    </p>
                    <div className="mt-1 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-600">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${selectedProject.progress}%`,
                          background: `linear-gradient(90deg, ${selectedProject.color} 0%, ${colors.secondary} 100%)`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Description
                  </p>
                  <p className="mt-1 text-slate-800 dark:text-white">
                    {selectedProject.details}
                  </p>
                </div>
              </div>
            </div>
          </Modal>
        )}

        {selectedModal === "equipes" && (
          <Modal
            title="Équipes par Projet"
            onClose={() => setSelectedModal(null)}
          >
            <TeamGroups
              teamGroups={teamGroups}
              onTeamClick={(projectName, members) => {
                setSelectedTeamProject(projectName);
                setSelectedTeamMembers(members);
                setSelectedModal("equipe_details");
              }}
            />
          </Modal>
        )}

        {selectedModal === "equipe_details" && selectedTeamProject && (
          <TeamDetails
            projectName={selectedTeamProject}
            members={selectedTeamMembers}
            onClose={() => {
              setSelectedTeamProject(null);
              setSelectedTeamMembers([]);
              setSelectedModal("equipes");
            }}
            onMemberClick={(member) => {
              setSelectedMember(member);
              setSelectedModal("member_details");
            }}
          />
        )}

        {selectedModal === "member_details" && selectedMember && (
          <MemberDetails
            member={selectedMember}
            onClose={() => {
              setSelectedMember(null);
              if (selectedTeamProject) {
                setSelectedModal("equipe_details");
              } else {
                setSelectedModal("equipes");
              }
            }}
          />
        )}

        {selectedModal === "projets_en_attente" && (
          <Modal
            title="Projets en attente d'approbation"
            onClose={() => setSelectedModal(null)}
          >
            <div className="space-y-4">
              {pendingProjects.length > 0 ? (
                pendingProjects.map((project) => (
                  <div
                    key={project.id}
                    className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-slate-800 dark:text-white">
                          {project.name}
                        </h4>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                          Créé le{" "}
                          {new Date(project.created_at).toLocaleDateString()}
                        </p>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                          {project.description}
                        </p>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          Créé par:{" "}
                          {project.team_members.find(
                            (m) => m.clerk_user_id === project.clerk_user_id,
                          )?.name || "Utilisateur inconnu"}
                        </p>
                      </div>
                      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                        En attente
                      </Badge>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => handleRejectProject(project.id)}
                        disabled={isLoading}
                      >
                        <XMarkIcon className="mr-1 h-4 w-4" />
                        Rejeter
                      </Button>
                      <Button
                        className="bg-green-600 text-white hover:bg-green-700"
                        onClick={() => handleApproveProject(project.id)}
                        disabled={isLoading}
                      >
                        <CheckIcon className="mr-1 h-4 w-4" />
                        Approuver
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-slate-500 dark:text-slate-400">
                  Aucun projet en attente d'approbation
                </p>
              )}
            </div>
          </Modal>
        )}
      </section>
    </>
  );
}
