"use client";

import React, { useState } from "react";
import { FilterIcon } from "lucide-react";
import {
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  PlayIcon,
  EllipsisHorizontalIcon,
  XMarkIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

// Couleurs personnalisées
const couleurPrimaire = "#b03ff3"; // Touche mauve
const vertAccent = "#4CAF50";
const orangeAccent = "#FF9800";
const bleuAccent = "#3B82F6"; // Pour harmoniser la palette

// Étiquettes de statut pour affichage
const libellesStatut: Record<string, string> = {
  all: "Tous",
  completed: "Terminée",
  active: "En cours",
  delayed: "En retard",
  planned: "Planifiée",
};

// Interfaces pour les données
interface Phase {
  title: string;
  status: "planned" | "active" | "completed" | "delayed";
  duration: number;
  issues: number;
  progress: number;
  startDate: string;
  endDate: string;
  description?: string;
}

interface Project {
  id: number;
  name: string;
  dateDebut: string;
  chefProjet: string;
  equipe: string;
  phases: Phase[];
}

// Données par défaut pour les phases
const defaultPhases: Phase[] = [
  {
    title: "Conception",
    status: "completed",
    duration: 15,
    issues: 2,
    progress: 100,
    startDate: "1 mars",
    endDate: "15 mars",
    description: "Définition des objectifs, brainstorming et élaboration du concept.",
  },
  {
    title: "Développement Frontend",
    status: "active",
    duration: 25,
    issues: 5,
    progress: 65,
    startDate: "16 mars",
    endDate: "9 avril",
    description: "Création de l'interface utilisateur avec un design moderne et ergonomique.",
  },
  {
    title: "Intégration API",
    status: "delayed",
    duration: 18,
    issues: 8,
    progress: 30,
    startDate: "10 avril",
    endDate: "27 avril",
    description: "Intégration des services backend via API et tests d'interopérabilité.",
  },
  {
    title: "Tests & Validation",
    status: "planned",
    duration: 12,
    issues: 0,
    progress: 0,
    startDate: "28 avril",
    endDate: "9 mai",
    description: "Phase de tests unitaires, d'intégration et validation finale avant livraison.",
  },
];

// Exemples de projets
const projects: Project[] = [
  {
    id: 1,
    name: "Projet Alpha",
    dateDebut: "10 janvier 2024",
    chefProjet: "Alice Dupont",
    equipe: "Développement & Design",
    phases: defaultPhases,
  },
  {
    id: 2,
    name: "Projet Beta",
    dateDebut: "15 février 2024",
    chefProjet: "Bob Martin",
    equipe: "Marketing & Ventes",
    phases: [
      {
        title: "Planification",
        status: "completed",
        duration: 10,
        issues: 1,
        progress: 100,
        startDate: "5 mars",
        endDate: "15 mars",
        description: "Définition des besoins et des ressources.",
      },
      {
        title: "Design",
        status: "active",
        duration: 20,
        issues: 3,
        progress: 50,
        startDate: "16 mars",
        endDate: "4 avril",
        description: "Création de maquettes et prototypes.",
      },
      {
        title: "Développement",
        status: "planned",
        duration: 30,
        issues: 0,
        progress: 0,
        startDate: "5 avril",
        endDate: "4 mai",
        description: "Codage et intégration des fonctionnalités.",
      },
    ],
  },
];

// Styles dynamiques selon le statut
const getStatusStyles = (status: string) => {
  switch (status) {
    case "completed":
      return {
        border: "border-green-300 dark:border-green-400",
        bg: "bg-green-50 dark:bg-green-900/20",
        progress: "bg-green-400",
      };
    case "active":
      return {
        border: `border-[${couleurPrimaire}] dark:border-[${couleurPrimaire}]`,
        bg: "bg-purple-50 dark:bg-purple-900/20",
        progress: `bg-[${couleurPrimaire}]`,
      };
    case "delayed":
      return {
        border: "border-rose-300 dark:border-rose-400",
        bg: "bg-rose-50 dark:bg-rose-900/20",
        progress: "bg-rose-400",
      };
    case "planned":
      return {
        border: "border-gray-200 dark:border-slate-700",
        bg: "bg-gray-50 dark:bg-slate-700",
        progress: "bg-gray-300",
      };
    default:
      return {
        border: "border-gray-200 dark:border-slate-700",
        bg: "bg-gray-50 dark:bg-slate-700",
        progress: "bg-gray-300",
      };
  }
};

// Icône selon le statut de la phase
const getStatusIcon = (status: Phase["status"]) => {
  switch (status) {
    case "completed":
      return <CheckCircleIcon className="w-5 h-5" style={{ color: vertAccent }} />;
    case "active":
      return <PlayIcon className="w-5 h-5" style={{ color: couleurPrimaire }} />;
    case "delayed":
      return <ExclamationTriangleIcon className="w-5 h-5" style={{ color: orangeAccent }} />;
    case "planned":
      return <EllipsisHorizontalIcon className="w-5 h-5 text-gray-500" />;
    default:
      return null;
  }
};

// Composant affichant le cycle de vie d'un projet
function ProjectCycleCard({
  project,
  onBack,
}: {
  project: Project;
  onBack: () => void;
}) {
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "active" | "delayed" | "planned">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);

  // Calcul de la progression globale
  const overallProgress = Math.round(
    project.phases.reduce((acc, phase) => acc + phase.progress, 0) / project.phases.length
  );

  // Filtrage des phases
  const filteredPhases = project.phases.filter((phase) => {
    const statutOk = filterStatus === "all" ? true : phase.status === filterStatus;
    const rechercheOk = phase.title.toLowerCase().includes(searchTerm.toLowerCase());
    return statutOk && rechercheOk;
  });

  return (
    <section className="p-6 bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 rounded-xl shadow-2xl space-y-6 transition-all duration-300">
      <button
        onClick={onBack}
        className="flex items-center text-sm text-purple-600 hover:underline transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-1" /> Retour à la liste des projets
      </button>
      <div className="flex flex-col gap-1">
        <h2 className="flex items-center text-2xl font-bold text-slate-800 dark:text-white">
          <ArrowPathIcon className="w-8 h-8 mr-2" style={{ color: couleurPrimaire }} />
          {project.name}
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <p>Début : {project.dateDebut}</p>
          <p>Chef de projet : {project.chefProjet}</p>
          <p>Équipe : {project.equipe}</p>
        </div>
      </div>

      {/* Progression globale */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 bg-gray-100 dark:bg-slate-700 rounded-lg shadow-md flex justify-between items-center transition-all duration-300"
      >
        <div className="flex items-center">
          <InformationCircleIcon className="w-6 h-6 mr-2" style={{ color: couleurPrimaire }} />
          <div className="text-slate-800 dark:text-white">
            <p className="text-sm">Progression globale</p>
            <p className="text-2xl font-bold">{overallProgress}%</p>
          </div>
        </div>
      </motion.div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="relative flex items-center">
          <FilterIcon className="w-5 h-5 text-slate-500 absolute left-3" />
          <input
            type="text"
            placeholder="Rechercher une phase…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-4 py-3 text-lg rounded-lg border border-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 transition-all duration-300"
            style={{ "--tw-ring-color": couleurPrimaire } as React.CSSProperties}
          />
        </div>
        <div className="flex gap-4">
          {(
            ["all", "completed", "active", "delayed", "planned"] as const
          ).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={
                filterStatus === status
                  ? { backgroundColor: couleurPrimaire, color: "white" }
                  : {}
              }
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                filterStatus === status
                  ? ""
                  : "bg-purple-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300"
              }`}
            >
              {libellesStatut[status]}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline des phases */}
      <div className="relative pb-4 overflow-x-auto">
        <div className="flex md:grid grid-cols-4 gap-4 min-w-[800px] md:min-w-0">
          {filteredPhases.map((phase) => {
            const { border, bg, progress } = getStatusStyles(phase.status);
            return (
              <motion.div
                key={phase.title}
                className="group relative cursor-pointer transition-transform duration-300"
                onClick={() => setSelectedPhase(phase)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className={`p-4 border-2 ${border} rounded-lg transition-all duration-300 ${bg} hover:border-[${couleurPrimaire}] dark:hover:border-[${couleurPrimaire}]`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(phase.status)}
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100">{phase.title}</h3>
                    </div>
                    <span className={`w-3 h-3 rounded-full ${progress}`} />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                    {phase.startDate} – {phase.endDate}
                  </p>
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-300 mb-2">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    <span>{phase.duration} jours</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${progress}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${phase.progress}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                  {phase.issues > 0 && (
                    <div className="flex items-center gap-2 text-rose-600 mt-2">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      <span className="text-sm">
                        {phase.issues} problème{phase.issues > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>
                {/* Info-bulle */}
                {phase.description && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs p-2 rounded shadow-md">
                      {phase.description}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Légende */}
      <div className="mt-6 flex flex-wrap gap-4 items-center text-sm text-slate-600 dark:text-slate-200">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-400" /> Terminée
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: couleurPrimaire }} /> En cours
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-400" /> En retard
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gray-300" /> Planifiée
        </div>
      </div>

      {/* Modal détails phase */}
      <AnimatePresence>
        {selectedPhase && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl w-full max-w-lg relative"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <button
                onClick={() => setSelectedPhase(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
              <h2 className="flex items-center text-2xl font-bold text-slate-800 dark:text-white mb-4">
                {getStatusIcon(selectedPhase.status)}
                <span className="ml-2">{selectedPhase.title}</span>
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                Statut : <span className="font-medium">{libellesStatut[selectedPhase.status]}</span>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                Durée : {selectedPhase.duration} jours ({selectedPhase.startDate} – {selectedPhase.endDate})
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                Progression : {selectedPhase.progress}%
              </p>
              {selectedPhase.description && (
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {selectedPhase.description}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// Liste des projets
function ProjectList({ onSelect }: { onSelect: (project: Project) => void }) {
  return (
    <div className="p-6 bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 rounded-xl shadow-2xl space-y-6 transition-all duration-300">
      <h1 className="flex items-center text-4xl font-extrabold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
        <div className="p-3 rounded-xl" style={{ backgroundColor: couleurPrimaire + "20" }} />
        <span className="ml-4">Sélectionnez un projet pour voir son cycle de vie</span>
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            whileHover={{ scale: 1.03 }}
            onClick={() => onSelect(project)}
            className="p-6 bg-white dark:bg-slate-700 rounded-2xl shadow-xl cursor-pointer border border-transparent hover:border-2 hover:border-[#b03ff3] transition-all duration-300"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{project.name}</h3>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p>Début : {project.dateDebut}</p>
              <p>Chef : {project.chefProjet}</p>
              <p>Équipe : {project.equipe}</p>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Nombre de phases : {project.phases.length}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Composant principal
export default function GlobalProjectDashboard() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      {!selectedProject ? (
        <ProjectList onSelect={(project) => setSelectedProject(project)} />
      ) : (
        <ProjectCycleCard project={selectedProject} onBack={() => setSelectedProject(null)} />
      )}
    </div>
  );
}
