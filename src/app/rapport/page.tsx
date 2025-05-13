"use client";
import "./rapport.css";
import { useState, useEffect } from "react";
import type React from "react";
import jsPDF from "jspdf";
import { useAuth, useUser } from "@clerk/nextjs";

import { useToast } from "@/app/(components)/ui/use-toast";
import {
  FileText,
  Calendar,
  Download,
  TrendingUp,
  Briefcase,
  Users,
  User,
  CalendarIcon,
  CheckSquare,
  Loader2,
  AlertTriangle,
  PlusCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/(components)/ui/card";
import { Button } from "@/app/(components)/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/(components)/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/(components)/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/app/(components)/ui/dialog";
import { Progress } from "@/app/(components)/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/(components)/ui/accordion";
import { Badge } from "@/app/(components)/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/(components)/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert";

import {
  useGetProjectStatsQuery,
  useGetAllProjectsStatsQuery,
  useGetReportHistoryQuery,
  useGenerateProjectReportMutation,
  useScheduleProjectReportMutation,
  useGetUserProjectsQuery,
} from "@/app/state/api";

// Types pour les données
interface Manager {
  name: string;
  email: string;
  avatar?: string;
  pivot?: {
    role?: string;
  };
}

interface Project {
  id: string | number;
  name: string;
  status?: string;
  progress: number;
  start_date: string;
  end_date: string;
  manager?: Manager;
  team?: number;
  clerk_user_id?: string;
}

interface Task {
  id: string | number;
  name: string;
  status: string;
  progress: number;
  startDate?: string;
  endDate?: string;
}

interface TeamMember {
  id: string | number;
  name: string;
  role?: string;
  avatar?: string;
  tasks?: Task[];
}

interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  tasksByStatus: Record<string, number>;
  tasksByPriority: Record<string, number>;
  teamPerformance?: TeamPerformanceItem[];
  performanceData?: PerformanceDataItem[];
}

interface TeamPerformanceItem {
  memberId: string | number;
  name: string;
  tasksCompleted: number;
  completionRate: number;
  averageCompletionTime: number;
}

interface PerformanceDataItem {
  name: string;
  actuel: number;
  precedent: number;
}

interface ProjectData {
  project: Project;
  stats: ProjectStats;
  team: TeamMember[];
}

interface AllProjectsData {
  projects: Project[];
}

interface Report {
  id: string | number;
  name: string;
  created_at: string;
  project_id?: string | number;
}

