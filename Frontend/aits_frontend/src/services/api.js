import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json", 
  },
})

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token") 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If the error is 401 and hasn't been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem("refresh_token")

        if (!refreshToken) {
          // No refresh token, logout
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token")
          window.location.href = "/login"
          return Promise.reject(error)
        }

        // Try to get a new token
        const response = await axios.post("http://localhost:8000/api/token/refresh/", {
          refresh: refreshToken,
        })

        const { access } = response.data

        // Save the new  usertoken
        localStorage.setItem("access_token", access)

        // Update the header
        api.defaults.headers.common["Authorization"] = `Bearer ${access}`
        originalRequest.headers.Authorization = `Bearer ${access}`

        // Retry the original request
        return api(originalRequest)
      } catch (refreshError) {
        // If refresh fails, logout
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

// Issues API
export const getIssues = async () => {
  const response = await api.get("/issues/")
  return response.data
}

export const getIssue = async (id) => {
  const response = await api.get(`/issues/${id}/`)
  return response.data
}

export const addIssue = async (issueData) => {
  const response = await api.post("/issues/", issueData)
  return response.data
}

export const updateIssue = async (id, issueData) => {
  const response = await api.patch(`/issues/${id}/`, issueData)
  return response.data
}

export const deleteIssue = async (id) => {
  await api.delete(`/issues/${id}/`)
  return true
}

export const assignIssue = async (id, userId) => {
  const response = await api.post(`/issues/${id}/assign/`, { user_id: userId })
  return response.data
}

// Comments API
export const getComments = async (issueId) => {
  const response = await api.get(`/issues/${issueId}/comments/`)
  return response.data
}

export const addComment = async (issueId, content) => {
  const response = await api.post(`/issues/${issueId}/comments/`, {
    issue: issueId,
    content,
  })
  return response.data
}

// Notifications API
export const getNotifications = async () => {
  const response = await api.get("/notifications/")
  return response.data
}

export const markNotificationAsRead = async (id) => {
  const response = await api.post(`/notifications/${id}/mark_read/`)
  return response.data
}

export const markAllNotificationsAsRead = async () => {
  const response = await api.post("/notifications/mark_all_read/")
  return response.data
}

// Users API
export const getLecturers = async () => {
  const response = await api.get("/users/?role=lecturer")
  return response.data
}

export const getUsers = async () => {
  const response = await api.get("/users/")
  return response.data
}

export default api

