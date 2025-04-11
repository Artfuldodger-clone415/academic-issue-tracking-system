"use client"

import { createContext, useState, useContext, useEffect } from "react"
import api from "../services/api"

export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateUser: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on initial load
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token")
      if (token) {
        try {
          // Set the token in the API headers
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`

          // Fetch user profile
          const response = await api.get("/profile/")
          setUser(response.data)
        } catch (error) {
          console.error("Authentication error:", error)
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token")
          api.defaults.headers.common["Authorization"] = ""
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (username, password) => {
    try {
      console.log(`Attempting login for user: ${username}`)
      
      const response = await api.post("/token/", { username, password })
      
      // Extract token data
      const { access, refresh } = response.data
      
      // Store tokens
      localStorage.setItem("access_token", access)
      localStorage.setItem("refresh_token", refresh)

      // Set token in API headers
      api.defaults.headers.common["Authorization"] = `Bearer ${access}`

      // If the token response includes user data, use it directly
      if (response.data.id && response.data.role) {
        const userData = {
          id: response.data.id,
          username: response.data.username || username,
          first_name: response.data.first_name || '',
          last_name: response.data.last_name || '',
          email: response.data.email || '',
          role: response.data.role,
          college: response.data.college || ''
        }
        
        setUser(userData)
        console.log(`Login successful using token data for: ${username}, role: ${userData.role}`)
        return userData
      } else {
        // Otherwise fetch the user profile
        const userResponse = await api.get("/profile/")
        setUser(userResponse.data)
        console.log(`Login successful for: ${username}, role: ${userResponse.data.role}`)
        return userResponse.data
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message || error)
      throw error
    }
  }

  const register = async (userData) => {
    try {
      console.log("Registering with data:", userData)
      const response = await api.post("/register/", userData)
      console.log("Registration successful:", response.data)
      
      // After registration, log the user in
      return await login(userData.username, userData.password)
    } catch (error) {
      console.error("Registration error:", error.response?.data || error.message || error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    api.defaults.headers.common["Authorization"] = ""
    setUser(null)
    window.location.href = "/login"
  }

  const updateUser = async (userData) => {
    try {
      const response = await api.patch("/profile/", userData)
      setUser(response.data)
      return response.data
    } catch (error) {
      console.error("Update user error:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}