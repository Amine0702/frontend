'use client';
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar  from "@/components/ui/avatar/Avatar";
import {
  DocumentTextIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

const primaryColor = "#b03ff3";
const accentYellow = "#FFC107";
const accentGreen = "#4CAF50";
const accentOrange = "#FF9800";

interface LogEntry {
  id: string;
  timestamp: string;
  nom: string;
  contenu: string;
  utilisateur?: {
    nom: string;
    avatar: string;
  };
}

type Projet = {
  id: string;
  nom: string;
  dateDebut: Date;
  chefProjet: string;
  equipe: string;
};

const projets: Projet[] = [
  { id: "alpha", nom: "Projet Alpha", dateDebut: new Date("2024-01-10"), chefProjet: "Alice Dupont", equipe: "Développement & Design" },
  { id: "beta", nom: "Projet Beta", dateDebut: new Date("2024-02-15"), chefProjet: "Bob Martin", equipe: "Marketing & Ventes" },
  { id: "gamma", nom: "Projet Gamma", dateDebut: new Date("2024-03-01"), chefProjet: "Claire Legrand", equipe: "Innovation & R&D" },
];

const logsData: { [projetId: string]: LogEntry[] } = {
  alpha: [
    {
      id: "log1",
      timestamp: "2024-03-15 10:15:00",
      nom: "Création ticket Kanban",
      contenu: "Ticket créé par IA, action réalisée par Alice Dupont, le 15/03/2024 à 10:15.",
      utilisateur: {
        nom: "Alice Dupont",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
      },
    },
    {
      id: "log2",
      timestamp: "2024-03-16 09:30:00",
      nom: "Résumé de réunion",
      contenu: "Résumé généré par IA pour la réunion du 16/03/2024, projet Alpha.",
      utilisateur: {
        nom: "Bob Martin",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
      },
    },
  ],
  beta: [
    {
      id: "log3",
      timestamp: "2024-03-17 11:20:00",
      nom: "Mise à jour de statut",
      contenu: "Statut mis à jour par IA pour le projet Beta le 17/03/2024.",
      utilisateur: {
        nom: "Claire Legrand",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Claire",
      },
    },
  ],
  gamma: [
    {
      id: "log4",
      timestamp: "2024-03-18 14:45:00",
      nom: "Création d'un rapport",
      contenu: "Rapport généré par IA pour le projet Gamma, le 18/03/2024.",
      utilisateur: {
        nom: "David Bernard",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
      },
    },
  ],
};

const ProjectList = ({
  onSelect,
}: {
  onSelect: (projet: Projet) => void;
}) => {
  return (
    <div className="p-6 bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 rounded-xl shadow-2xl space-y-6 transition-all duration-300">
      <h1 className="flex items-center text-4xl font-extrabold bg-gradient-to-r from-[#b03ff3] to-blue-500 bg-clip-text text-transparent">
        <div className="p-3 rounded-xl" style={{ backgroundColor: primaryColor + "20" }}></div>
        <span className="ml-4">Sélectionnez un projet</span>
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projets.map((projet) => (
          <motion.div
            key={projet.id}
            whileHover={{ scale: 1.03 }}
            onClick={() => onSelect(projet)}
            className="p-6 bg-gray-50 dark:text-white dark:bg-slate-700 rounded-2xl shadow-xl cursor-pointer border border-transparent hover:border-[3px] hover:border-[#b03ff3] transition"
          >
            <h3 className="text-xl font-bold mb-2">{projet.nom}</h3>
            <p className="text-sm">Début : {projet.dateDebut.toLocaleDateString("fr-FR")}</p>
            <p className="text-sm">Chef : {projet.chefProjet}</p>
            <p className="text-sm">Équipe : {projet.equipe}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const ProjectLogs = ({
  projet,
  logs,
  onBack,
}: {
  projet: Projet;
  logs: LogEntry[];
  onBack: () => void;
}) => {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState(""); // pas null !
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.nom.toLowerCase().includes(search.toLowerCase());
    const matchesDate = dateFilter
      ? new Date(log.timestamp).toDateString() === new Date(dateFilter).toDateString()
      : true;
    return matchesSearch && matchesDate;
  });
  

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-2xl space-y-6 transition-all duration-300">
      <button
        onClick={onBack}
        className="flex items-center text-sm text-primary hover:underline transition-colors dark:text-white"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-1" /> Retour aux projets
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
          Journal d'Activité - {projet.nom}
        </h2>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher une activité..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-purple-500 dark:text-white transition-all duration-300"
            />
          </div>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="date"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-[#b03ff3]"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 mt-6">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <motion.div
              key={log.id}
              whileHover={{ scale: 1.01 }}
              className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg cursor-pointer hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-600"
              onClick={() => setSelectedLog(log)}
            >
              <div className="flex items-center gap-4">
                <div className="rounded-full overflow-hidden w-10 h-10 flex-shrink-0">
                  <img 
                    src={log.utilisateur?.avatar} 
                    alt={log.utilisateur?.nom}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{log.nom}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>{new Date(log.timestamp).toLocaleString('fr-FR')}</span>
                    <span>•</span>
                    <span>{log.utilisateur?.nom}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            Aucune activité trouvée
          </p>
        )}
      </div>

      <AnimatePresence>
        {selectedLog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedLog(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="rounded-full overflow-hidden w-12 h-12">
                  <img 
                    src={selectedLog.utilisateur?.avatar} 
                    alt={selectedLog.utilisateur?.nom}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedLog.nom}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(selectedLog.timestamp).toLocaleString('fr-FR')} • {selectedLog.utilisateur?.nom}
                  </p>
                </div>
              </div>
              <div className="mb-6 text-gray-700 dark:text-gray-300">
                {selectedLog.contenu}
              </div>
              <button
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-300"
                onClick={() => setSelectedLog(null)}
              >
                Fermer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Dashboard() {
  const [selectedProject, setSelectedProject] = useState<Projet | null>(null);

  return (
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-slate-900 transition-colors duration-300">
      {!selectedProject ? (
        <ProjectList onSelect={(projet) => setSelectedProject(projet)} />
      ) : (
        <ProjectLogs
          projet={selectedProject}
          logs={logsData[selectedProject.id] || []}
          onBack={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}
