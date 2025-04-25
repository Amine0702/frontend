"use client";

import { JSX, useState } from "react";
import {
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  TableCellsIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from "recharts";
import { motion } from "framer-motion";

// Palette de couleurs
const primaryColor = "#b03ff3"; // mauve dominant
const accentYellow = "#FFC107";
const accentGreen = "#4CAF50";
const accentOrange = "#FF9800";

// Définition du type Task
type Task = {
  id: number;
  name: string;
  dueDate: Date;
  predictedDelay: number;
  status: "on-track" | "risk" | "delayed";
  confidenceLevel: number;
};

const mockTasks: Task[] = [
  { id: 1, name: "Développement API", dueDate: new Date("2024-04-01"), predictedDelay: 2, status: "risk", confidenceLevel: 85 },
  { id: 2, name: "Tests Utilisateurs", dueDate: new Date("2024-04-05"), predictedDelay: 5, status: "delayed", confidenceLevel: 92 },
  { id: 3, name: "Intégration IA", dueDate: new Date("2024-04-03"), predictedDelay: 0, status: "on-track", confidenceLevel: 78 },
];

// Définition du type Projet avec informations supplémentaires
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
  { id: "alpha 1", nom: "Projet Alpha1", dateDebut: new Date("2024-01-10"), chefProjet: "Alice Dupont", equipe: "Développement & Design" },
  { id: "beta 1", nom: "Projet Beta1", dateDebut: new Date("2024-02-15"), chefProjet: "Bob Martin", equipe: "Marketing & Ventes" },
  { id: "gamma 1", nom: "Projet Gamma1", dateDebut: new Date("2024-03-01"), chefProjet: "Claire Legrand", equipe: "Innovation & R&D" },
];

