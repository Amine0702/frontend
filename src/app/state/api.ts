import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8000/api",
    prepareHeaders: (headers, { getState }) => {
      // Récupérer l'ID utilisateur de Clerk depuis le localStorage
      const clerkUserId = localStorage.getItem("currentUserId")

      // Ajouter l'ID utilisateur de Clerk aux headers
      if (clerkUserId) {
        headers.set("X-Clerk-User-Id", clerkUserId)
      }

      return headers
    },
  }),
  tagTypes: ["Projects", "Tasks", "User", "Columns", "Reports"],
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

    // Task endpoints
    createTask: builder.mutation({
      query: (taskData) => ({
        url: "/tasks",
        method: "POST",
        body: taskData,
      }),
      invalidatesTags: (result, error, { column_id }) => [{ type: "Tasks" }, { type: "Columns" }],
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
      invalidatesTags: (result, error, { taskId }) => [{ type: "Tasks", id: taskId }],
    }),

    addAttachment: builder.mutation({
      query: ({ taskId, file, name }) => {
        const formData = new FormData()
        formData.append("file", file)
        if (name) formData.append("name", name)

        return {
          url: `/tasks/${taskId}/attachments`,
          method: "POST",
          body: formData,
        }
      },
      invalidatesTags: (result, error, { taskId }) => [{ type: "Tasks", id: taskId }],
    }),

    // Nouveaux endpoints pour les rapports
    getProjectStats: builder.query({
      query: (projectId) => `/projects/${projectId}/stats`,
      providesTags: (result, error, id) => [{ type: "Reports", id }],
    }),

    getProjectsReport: builder.query({
      query: (params) => ({
        url: "/reports/projects",
        params: {
          projectId: params.projectId,
          period: params.period,
          reportType: params.reportType,
        },
      }),
      providesTags: ["Reports"],
    }),

    getTasksReport: builder.query({
      query: (params) => ({
        url: "/reports/tasks",
        params: params,
      }),
      providesTags: ["Reports"],
    }),

    getHistoricalReports: builder.query({
      query: (clerkUserId) => `/reports/history/${clerkUserId}`,
      providesTags: ["Reports"],
    }),

    generateReport: builder.mutation({
      query: (reportData) => ({
        url: "/reports/generate",
        method: "POST",
        body: reportData,
      }),
      invalidatesTags: ["Reports"],
    }),

    scheduleReport: builder.mutation({
      query: (scheduleData) => ({
        url: "/reports/schedule",
        method: "POST",
        body: scheduleData,
      }),
      invalidatesTags: ["Reports"],
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
  }),
})

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
  // Nouveaux hooks pour les rapports
  useGetProjectStatsQuery,
  useGetProjectsReportQuery,
  useGetTasksReportQuery,
  useGetHistoricalReportsQuery,
  useGenerateReportMutation,
  useScheduleReportMutation,
  // Nouveaux hooks pour les notes
  useGetUserNotesQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
  useSearchNotesQuery,
} = api
