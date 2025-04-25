"use client";

import { JSX, useState } from "react";
import {
  ClockIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  UserCircleIcon,
  ArchiveBoxIcon,
  ChartBarIcon,
  ArrowUpTrayIcon,
  ShieldExclamationIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from "recharts";

// Palette de couleurs
const primaryColor = "#b03ff3"; // mauve dominant
const accentYellow = "#FFC107";
const accentGreen = "#4CAF50";
const accentOrange = "#FF9800";
const accentPurple = "#9b59b6"; // ou la valeur de votre choix

// Définition du type Projet
type Projet = {
  id: string;
  nom: string;
  dateDebut: Date;
  chefProjet: string;
  equipe: string;
};

// Liste de projets (exemple)
const projets: Projet[] = [
  { id: "alpha", nom: "Projet Alpha", dateDebut: new Date("2024-01-10"), chefProjet: "Alice Dupont", equipe: "Développement & Design" },
  { id: "beta", nom: "Projet Beta", dateDebut: new Date("2024-02-15"), chefProjet: "Bob Martin", equipe: "Marketing & Ventes" },
  { id: "gamma", nom: "Projet Gamma", dateDebut: new Date("2024-03-01"), chefProjet: "Claire Legrand", equipe: "Innovation & R&D" },
];

// Définition du type d'audit log
type AuditLog = {
  id: number;
  timestamp: Date;
  user: string;
  action: "create" | "update" | "delete";
  target: string;
  details: string;
};

// Exemple d'audit logs (pour chaque projet, on pourrait imaginer des logs spécifiques)
const mockLogs: AuditLog[] = [
  { id: 1, timestamp: new Date("2024-03-20T09:30"), user: "admin@exemple.com", action: "create", target: "Ticket #1452", details: "Création du ticket" },
  { id: 2, timestamp: new Date("2024-03-20T10:15"), user: "user@domaine.com", action: "update", target: "Projet X", details: "Changement de statut" },
  { id: 3, timestamp: new Date("2024-03-20T11:00"), user: "manager@org.com", action: "delete", target: "Document", details: "Suppression fichier client.pdf" },
];

// Exemple de données pour le graphique d'évolution des actions
const auditGraphData = [
  { day: 'Lun', create: 2, update: 1, delete: 0 },
  { day: 'Mar', create: 1, update: 2, delete: 1 },
  { day: 'Mer', create: 3, update: 1, delete: 0 },
  { day: 'Jeu', create: 0, update: 1, delete: 1 },
  { day: 'Ven', create: 2, update: 0, delete: 2 },
  { day: 'Sam', create: 1, update: 1, delete: 0 },
  { day: 'Dim', create: 0, update: 0, delete: 0 },
];

// Définition des props pour le composant StatsCard
type StatsCardProps = {
  title: string;
  count: number;
  icon: JSX.Element;
  bgClass: string;
};

// Composant StatsCard (design et couleurs similaires)
const StatsCard = ({ title, count, icon, bgClass }: StatsCardProps) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className={`flex items-center p-4 ${bgClass} text-gray-800 rounded-xl shadow-lg`}
  >
    <div className="p-3 bg-white bg-opacity-30 rounded-full mr-4">{icon}</div>
    <div>
      <p className="text-sm">{title}</p>
      <p className="font-bold text-2xl">{count}</p>
    </div>
  </motion.div>
);

// Fonction pour obtenir la couleur selon l'action
const getActionColor = (action: AuditLog["action"]) => {
  switch (action) {
    case "create":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
    case "update":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
    case "delete":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
  }
};

// En-tête de l'historique pour le projet sélectionné (design inspiré de la page d'analyse)
const Header = ({ projet }: { projet: Projet }) => {
  const currentDate = new Date();
  return (
    <div className="mb-8">
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl font-bold flex items-center gap-3"
        style={{ color: primaryColor }}
      >
        <div className="p-3 rounded-xl" style={{ backgroundColor: primaryColor + "20" }}>
          <ClockIcon className="w-8 h-8" style={{ color: primaryColor }} />
        </div>
        <span className="flex items-center text-4xl font-extrabold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
          Historique du {projet.nom}
        </span>
      </motion.h1>
      <p className="text-gray-600 dark:text-gray-300">
        Début : {projet.dateDebut.toLocaleDateString("fr-FR")} • Chef de projet : {projet.chefProjet} • Équipe : {projet.equipe}
      </p>
      <p className="mt-2 text-lg font-medium text-gray-700 dark:text-gray-400">
        Aujourd'hui, c'est le{" "}
        {currentDate.toLocaleDateString("fr-FR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
    </div>
  );
};

// Graphique d'évolution des actions (design similaire)
const GraphAudit = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="mb-8 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg"
  >
    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
      <ChartBarIcon className="w-6 h-6" style={{ color: primaryColor }} />
      Évolution des Actions
    </h2>
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={auditGraphData}>
        <XAxis dataKey="day" stroke={primaryColor} tick={{ fontSize: 12 }} />
        <Tooltip contentStyle={{ backgroundColor: "#fff", border: "none" }} />
        <Line type="monotone" dataKey="create" stroke={accentGreen} strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="update" stroke={primaryColor} strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="delete" stroke={accentOrange} strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  </motion.div>
);

// Composant pour afficher chaque audit log
const AuditLogCard = ({ log }: { log: AuditLog }) => (
  <div className="p-4 hover:bg-purple-50 dark:hover:bg-purple-800 transition-colors">
    <div className="flex items-start gap-4">
      <div className={`p-2 rounded-lg ${getActionColor(log.action)}`}>
        <DocumentTextIcon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-medium dark:text-white">{log.target}</span>
          <span className={`text-xs px-2 py-1 rounded-full ${getActionColor(log.action)}`}>
            {log.action}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(log.timestamp)}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{log.details}</p>
        <div className="mt-2 flex items-center gap-2 text-sm">
          <UserCircleIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span className="text-gray-500 dark:text-gray-400">{log.user}</span>
        </div>
      </div>
    </div>
  </div>
);