// Composant pour afficher un badge en fonction du statut
const RiskBadge = ({ status }: { status: Task["status"] }) => {
  const statusConfig = {
    "on-track": { color: "bg-green-100 text-green-800", label: "Dans les temps" },
    risk: { color: "bg-yellow-100 text-yellow-800", label: "À risque" },
    delayed: { color: "bg-orange-100 text-orange-800", label: "En retard" },
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig[status].color}`}>
      {statusConfig[status].label}
    </span>
  );
};

// Tooltip personnalisé pour le graphique
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded shadow">
        <p className="text-sm font-medium text-gray-800 dark:text-white">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-300">Retard : {payload[0].value} j</p>
      </div>
    );
  }
  return null;
};

// Graphique des retards prédis
const DelayChart = () => {
  const chartData = mockTasks.map(task => ({
    name: task.name,
    delay: task.predictedDelay,
  }));
  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
        <ChartBarIcon className="w-6 h-6" style={{ color: primaryColor }} />
        Retards Prédits
      </h2>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData}>
          <XAxis dataKey="name" stroke={primaryColor} tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="delay" fill={primaryColor} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Composant de carte statistique avec couleurs soft
const StatsCard = ({
  title,
  value,
  icon,
  bgClass,
}: {
  title: string;
  value: string;
  icon: JSX.Element;
  bgClass: string;
}) => (
  <motion.div whileHover={{ scale: 1.05 }} className={`flex items-center p-4 ${bgClass} text-gray-800 rounded-xl shadow-lg`}>
    <div className="p-3 bg-white bg-opacity-30 rounded-full mr-4">{icon}</div>
    <div>
      <p className="text-sm">{title}</p>
      <p className="font-bold text-2xl">{value}</p>
    </div>
  </motion.div>
);

// En-tête de la page d'analyse avec informations du projet
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
          <SparklesIcon className="w-8 h-8" style={{ color: primaryColor }} />
        </div>
        <span className="flex items-center text-4xl font-extrabold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">Analyse du {projet.nom}</span>
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

// Section des statistiques
const Statistics = () => {
  const totalDelay = mockTasks.reduce((acc, task) => acc + task.predictedDelay, 0);
  const averageDelay = (totalDelay / mockTasks.length).toFixed(1);
  const averageConfidence = (
    mockTasks.reduce((acc, task) => acc + task.confidenceLevel, 0) / mockTasks.length
  ).toFixed(0);
  const timeSaved = "42h";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <StatsCard
        title="Retard moyen prédit"
        value={`${averageDelay} j`}
        icon={<ExclamationTriangleIcon className="w-6 h-6" style={{ color: accentOrange }} />}
        bgClass="bg-orange-100"
      />
      <StatsCard
        title="Précision du modèle"
        value={`${averageConfidence}%`}
        icon={<ChartBarIcon className="w-6 h-6" style={{ color: accentGreen }} />}
        bgClass="bg-green-100"
      />
      <StatsCard
        title="Temps économisé"
        value={timeSaved}
        icon={<ClockIcon className="w-6 h-6" style={{ color: accentYellow }} />}
        bgClass="bg-yellow-100"
      />
    </div>
  );
};

// Tableau des tâches avec colonnes organisées et couleurs soft mauve pastel
const TasksTable = () => {
  const [selectedRisk, setSelectedRisk] = useState<"all" | "risk" | "delayed">("all");
  const filteredTasks = mockTasks.filter(task =>
    selectedRisk === "all" ? true : task.status === selectedRisk
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <TableCellsIcon className="w-6 h-6" />
          Liste des Tâches
        </h2>
        <select
          value={selectedRisk}
          onChange={(e) => setSelectedRisk(e.target.value as "all" | "risk" | "delayed")}
          className="rounded-lg border-gray-300 focus:border-[#b03ff3] focus:ring-[#b03ff3] text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="all">Tous les statuts</option>
          <option value="risk">À risque</option>
          <option value="delayed">En retard</option>
        </select>
      </div>
      {/* En-têtes horizontaux */}
      <div className="flex bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-medium text-xs uppercase">
        <div className="flex-1 px-6 py-3 flex items-center gap-1">
          <DocumentTextIcon className="w-4 h-4" /> Tâche
        </div>
        <div className="w-32 px-6 py-3 flex items-center gap-1">
          <ExclamationTriangleIcon className="w-4 h-4" /> Statut
        </div>
        <div className="w-32 px-6 py-3 flex items-center gap-1">
          <ClockIcon className="w-4 h-4" /> Retard
        </div>
        <div className="w-32 px-6 py-3 flex items-center gap-1">
          <ChartBarIcon className="w-4 h-4" /> Confiance
        </div>
      </div>
      {/* Corps du tableau */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {filteredTasks.map(task => (
          <motion.div
            key={task.id}
            whileHover={{ scale: 1.01 }}
            className="flex hover:bg-purple-50 dark:hover:bg-purple-800 text-gray-900 dark:text-white text-sm p-4 items-center"
          >
            <div className="flex-1 px-6">{task.name}</div>
            <div className="w-32 px-6">
              <RiskBadge status={task.status} />
            </div>
            <div className="w-32 px-6">{task.predictedDelay} j</div>
            <div className="w-32 px-6">
              <div className="flex items-center">
                <div className="w-20 h-2 bg-purple-200 rounded-full">
                  <div className="h-full bg-purple-600 rounded-full" style={{ width: `${task.confidenceLevel}%` }} />
                </div>
                <span className="ml-2">{task.confidenceLevel}%</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <TableCellsIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-300" />
          <p className="mt-4 text-sm text-gray-500">Aucune tâche correspondante</p>
        </div>
      )}
    </div>
  );
};

// Alerte proactive en cas de tâches présentant un risque ou retard
const ProactiveAlert = () => {
  const alertTasks = mockTasks.filter(task => task.status !== "on-track");
  if (alertTasks.length === 0) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg shadow-lg flex items-center gap-3"
    >
      <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
      <span className="text-red-800 dark:text-red-300 text-sm">
        Attention : {alertTasks.length} tâche(s) présentent un risque ou sont en retard.
      </span>
    </motion.div>
  );
};

// Composant pour afficher la liste des projets avec un design original (inchangé)
const ProjectList = ({ onSelect }: { onSelect: (projet: Projet) => void }) => {
  return (
    <div className="p-6 bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 rounded-xl shadow-2xl space-y-6">
      <h1 className="flex items-center text-4xl font-extrabold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
        <div className="p-3 rounded-xl" style={{ backgroundColor: primaryColor + "20" }}></div>
        <span className="ml-4">Sélectionnez un projet pour analyser le retard</span>
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

// Composant principal
export default function AnalyseDeRetard() {
  const [selectedProject, setSelectedProject] = useState<Projet | null>(null);

  if (!selectedProject) {
    return (
      <section className="p-6">
        <ProjectList onSelect={(projet) => setSelectedProject(projet)} />
      </section>
    );
  }

  return (
    <section className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-2xl space-y-6">
      <button
        onClick={() => setSelectedProject(null)}
        className="flex items-center text-sm hover:underline"
        style={{ color: primaryColor }}
      >
        <ArrowLeftIcon className="w-4 h-4 mr-1" /> Retour à la liste des projets
      </button>
      <Header projet={selectedProject} />
      <Statistics />
      <DelayChart />
      <ProactiveAlert />
      <TasksTable />
    </section>
  );
}