const AutomatedReport = () => {
  // États de configuration
  const [project, setProject] = useState<string>("");
  const [period, setPeriod] = useState<string>("month");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [reportGenerated, setReportGenerated] = useState<boolean>(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState<boolean>(false);
  const [scheduleDate, setScheduleDate] = useState<string>("");
  const { toast } = useToast();

  // Récupérer l'utilisateur connecté via Clerk
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();

  // Récupérer les projets de l'utilisateur connecté
  const {
    data: userProjects,
    isLoading: isLoadingUserProjects,
    error: userProjectsError,
  } = useGetUserProjectsQuery(userId || "", {
    skip: !userId,
  });

  // Récupérer les données des projets
  const {
    data: allProjectsData,
    isLoading: isLoadingAllProjects,
    error: allProjectsError,
  } = useGetAllProjectsStatsQuery({});

  const {
    data: projectData,
    isLoading: isLoadingProject,
    error: projectError,
  } = useGetProjectStatsQuery(project, {
    skip: !project,
  });

  // Récupérer l'historique des rapports
  const { data: reportHistory, isLoading: isLoadingHistory } =
    useGetReportHistoryQuery({});

  // Mutations pour générer et planifier des rapports
  const [generateReport, { isLoading: isGeneratingReport }] =
    useGenerateProjectReportMutation();
  const [scheduleReport, { isLoading: isSchedulingReport }] =
    useScheduleProjectReportMutation();

  // Générer les options de projets à partir des données
  const getProjectOptions = () => {
    const options: { value: any; span: any }[] = [];

    console.log("Utilisateur connecté:", userId);
    console.log("Projets de l'utilisateur:", userProjects);

    // Vérifier si nous avons des projets de l'utilisateur
    if (
      userProjects?.managerProjects &&
      Array.isArray(userProjects.managerProjects)
    ) {
      userProjects.managerProjects.forEach(
        (proj: { id: { toString: () => any }; name: any }) => {
          options.push({ value: proj.id.toString(), span: proj.name });
        },
      );
    }

    // Si aucun projet n'est trouvé, vérifier d'autres sources possibles
    if (options.length === 0) {
      // Vérifier dans les données générales si des projets appartiennent à l'utilisateur
      if (
        allProjectsData?.projects &&
        Array.isArray(allProjectsData.projects)
      ) {
        allProjectsData.projects
          .filter(
            (proj: { clerk_user_id: string | null | undefined }) =>
              proj.clerk_user_id === userId,
          )
          .forEach((proj: { id: { toString: () => any }; name: any }) => {
            options.push({ value: proj.id.toString(), span: proj.name });
          });
      }
    }

    if (options.length === 0) {
      console.log("Aucun projet trouvé pour l'utilisateur:", userId);
    }

    return options;
  };

  // Définir le projet par défaut au premier projet disponible
  useEffect(() => {
    const options = getProjectOptions();
    if (options.length > 0 && !project) {
      setProject(options[0].value);
      console.log("Projet par défaut défini:", options[0].value);
    }
  }, [userProjects, allProjectsData, project, userId]);

  // Gestionnaire appelé lors du clic sur le bouton de génération
  const handleGenerate = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ): Promise<void> => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      // Vérifier si nous avons déjà les données nécessaires
      if (projectData) {
        // Si les données sont déjà disponibles, on les utilise directement
        console.log("Données disponibles, génération du rapport...");
        setReportGenerated(true);
        toast({
          title: "Rapport détaillé généré avec succès",
          description: "Votre rapport est prêt à être consulté et téléchargé",
          variant: "default",
        });
      } else {
        // Sinon, on essaie de générer le rapport via l'API
        console.log("Tentative de génération du rapport via l'API...");
        await generateReport({
          projectId: project,
          reportData: {
            period: period,
            includeAllProjects: false,
          },
        }).unwrap();

        setReportGenerated(true);
        toast({
          title: "Rapport détaillé généré avec succès",
          description: "Votre rapport est prêt à être consulté et téléchargé",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la génération du rapport:", error);
      toast({
        title: "Erreur lors de la génération du rapport",
        description: "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlanifier = () => setShowScheduleDialog(true);

  const handleConfirmSchedule = async () => {
    if (!scheduleDate || !project) return;

    try {
      // Planifier le rapport via l'API
      await scheduleReport({
        projectId: project,
        scheduleData: {
          scheduledDate: scheduleDate,
          period: period,
          includeAllProjects: false,
        },
      }).unwrap();

      toast({
        title: "Rapport planifié",
        description: `Le rapport détaillé est planifié pour le ${new Date(scheduleDate).toLocaleString()}`,
        variant: "default",
      });
      setShowScheduleDialog(false);
      setScheduleDate("");
    } catch (error) {
      toast({
        title: "Erreur lors de la planification",
        description: "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (reportId?: string | number) => {
    // Si un ID de rapport spécifique est fourni, télécharger ce rapport depuis le serveur
    if (reportId) {
      window.open(
        `${process.env.NEXT_PUBLIC_API_URL}/reports/${reportId}/download`,
        "_blank",
      );

      toast({
        title: "Téléchargement démarré",
        description: "Votre rapport est en cours de téléchargement",
        variant: "default",
      });
      return;
    }

    // Générer un rapport PDF à partir des données actuelles
    const doc = new jsPDF();

    // Configuration du document
    doc.setFont("helvetica");
    doc.setFontSize(22);

    const reportTitle = getProjectName() || "Rapport détaillé";
    let yPosition = 20;

    // Titre du rapport
    doc.setFont("helvetica", "bold");
    doc.text(`RAPPORT DÉTAILLÉ: ${reportTitle}`, 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    // Ajouter le contenu du rapport
    const projectsToReport = projectData ? [projectData.project] : [];

    projectsToReport.forEach((proj: Project) => {
      // Vérifier si on a besoin d'une nouvelle page
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(`PROJET: ${proj.name}`, 20, yPosition);
      yPosition += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(
        `Statut: ${getStatusText(proj.status || (proj.progress === 100 ? "completed" : "in-progress"))}`,
        20,
        yPosition,
      );
      yPosition += 6;
      doc.text(
        `Période: ${formatDate(proj.start_date)} - ${formatDate(proj.end_date)}`,
        20,
        yPosition,
      );
      yPosition += 6;
      doc.text(`Progression: ${proj.progress || 0}%`, 20, yPosition);
      yPosition += 10;

      // Ajouter les statistiques si disponibles
      if (projectData?.stats) {
        // Vérifier si on a besoin d'une nouvelle page
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.text(`STATISTIQUES:`, 20, yPosition);
        yPosition += 8;

        doc.setFont("helvetica", "normal");
        doc.text(
          `Total des tâches: ${projectData.stats.totalTasks}`,
          20,
          yPosition,
        );
        yPosition += 6;
        doc.text(
          `Tâches terminées: ${projectData.stats.completedTasks}`,
          20,
          yPosition,
        );
        yPosition += 6;
        doc.text(
          `Taux de complétion: ${projectData.stats.completionRate}%`,
          20,
          yPosition,
        );
        yPosition += 10;
      }

      // Ajouter les informations du chef de projet
      const manager = proj.manager;
      if (manager) {
        // Vérifier si on a besoin d'une nouvelle page
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.text(`CHEF DE PROJET:`, 20, yPosition);
        yPosition += 8;

        doc.setFont("helvetica", "normal");
        doc.text(`Nom: ${manager.name || "Non assigné"}`, 20, yPosition);
        yPosition += 6;
        doc.text(`Email: ${manager.email || "N/A"}`, 20, yPosition);
        yPosition += 10;
      }

      // Ajouter les informations de l'équipe
      const team = projectData?.team || [];
      if (team.length > 0) {
        // Vérifier si on a besoin d'une nouvelle page
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.text(`ÉQUIPE (${team.length} membres):`, 20, yPosition);
        yPosition += 8;

        doc.setFont("helvetica", "normal");

        team.forEach((member: TeamMember) => {
          // Vérifier si on a besoin d'une nouvelle page
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }

          doc.text(
            `- ${member.name}, ${member.role || "Membre"}`,
            20,
            yPosition,
          );
          yPosition += 6;

          if (member.tasks && member.tasks.length > 0) {
            doc.text(`  Tâches assignées:`, 20, yPosition);
            yPosition += 6;

            member.tasks.forEach((task: Task) => {
              // Vérifier si on a besoin d'une nouvelle page
              if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
              }

              doc.text(
                `  * ${task.name} (${getStatusText(task.status)}, ${task.progress}%)`,
                20,
                yPosition,
              );
              yPosition += 6;

              if (task.startDate && task.endDate) {
                doc.text(
                  `    Période: ${formatDate(task.startDate)} - ${formatDate(task.endDate)}`,
                  20,
                  yPosition,
                );
                yPosition += 6;
              }
            });
          }

          yPosition += 4;
        });
      }

      yPosition += 10;
    });

    // Ajouter la date de génération en bas de page
    const today = new Date();
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Rapport généré le ${today.toLocaleDateString("fr-FR")} à ${today.toLocaleTimeString("fr-FR")}`,
      20,
      280,
    );

    // Télécharger le PDF
    doc.save(
      `rapport-detaille-${reportTitle.toLowerCase().replace(/\s+/g, "-")}.pdf`,
    );

    toast({
      title: "Téléchargement démarré",
      description:
        "Votre rapport détaillé est en cours de téléchargement au format PDF",
      variant: "default",
    });
  };

  // Fonction pour obtenir le nom du projet sélectionné
  const getProjectName = (): string => {
    if (!project) return "Aucun projet sélectionné";

    // Chercher dans les projets de l'utilisateur
    if (userProjects?.managerProjects) {
      const foundProject = userProjects.managerProjects.find(
        (p: Project) => p.id.toString() === project,
      );
      if (foundProject) return foundProject.name;
    }

    // Chercher dans les données du projet actuel
    return projectData?.project?.name || "Projet inconnu";
  };

  const periodOptions = [
    { value: "month", span: "Dernier mois" },
    { value: "quarter", span: "Dernier trimestre" },
    { value: "year", span: "Dernière année" },
  ];

  const getProjectspan = () => {
    return getProjectName();
  };

  const getPeriodspan = () =>
    periodOptions.find((opt) => opt.value === period)?.span || "";

  // Fonction pour formater les dates
  const formatDate = (dateString: string): string => {
    if (!dateString) return "N/A";
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  // Fonction pour obtenir la couleur de statut
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "delayed":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "planned":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // Fonction pour obtenir le texte de statut
  const getStatusText = (status: string): string => {
    switch (status) {
      case "completed":
        return "Terminé";
      case "in-progress":
        return "En cours";
      case "delayed":
        return "En retard";
      case "planned":
        return "Planifié";
      case "terminé":
        return "Terminé";
      case "en_cours":
        return "En cours";
      case "en_révision":
        return "En révision";
      case "à_faire":
        return "À faire";
      default:
        return "Inconnu";
    }
  };

  // Fonction pour changer le projet sélectionné depuis la vue d'ensemble
  const handleSelectProject = (projectId: string) => {
    setProject(projectId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Rediriger vers la page de création de projet
  const handleCreateProject = () => {
    window.location.href = "/projects/new";
  };

  // Déterminer si les données sont en cours de chargement
  const isLoading = isGenerating || isLoadingUserProjects;

  // Vérifier s'il y a des erreurs
  const hasError = userProjectsError || (project && projectError);

  // Vérifier si l'utilisateur n'a pas de projets
  const hasNoProjects = !isLoading && getProjectOptions().length === 0;

  return (
    // Wrapper global
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto max-w-7xl space-y-6 p-4">
        {/* Bandeau d'introduction */}
        <div className="animate-fade-in rounded-lg border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 p-6 shadow-sm dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl">
              Générateur de Rapports Détaillés
            </h1>
            <p className="mt-2 text-black dark:text-white">
              Créez des rapports détaillés et professionnels en quelques clics
              pour tous vos projets
            </p>
          </div>
        </div>

        {/* Afficher les erreurs s'il y en a */}
        {hasError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>
              Une erreur s'est produite lors du chargement des données. Veuillez
              réessayer.
            </AlertDescription>
          </Alert>
        )}

        {/* Afficher un message si l'utilisateur n'a pas de projets */}
        {hasNoProjects && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Aucun projet trouvé</AlertTitle>
            <AlertDescription className="flex flex-col gap-4">
              <p>
                Vous n'avez pas encore de projets dont vous êtes le manager.
              </p>
              <Button
                onClick={handleCreateProject}
                className="w-fit bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:bg-indigo-600"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Créer un nouveau projet
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Formulaire de configuration du rapport */}
          <div className="animate-fade-in lg:col-span-1">
            <Card className="h-full border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                  <FileText className="h-5 w-5 text-black dark:text-white" />
                  Paramètres du Rapport
                </CardTitle>
                <CardDescription className="text-black dark:text-white">
                  Configurez les options pour générer votre rapport détaillé
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-black dark:text-white">
                      Projet
                    </span>
                    <Select
                      value={project}
                      onValueChange={setProject}
                      disabled={isLoading || hasNoProjects}
                    >
                      <SelectTrigger className="text-black dark:text-white">
                        <SelectValue
                          placeholder={
                            isLoading
                              ? "Chargement..."
                              : hasNoProjects
                                ? "Aucun projet disponible"
                                : "Sélectionnez un projet"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {getProjectOptions().map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <span className="text-black dark:text-white">
                              {option.span}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-black dark:text-white">
                      Période
                    </span>
                    <Select
                      value={period}
                      onValueChange={setPeriod}
                      disabled={isLoading || hasNoProjects}
                    >
                      <SelectTrigger className="text-black dark:text-white">
                        <SelectValue placeholder="Sélectionnez une période" />
                      </SelectTrigger>
                      <SelectContent>
                        {periodOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <span className="text-black dark:text-white">
                              {option.span}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleGenerate}
                    disabled={isLoading || hasNoProjects || !project}
                    className="mt-4 w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:bg-indigo-600"
                  >
                    {isGenerating ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />{" "}
                        Génération...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Générer le rapport
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Affichage du rapport généré */}
          <div className="animate-fade-in lg:col-span-2">
            {isLoading ? (
              <div className="flex h-full flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
                <Loader2 className="mb-4 h-10 w-10 animate-spin text-indigo-600" />
                <h3 className="text-xl font-medium text-black dark:text-white">
                  Chargement des données...
                </h3>
              </div>
            ) : reportGenerated ? (
              <Card className="border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-2xl text-black dark:text-white">
                      Rapport Détaillé
                    </CardTitle>
                    <CardDescription className="text-black dark:text-white">
                      {getProjectspan()} | {getPeriodspan()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePlanifier}
                      className="border-indigo-200 text-black hover:bg-indigo-50 dark:border-indigo-700 dark:text-white dark:hover:bg-indigo-900"
                      disabled={isSchedulingReport}
                    >
                      {isSchedulingReport ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Calendar className="mr-2 h-4 w-4 text-black dark:text-white" />
                      )}{" "}
                      Planifier
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDownload()}
                      className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:bg-indigo-600"
                    >
                      <Download className="mr-2 h-4 w-4 text-white" />{" "}
                      Télécharger
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                  {projectData && (
                    <div className="space-y-6 border-b border-gray-200 pb-8 last:border-0 dark:border-gray-700">
                      {/* En-tête du projet avec design amélioré */}
                      <div className="dark:to-gray-750/50 relative overflow-hidden rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 p-6 shadow-sm dark:border-gray-700 dark:from-gray-800/50">
                        <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                          <div>
                            <h2 className="text-3xl font-bold text-black dark:text-white">
                              {projectData.project.name}
                            </h2>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <Badge
                                className={`${getStatusColor(projectData.stats.completionRate === 100 ? "completed" : "in-progress")} px-3 py-1 text-sm font-medium`}
                              >
                                {getStatusText(
                                  projectData.stats.completionRate === 100
                                    ? "completed"
                                    : "in-progress",
                                )}
                              </Badge>
                              <span className="flex items-center text-sm text-black dark:text-white">
                                <Calendar className="mr-1 inline-block h-4 w-4" />
                                {formatDate(projectData.project.start_date)} -{" "}
                                {formatDate(projectData.project.end_date)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 rounded-lg bg-white/80 px-4 py-2 shadow-sm backdrop-blur-sm dark:bg-gray-800/80">
                            <div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Progression
                              </span>
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={projectData.stats.completionRate}
                                  className="h-2 w-24"
                                />
                                <span className="text-sm font-bold text-black dark:text-white">
                                  {projectData.stats.completionRate}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Métriques du projet */}
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Card className="overflow-hidden border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md dark:border-gray-700">
                          <CardContent className="pt-4">
                            <div className="flex items-center gap-4">
                              <div className="rounded-lg bg-orange-100 p-3 dark:bg-orange-900/20">
                                <TrendingUp className="h-6 w-6 text-orange-500 dark:text-orange-400" />
                              </div>
                              <div className="w-full">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Progression
                                </p>
                                <div className="mb-2 flex items-baseline gap-2">
                                  <h3 className="text-2xl font-bold text-black dark:text-white">
                                    {projectData.stats.completionRate}%
                                  </h3>
                                  <span
                                    className={`text-xs ${projectData.stats.completionRate > 50 ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}
                                  >
                                    {projectData.stats.completionRate > 50
                                      ? "En bonne voie"
                                      : "Attention requise"}
                                  </span>
                                </div>
                                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
                                    style={{
                                      width: `${projectData.stats.completionRate}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="overflow-hidden border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md dark:border-gray-700">
                          <CardContent className="pt-4">
                            <div className="flex items-center gap-4">
                              <div className="rounded-lg bg-yellow-100 p-3 dark:bg-yellow-900/20">
                                <CheckSquare className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Tâches
                                </p>
                                <div className="flex items-baseline gap-2">
                                  <h3 className="text-2xl font-bold text-black dark:text-white">
                                    {projectData.stats.completedTasks} /{" "}
                                    {projectData.stats.totalTasks}
                                  </h3>
                                  <span className="text-xs text-indigo-600 dark:text-indigo-400">
                                    terminées
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Informations sur le manager */}
                      {projectData.project.manager && (
                        <Card className="overflow-hidden border-0 shadow-md transition-all duration-300 hover:shadow-lg">
                          <div className="h-1.5 bg-gradient-to-r from-violet-500 to-purple-500"></div>
                          <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-lg text-black dark:text-white">
                              <User className="h-5 w-5 text-pink-500 dark:text-pink-400" />
                              Chef de Projet
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex flex-col items-start gap-6 rounded-lg bg-gradient-to-r from-violet-50 to-indigo-50 p-4 dark:from-violet-900/10 dark:to-indigo-900/10 sm:flex-row sm:items-center">
                              <Avatar className="h-20 w-20 border-4 border-white shadow-md dark:border-gray-800">
                                <AvatarImage
                                  src={
                                    projectData.project.manager.avatar ||
                                    "/placeholder.svg?height=40&width=40"
                                  }
                                  alt={projectData.project.manager.name}
                                />
                                <AvatarFallback className="bg-violet-100 text-xl text-violet-600 dark:bg-violet-900 dark:text-violet-200">
                                  {projectData.project.manager.name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="space-y-2">
                                <h3 className="text-xl font-bold text-black dark:text-white">
                                  {projectData.project.manager.name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  {projectData.project.manager.pivot?.role ||
                                    "Manager"}
                                </p>
                                <div className="flex flex-col gap-3 text-sm sm:flex-row sm:gap-6">
                                  <span className="flex items-center text-gray-600 dark:text-gray-300">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="mr-1 h-4 w-4"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                      />
                                    </svg>
                                    {projectData.project.manager.email}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Équipe du projet */}
                      {projectData.team && projectData.team.length > 0 && (
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem
                            value="team"
                            className="overflow-hidden border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md dark:border-gray-700"
                          >
                            <AccordionTrigger className="px-6 py-4 text-lg font-medium text-black hover:bg-gray-50 dark:text-white dark:hover:bg-gray-800/50">
                              <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/20">
                                  <Users className="h-5 w-5 text-green-500 dark:text-green-400" />
                                </div>
                                <span>
                                  Équipe du Projet ({projectData.team.length}{" "}
                                  membres)
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-6 pt-2">
                              <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                                {projectData.team.map((member: TeamMember) => (
                                  <Card
                                    key={member.id}
                                    className="overflow-hidden border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md dark:border-gray-700"
                                  >
                                    <CardHeader className="dark:to-gray-750 bg-gradient-to-r from-gray-50 to-gray-100 pb-2 dark:from-gray-800">
                                      <div className="flex items-center gap-4">
                                        <Avatar className="h-14 w-14 border-2 border-white shadow-sm dark:border-gray-700">
                                          <AvatarImage
                                            src={
                                              member.avatar ||
                                              "/placeholder.svg?height=40&width=40"
                                            }
                                            alt={member.name}
                                          />
                                          <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                                            {member.name
                                              .split(" ")
                                              .map((n: string) => n[0])
                                              .join("")}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <h4 className="text-lg font-bold text-black dark:text-white">
                                            {member.name}
                                          </h4>
                                          <p className="text-sm text-gray-600 dark:text-gray-300">
                                            {member.role}
                                          </p>
                                        </div>
                                      </div>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                      {member.tasks &&
                                      member.tasks.length > 0 ? (
                                        <div className="space-y-4">
                                          <h5 className="flex items-center gap-2 text-sm font-medium text-black dark:text-white">
                                            <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            Tâches assignées:
                                          </h5>
                                          <div className="space-y-3">
                                            {member.tasks.map((task: Task) => (
                                              <div
                                                key={task.id}
                                                className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
                                              >
                                                <div className="flex items-start justify-between">
                                                  <h6 className="text-sm font-medium text-black dark:text-white">
                                                    {task.name}
                                                  </h6>
                                                  <Badge
                                                    className={getStatusColor(
                                                      task.status,
                                                    )}
                                                  >
                                                    {getStatusText(task.status)}
                                                  </Badge>
                                                </div>
                                                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                                                  {task.startDate &&
                                                    task.endDate && (
                                                      <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                                        <CalendarIcon className="mr-1 inline-block h-3 w-3" />
                                                        {formatDate(
                                                          task.startDate,
                                                        )}{" "}
                                                        -{" "}
                                                        {formatDate(
                                                          task.endDate,
                                                        )}
                                                      </span>
                                                    )}
                                                  <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                      Progression:
                                                    </span>
                                                    <Progress
                                                      value={task.progress}
                                                      className="h-1.5 w-20"
                                                    />
                                                    <span className="text-xs font-medium text-black dark:text-white">
                                                      {task.progress}%
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ) : (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                          Aucune tâche assignée
                                        </p>
                                      )}
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      )}

                      {/* Statistiques des tâches */}
                      <Card className="overflow-hidden border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md dark:border-gray-700">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                            <CheckSquare className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                            Répartition des tâches
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                              <h4 className="mb-2 text-sm font-medium text-black dark:text-white">
                                Par statut
                              </h4>
                              <div className="space-y-2">
                                {Object.entries(
                                  projectData.stats.tasksByStatus || {},
                                ).map(([status, count]) => (
                                  <div
                                    key={status}
                                    className="flex items-center justify-between"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`h-3 w-3 rounded-full ${
                                          status === "terminé"
                                            ? "bg-green-500"
                                            : status === "en_révision"
                                              ? "bg-yellow-500"
                                              : status === "en_cours"
                                                ? "bg-blue-500"
                                                : "bg-gray-500"
                                        }`}
                                      ></span>
                                      <span className="text-sm text-black dark:text-white">
                                        {getStatusText(status)}
                                      </span>
                                    </div>
                                    <span className="text-sm font-medium text-black dark:text-white">
                                      {String(count)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="mb-2 text-sm font-medium text-black dark:text-white">
                                Par priorité
                              </h4>
                              <div className="space-y-2">
                                {Object.entries(
                                  projectData.stats.tasksByPriority || {},
                                ).map(([priority, count]) => (
                                  <div
                                    key={priority}
                                    className="flex items-center justify-between"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`h-3 w-3 rounded-full ${
                                          priority === "urgente"
                                            ? "bg-red-500"
                                            : priority === "haute"
                                              ? "bg-orange-500"
                                              : priority === "moyenne"
                                                ? "bg-blue-500"
                                                : "bg-green-500"
                                        }`}
                                      ></span>
                                      <span className="text-sm text-black dark:text-white">
                                        {priority.charAt(0).toUpperCase() +
                                          priority.slice(1)}
                                      </span>
                                    </div>
                                    <span className="text-sm font-medium text-black dark:text-white">
                                      {String(count)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Performance de l'équipe */}
                      {projectData.stats.teamPerformance &&
                        projectData.stats.teamPerformance.length > 0 && (
                          <Card className="overflow-hidden border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md dark:border-gray-700">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                                <TrendingUp className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                                Performance de l'équipe
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {projectData.stats.teamPerformance.map(
                                  (member: TeamPerformanceItem) => (
                                    <div
                                      key={member.memberId}
                                      className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800"
                                    >
                                      <div className="mb-2 flex items-center justify-between">
                                        <h4 className="text-sm font-medium text-black dark:text-white">
                                          {member.name}
                                        </h4>
                                        <Badge
                                          className={
                                            member.completionRate > 75
                                              ? "bg-green-100 text-green-800"
                                              : "bg-blue-100 text-blue-800"
                                          }
                                        >
                                          {member.tasksCompleted} tâches
                                          terminées
                                        </Badge>
                                      </div>
                                      <div className="mb-1 flex items-center gap-2">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          Taux de complétion:
                                        </span>
                                        <Progress
                                          value={member.completionRate}
                                          className="h-1.5 flex-1"
                                        />
                                        <span className="text-xs font-medium text-black dark:text-white">
                                          {member.completionRate}%
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          Temps moyen:
                                        </span>
                                        <span className="text-xs font-medium text-black dark:text-white">
                                          {member.averageCompletionTime}{" "}
                                          {member.averageCompletionTime === 1
                                            ? "jour"
                                            : "jours"}
                                        </span>
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                      {/* Tendances de performance */}
                      {projectData.stats.performanceData &&
                        projectData.stats.performanceData.length > 0 && (
                          <Card className="overflow-hidden border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md dark:border-gray-700">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                                <TrendingUp className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                                Tendances de performance
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex h-64 items-center justify-center">
                                <div className="w-full space-y-4">
                                  <div className="mb-2 flex items-center justify-between">
                                    <h4 className="text-sm font-medium text-black dark:text-white">
                                      Tâches complétées par mois
                                    </h4>
                                  </div>
                                  <div className="relative h-40">
                                    <div className="absolute inset-0 flex items-end justify-between px-2">
                                      {projectData.stats.performanceData.map(
                                        (
                                          item: PerformanceDataItem,
                                          index: number,
                                        ) => (
                                          <div
                                            key={index}
                                            className="flex flex-col items-center"
                                          >
                                            <div className="relative flex w-12 justify-center">
                                              <div
                                                className="w-8 rounded-t-md bg-indigo-500"
                                                style={{
                                                  height: `${(item.actuel / 10) * 100}px`,
                                                }}
                                              ></div>
                                              <div
                                                className="absolute left-1 w-8 rounded-t-md bg-gray-300 dark:bg-gray-600"
                                                style={{
                                                  height: `${(item.precedent / 10) * 100}px`,
                                                  opacity: 0.7,
                                                  zIndex: -1,
                                                }}
                                              ></div>
                                            </div>
                                            <span className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                                              {item.name}
                                            </span>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex justify-center gap-6">
                                    <div className="flex items-center gap-2">
                                      <div className="h-3 w-3 rounded-full bg-indigo-500"></div>
                                      <span className="text-xs text-gray-600 dark:text-gray-400">
                                        Actuel
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                      <span className="text-xs text-gray-600 dark:text-gray-400">
                                        Précédent
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="flex h-full flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-4 rounded-full bg-indigo-50 p-4 dark:bg-indigo-900">
                  <FileText className="h-10 w-10 text-black dark:text-white" />
                </div>
                <h3 className="mb-2 text-xl font-medium text-black dark:text-white">
                  Aucun rapport généré
                </h3>
                <p className="max-w-sm text-black dark:text-white">
                  Configurez les paramètres et générez votre premier rapport
                  détaillé pour visualiser les données ici.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Dialog de planification */}
        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-black dark:text-white">
                Planifier le rapport
              </DialogTitle>
              <DialogDescription className="text-black dark:text-white">
                Choisissez quand vous souhaitez recevoir ce rapport détaillé
                automatiquement
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <span className="block text-sm font-medium text-black dark:text-white">
                  Sélectionnez la date et l'heure :
                </span>
                <input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full rounded border p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowScheduleDialog(false)}
                className="text-black dark:text-white"
              >
                Annuler
              </Button>
              <Button
                onClick={handleConfirmSchedule}
                disabled={!scheduleDate || isSchedulingReport}
                className="bg-indigo-500 text-white hover:bg-indigo-600"
              >
                {isSchedulingReport ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />{" "}
                    Planification...
                  </span>
                ) : (
                  "Planifier"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Sheet pour l'historique des rapports */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="ml-auto flex gap-2 border-indigo-200 text-black hover:bg-indigo-50 dark:border-indigo-700 dark:text-white dark:hover:bg-indigo-900"
            >
              <Briefcase className="h-4 w-4 text-black dark:text-white" />{" "}
              Rapports précédents
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle className="text-black dark:text-white">
                Historique des rapports
              </SheetTitle>
              <SheetDescription className="text-black dark:text-white">
                Liste des derniers rapports détaillés générés pour vos projets
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 py-6">
              {isLoadingHistory ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                </div>
              ) : reportHistory && reportHistory.length > 0 ? (
                reportHistory.map((report: Report) => (
                  <Card
                    key={report.id}
                    className="border border-gray-200 transition-all hover:bg-indigo-50 dark:border-gray-700 dark:hover:bg-indigo-900"
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <h4 className="font-medium text-black dark:text-white">
                          {report.name}
                        </h4>
                        <p className="text-xs text-black dark:text-white">
                          Généré le{" "}
                          {new Date(report.created_at).toLocaleDateString(
                            "fr-FR",
                          )}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(report.id)}
                        className="text-indigo-600 hover:bg-indigo-100 hover:text-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-800 dark:hover:text-indigo-200"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="py-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Aucun rapport dans l'historique
                  </p>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default AutomatedReport;
