// Types pour les équipes
export interface Team {
  id: number
  name: string
  description?: string
  leader_id?: number
  leader?: TeamMember
  status: string
  priority: string
  completion_rate: number
  active_projects_count: number
  project_id: number
  last_updated_at: string
  members: TeamMember[]
  // Propriétés supplémentaires pour la compatibilité
  active_projects?: number
  last_updated?: string
  created_at?: string
  updated_at?: string
}

// Types pour les membres d'équipe
export interface TeamMember {
  id: number
  name: string
  email: string
  avatar?: string
  role?: string
  status: string
  clerk_user_id?: string
  created_at?: string
  updated_at?: string
  pivot?: {
    team_id?: number
    project_id?: number // Ajout de project_id comme alternative à team_id
    team_member_id: number
    role: string
  }
  tasks?: Task[]
}

// Types pour les tâches
export interface Task {
  id: number
  title: string
  description?: string
  status: string
  priority: string
  progress: number
  due_date?: string
  assignee_id?: number
  project_id?: number
  created_at?: string
  updated_at?: string
}

// Types pour les filtres d'équipe
export interface TeamFilters {
  search?: string
  status?: string[]
  priority?: string[]
  completion_min?: number
  completion_max?: number
}

// Types pour les statistiques d'équipe
export interface TeamStats {
  total_teams: number
  active_teams: number
  total_members: number
  total_active_projects: number
}

// Define BackendTeamMember interface
export interface BackendTeamMember {
  id: number
  name: string
  email: string
  role: string
  pivot?: {
    project_id: number
    team_member_id: number
    role: string
  }
}

// Modifions l'interface BackendTeamMember pour ajouter la compatibilité avec TeamMember
// Ajoutons cette interface à la fin du fichier

export interface BackendTeamMemberWithStatus extends BackendTeamMember {
  status: string
}
