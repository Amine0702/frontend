// Types pour les rapports
export interface ReportParams {
    projectId?: string | "all"
    period?: "week" | "month" | "quarter" | "year"
    reportType?: "summary" | "detailed" | "analytics"
    startDate?: string
    endDate?: string
  }
  
  export interface TaskStatusCount {
    à_faire: number
    en_cours: number
    en_révision: number
    terminé: number
  }
  
  export interface TaskPriorityCount {
    basse: number
    moyenne: number
    haute: number
    urgente: number
  }
  
  export interface PerformanceData {
    name: string
    actuel: number
    precedent: number
  }
  
  export interface BudgetData {
    name: string
    value: number
  }
  
  export interface ProjectStats {
    totalTasks: number
    completedTasks: number
    completionRate: number
    tasksByStatus: TaskStatusCount
    tasksByPriority: TaskPriorityCount
    performanceData: PerformanceData[]
    budgetData?: BudgetData[]
    teamPerformance?: {
      memberId: number
      name: string
      tasksCompleted: number
      averageCompletionTime: number
    }[]
  }
  
  export interface HistoricalReport {
    id: number
    name: string
    date: string
    projectId: string | "all"
    period: string
    reportType: string
    fileUrl?: string
  }
  
  export interface ReportData {
    stats: ProjectStats
    projects?: {
      id: number
      name: string
      stats: ProjectStats
    }[]
  }
  