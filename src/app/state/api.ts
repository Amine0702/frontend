import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
    prepareHeaders: (headers, { getState }) => {
      // Récupérer l'ID utilisateur de Clerk depuis le localStorage
      const clerkUserId = localStorage.getItem("currentUserId");

      // Ajouter l'ID utilisateur de Clerk aux headers
      if (clerkUserId) {
        headers.set("X-Clerk-User-Id", clerkUserId);
      }

      return headers;
    },
  }),
  tagTypes: [
    "Projects",
    "Tasks",
    "User",
    "Columns",
    "Reports",
    "Teams",
    "TeamMembers",
    "ProjectStats",
  ],
  endpoints: (builder) => ({
    // User endpoints
    createUser: builder.mutation({
      query: (userData) => ({
        url: "/users",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),

    getUserByClerkId: builder.query({
      query: (clerkUserId) => `/users/clerk/${clerkUserId}`,
      providesTags: ["User"],
    }),

    // Nouvel endpoint pour mettre à jour le profil utilisateur
    updateUserProfile: builder.mutation({
      query: ({ clerkUserId, ...profileData }) => ({
        url: `/users/${clerkUserId}/profile`,
        method: "PUT",
        body: profileData,
      }),
      invalidatesTags: ["User"],
    }),

    // Ajouter cette nouvelle mutation dans la section des endpoints, juste après updateUserProfile:
    uploadProfilePicture: builder.mutation({
      query: ({ clerkUserId, file }) => {
        const formData = new FormData();
        formData.append("profile_picture", file);

        return {
          url: `/users/${clerkUserId}/upload-profile-picture`,
          method: "POST",
          body: formData,
          // Désactiver la transformation automatique du corps de la requête
          formData: true,
        };
      },
      invalidatesTags: ["User"],
    }),

    getAllUsers: builder.query({
      query: () => `/users`,
      providesTags: ["User"],
    }),

    updateUserRole: builder.mutation({
      query: ({ id, role }) => ({
        url: `/users/${id}/role`,
        method: "PUT",
        body: { role },
      }),
      invalidatesTags: ["User"],
    }),

    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),

    getUserStats: builder.query({
      query: () => `/users/stats`,
      providesTags: ["User"],
    }),

    // Add these to the existing endpoints
    inviteUser: builder.mutation<any, { email: string; role: string }>({
      query: (data) => ({
        url: "/users/invite",
        method: "POST",
        body: data,
      }),
    }),
    getPendingInvitations: builder.query<any, void>({
      query: () => "/users/invitations",
    }),
    cancelInvitation: builder.mutation<any, number>({
      query: (id) => ({
        url: `/users/invitations/${id}`,
        method: "DELETE",
      }),
    }),

    // Project endpoints
    getUserProjects: builder.query({
      query: (clerkUserId) => `/projects/user/${clerkUserId}`,
      providesTags: ["Projects"],
    }),

    createProject: builder.mutation({
      query: (projectData) => ({
        url: "/projects",
        method: "POST",
        body: projectData,
      }),
      invalidatesTags: ["Projects"],
    }),

    getProject: builder.query({
      query: (projectId) => `/projects/${projectId}`,
      providesTags: (result, error, id) => [
        { type: "Projects", id },
        { type: "Tasks", id },
        { type: "Columns", id },
      ],
    }),

    // Ajouter l'endpoint pour la suppression de projet
    deleteProject: builder.mutation<
      { message: string; success: boolean },
      string
    >({
      query: (id) => ({
        url: `/projects/${id}`,
        method: "DELETE",
        headers: {
          "X-Clerk-User-Id": localStorage.getItem("currentUserId") || "",
        },
      }),
      invalidatesTags: ["Projects"],
    }),

    // Accept project invitation
    acceptInvitation: builder.mutation({
      query: ({ token, clerkUserId }) => ({
        url: `/projects/invitation/${token}`,
        method: "POST",
        body: { clerkUserId },
      }),
      invalidatesTags: ["Projects"],
    }),

    // Column endpoints
    addColumn: builder.mutation({
      query: (columnData) => ({
        url: "/columns",
        method: "POST",
        body: columnData,
      }),
      invalidatesTags: (result, error, { project_id }) => [
        { type: "Projects", id: project_id },
        { type: "Columns", id: project_id },
      ],
    }),

    updateColumnOrder: builder.mutation({
      query: (data) => ({
        url: "/columns/order",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { project_id }) => [
        { type: "Projects", id: project_id },
        { type: "Columns", id: project_id },
      ],
    }),

    // Ajouter l'endpoint pour supprimer une colonne:
    deleteColumn: builder.mutation({
      query: (columnId) => ({
        url: `/columns/${columnId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Projects"],
    }),

    // Task endpoints
    createTask: builder.mutation({
      query: (taskData) => ({
        url: "/tasks",
        method: "POST",
        body: taskData,
      }),
      invalidatesTags: (result, error, { column_id }) => [
        { type: "Tasks" },
        { type: "Columns" },
      ],
    }),

    // Nouvelle mutation pour générer une tâche avec l'IA
    generateTaskWithAI: builder.mutation({
      query: (data) => ({
        url: "/ai/generate-task",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Tasks", "Columns"],
    }),

    updateTask: builder.mutation({
      query: ({ id, ...taskData }) => ({
        url: `/tasks/${id}`,
        method: "PUT",
        body: taskData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Tasks", id }],
    }),

    deleteTask: builder.mutation({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tasks", "Columns"],
    }),

    moveTask: builder.mutation({
      query: (data) => ({
        url: "/tasks/move",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Tasks", "Columns"],
    }),

    toggleTaskTimer: builder.mutation({
      query: (id) => ({
        url: `/tasks/${id}/toggle-timer`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Tasks", id }],
    }),

    addComment: builder.mutation({
      query: ({ taskId, ...commentData }) => ({
        url: `/tasks/${taskId}/comments`,
        method: "POST",
        body: commentData,
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Tasks", id: taskId },
      ],
    }),

    addAttachment: builder.mutation({
      query: ({ taskId, file, name }) => {
        const formData = new FormData();
        formData.append("file", file);
        if (name) formData.append("name", name);

        return {
          url: `/tasks/${taskId}/attachments`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Tasks", id: taskId },
      ],
    }),

    // Team endpoints
    getTeams: builder.query({
      query: (params = {}) => ({
        url: "/teams",
        params: params,
      }),
      transformResponse: (response: unknown) => {
        console.log("Raw teams response:", response);
        // Vérifier si response est un objet et s'il a une propriété data
        if (response && typeof response === "object" && "data" in response) {
          return (response as { data: any }).data;
        }
        return response;
      },
      providesTags: ["Teams"],
    }),

    getTeam: builder.query({
      query: (teamId) => `/teams/${teamId}`,
      providesTags: (result, error, id) => [{ type: "Teams", id }],
    }),

    getTeamStats: builder.query({
      query: () => "/teams/stats/summary",
      providesTags: ["Teams"],
    }),

    createTeam: builder.mutation({
      query: (teamData) => ({
        url: "/teams",
        method: "POST",
        body: teamData,
      }),
      invalidatesTags: ["Teams"],
    }),

    updateTeam: builder.mutation({
      query: ({ id, ...teamData }) => ({
        url: `/teams/${id}`,
        method: "PUT",
        body: teamData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Teams", id }],
    }),

    deleteTeam: builder.mutation({
      query: (id) => ({
        url: `/teams/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Teams"],
    }),

    addTeamMembers: builder.mutation({
      query: ({ teamId, memberIds }) => ({
        url: `/teams/${teamId}/members`,
        method: "POST",
        body: { member_ids: memberIds },
      }),
      invalidatesTags: (result, error, { teamId }) => [
        { type: "Teams", id: teamId },
      ],
    }),

    removeTeamMembers: builder.mutation({
      query: ({ teamId, memberIds }) => ({
        url: `/teams/${teamId}/members`,
        method: "DELETE",
        body: { member_ids: memberIds },
      }),
      invalidatesTags: (result, error, { teamId }) => [
        { type: "Teams", id: teamId },
      ],
    }),

    exportTeamMembers: builder.query({
      query: (teamId) => ({
        url: `/teams/${teamId}/export-members`,
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Notes endpoints
    getUserNotes: builder.query({
      query: (clerkUserId) => `/notes/user/${clerkUserId}`,
      providesTags: ["Reports"],
    }),

    createNote: builder.mutation({
      query: (noteData) => ({
        url: "/notes",
        method: "POST",
        body: noteData,
      }),
      invalidatesTags: ["Reports"],
    }),

    updateNote: builder.mutation({
      query: ({ id, ...noteData }) => ({
        url: `/notes/${id}`,
        method: "PUT",
        body: noteData,
      }),
      invalidatesTags: ["Reports"],
    }),

    deleteNote: builder.mutation({
      query: (id) => ({
        url: `/notes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Reports"],
    }),

    searchNotes: builder.query({
      query: (searchTerm) => `/notes/search?term=${searchTerm}`,
      providesTags: ["Reports"],
    }),

    // Nouveaux endpoints pour les rapports
    getProjectStats: builder.query({
      query: (projectId) => `/projects/${projectId}/stats`,
      providesTags: (result, error, id) => [
        { type: "ProjectStats", id },
        { type: "Projects", id },
      ],
    }),

    getAllProjectsStats: builder.query<any, object>({
      query: (params = {}) => ({
        url: `/projects/stats/all`,
        params: params,
      }),
      providesTags: ["ProjectStats", "Projects"],
    }),

    getProjectReports: builder.query({
      query: (projectId) => `/projects/${projectId}/reports`,
      providesTags: (result, error, id) => [
        { type: "Reports", id },
        { type: "Projects", id },
      ],
    }),

    generateProjectReport: builder.mutation({
      query: ({ projectId, reportData }) => ({
        url: projectId ? `/projects/${projectId}/reports` : "/projects/reports",
        method: "POST",
        body: reportData,
      }),
      invalidatesTags: ["Reports"],
    }),

    scheduleProjectReport: builder.mutation({
      query: ({ projectId, scheduleData }) => ({
        url: projectId
          ? `/projects/${projectId}/reports/schedule`
          : "/projects/reports/schedule",
        method: "POST",
        body: scheduleData,
      }),
      invalidatesTags: ["Reports"],
    }),

    getReportHistory: builder.query({
      query: (params = {}) => ({
        url: `/reports/history`,
        params: params,
      }),
      providesTags: ["Reports"],
    }),

    downloadReport: builder.query({
      query: (reportId) => ({
        url: `/reports/${reportId}/download`,
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Nouveaux endpoints pour les statistiques d'équipe dans les rapports
    getTeamPerformance: builder.query({
      query: (teamId) => `/teams/${teamId}/performance`,
      providesTags: (result, error, id) => [
        { type: "Teams", id },
        { type: "ProjectStats" },
      ],
    }),

    getTeamMemberPerformance: builder.query({
      query: (memberId) => `/team-members/${memberId}/performance`,
      providesTags: (result, error, id) => [
        { type: "TeamMembers", id },
        { type: "ProjectStats" },
      ],
    }),

    // Endpoint pour obtenir les statistiques combinées pour les rapports
    getReportDashboard: builder.query({
      query: () => `/reports/dashboard`,
      providesTags: ["Projects", "Teams", "ProjectStats", "Reports"],
    }),

    getDashboardData: builder.query({
      query: () => "/dashboard/data",
      providesTags: ["Projects", "Tasks"],
    }),

    // Add this endpoint to the api object in the endpoints section
    getProjectLifecycle: builder.query<any, number>({
      query: (id: number) => `/projects/${id}/lifecycle`,
      providesTags: (result, error, id) => [
        { type: "Projects", id },
        { type: "Tasks", id },
      ],
    }),

    // Project history endpoints
    getProjectHistory: builder.query<any, number>({
      query: (projectId) => `/projects/${projectId}/history`,
      providesTags: (result, error, id) => [{ type: "Projects", id }],
    }),

    getAllProjectsHistory: builder.query<any, void>({
      query: () => `/projects/history/all`,
      providesTags: ["Projects"],
    }),

    inviteUsers: builder.mutation({
      query: ({ id, invitations }) => ({
        url: `/projects/${id}/invite`,
        method: "POST",
        body: { invitations },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Projects", id },
        { type: "Teams" },
      ],
    }),

    // Add this new endpoint in the endpoints object inside createApi
    getAIGeneratedTasks: builder.query<any, void>({
      query: () => `/ai/generated-tasks`,
      providesTags: ["Tasks"],
    }),
    removeMemberFromProject: builder.mutation({
      query: ({ projectId, memberId }) => ({
        url: `/projects/${projectId}/members/${memberId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: "Projects", id: projectId },
        { type: "Teams" },
      ],
    }),
  }),
});

// Add this new endpoint to fetch all teams directly from the backend
export const useGetAllTeamsQuery = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllTeams: builder.query({
      query: () => ({
        url: `/teams`,
        method: "GET",
      }),
      providesTags: ["Teams"],
    }),
  }),
}).useGetAllTeamsQuery;

export const {
  useCreateUserMutation,
  useGetUserByClerkIdQuery,
  useUpdateUserProfileMutation,
  useGetUserProjectsQuery,
  useCreateProjectMutation,
  useGetProjectQuery,
  useAcceptInvitationMutation,
  useAddColumnMutation,
  useUpdateColumnOrderMutation,
  useCreateTaskMutation,
  useGenerateTaskWithAIMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useMoveTaskMutation,
  useToggleTaskTimerMutation,
  useAddCommentMutation,
  useAddAttachmentMutation,
  // Team endpoints
  useGetTeamsQuery,
  useGetTeamQuery,
  useGetTeamStatsQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
  useAddTeamMembersMutation,
  useRemoveTeamMembersMutation,
  useExportTeamMembersQuery,

  // Nouveaux hooks pour les notes
  useGetUserNotesQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
  useSearchNotesQuery,

  // Nouveaux hooks pour les rapports
  useGetProjectStatsQuery,
  useGetAllProjectsStatsQuery,
  useGetProjectReportsQuery,
  useGenerateProjectReportMutation,
  useScheduleProjectReportMutation,
  useGetReportHistoryQuery,
  useDownloadReportQuery,
  useGetTeamPerformanceQuery,
  useGetTeamMemberPerformanceQuery,
  useGetReportDashboardQuery,
  useGetDashboardDataQuery,
  // Add this to the export section at the bottom of the file
  useGetProjectLifecycleQuery,
  useGetProjectHistoryQuery,
  useGetAllProjectsHistoryQuery,
  useGetAllUsersQuery,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
  useGetUserStatsQuery,
  useInviteUsersMutation,
  // Add this to the export section at the bottom of the file
  useGetAIGeneratedTasksQuery,
  useDeleteProjectMutation,
  useRemoveMemberFromProjectMutation,
  // Puis ajouter ce hook à la liste des exports en bas du fichier:
  useUploadProfilePictureMutation,
  useInviteUserMutation,
  useGetPendingInvitationsQuery,
  useCancelInvitationMutation,
  useDeleteColumnMutation,
} = api;