// Composant regroupant l'historique d'un projet
const HistoriqueProjet = ({ projet }: { projet: Projet }) => {
  // Pour cet exemple, nous utilisons les mêmes logs pour chaque projet.
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAction, setSelectedAction] = useState<string>("all");

  const filteredLogs = mockLogs.filter(
    (log) =>
      (log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.target.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (selectedAction === "all" || log.action === selectedAction)
  );

  const totalLogs = mockLogs.length;
  const createLogs = mockLogs.filter((log) => log.action === "create").length;
  const updateLogs = mockLogs.filter((log) => log.action === "update").length;
  const deleteLogs = mockLogs.filter((log) => log.action === "delete").length;

  return (
    <section className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-2xl space-y-8">
      <button
        onClick={() => window.location.reload()}
        className="flex items-center text-sm hover:underline"
        style={{ color: primaryColor }}
      >
        <ArrowLeftIcon className="w-4 h-4 mr-1" /> Retour à la liste des projets
      </button>
      <Header projet={projet} />

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Actions" 
          count={totalLogs}  
          icon={<DocumentTextIcon className="w-6 h-6" style={{ color: accentPurple }} />}  
          bgClass="bg-purple-100" 
        />
        <StatsCard 
          title="Créations" 
          count={createLogs} 
          icon={<DocumentTextIcon className="w-6 h-6" style={{ color: accentOrange }} />}  
          bgClass="bg-orange-100"
        />
        <StatsCard 
          title="Modifications" 
          count={updateLogs} 
          icon={<ClockIcon className="w-6 h-6" style={{ color: accentGreen }} />} 
          bgClass="bg-green-100"
        />
        <StatsCard 
          title="Suppressions" 
          count={deleteLogs} 
          icon={<ArchiveBoxIcon className="w-6 h-6" style={{ color: accentYellow }} />} 
          bgClass="bg-yellow-100" 
        />
      </div>

      {/* Recherche et filtre */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400 dark:text-gray-300" />
        </div>
        <select
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
          className="rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="all">Toutes les actions</option>
          <option value="create">Créations</option>
          <option value="update">Modifications</option>
          <option value="delete">Suppressions</option>
        </select>
      </div>

      {/* Graphique d'évolution des actions */}
      <GraphAudit />

      {/* Liste des logs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 divide-y divide-gray-200 dark:divide-gray-700">
          {filteredLogs.map((log) => (
            <AuditLogCard key={log.id} log={log} />
          ))}
        </div>
        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <ArchiveBoxIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Aucune activité récente</p>
          </div>
        )}
      </div>
    </section>
  );
};

// Composant pour afficher la liste des projets
const ProjectList = ({ onSelect }: { onSelect: (projet: Projet) => void }) => {
  return (
    <div className="p-6 bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 rounded-xl shadow-2xl space-y-6">
      <h1 className="flex items-center text-4xl font-extrabold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
        <div className="p-3 rounded-xl" style={{ backgroundColor: primaryColor + "20" }}></div>
        <span className="ml-4">Sélectionnez un projet pour consulter son historique</span>
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projets.map((projet) => (
          <motion.div
            key={projet.id}
            whileHover={{ scale: 1.03 }}
            onClick={() => onSelect(projet)}
            className="p-6 bg-gray-50 dark:bg-slate-700 rounded-2xl shadow-xl cursor-pointer border border-transparent hover:border-[3px] hover:border-[#b03ff3] transition"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{projet.nom}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Début : {projet.dateDebut.toLocaleDateString("fr-FR")}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Chef : {projet.chefProjet}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Équipe : {projet.equipe}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Composant principal gérant l'affichage de la liste ou de l'historique selon le projet sélectionné
export default function HistoriqueProjets() {
  const [selectedProject, setSelectedProject] = useState<Projet | null>(null);

  if (!selectedProject) {
    return (
      <section className="p-6">
        <ProjectList onSelect={(projet) => setSelectedProject(projet)} />
      </section>
    );
  }

  return <HistoriqueProjet projet={selectedProject} />;
}
