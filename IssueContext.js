"use client"

import { createContext, useState, useEffect, useContext } from "react"
import { useAuth } from "./AuthContext"
import { getIssues, addIssue, updateIssue, deleteIssue } from "../services/api"

export const IssueContext = createContext({
  issues: [],
  loading: true,
  error: null,
  fetchIssues: async () => {},
  submitIssue: async () => {},
  modifyIssue: async () => {},
  removeIssue: async () => {},
})

export const useIssues = () => useContext(IssueContext)

export const IssueProvider = ({ children }) => {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  // Load issues when user is authenticated
  useEffect(() => {
    if (user) {
      fetchIssues()
    }
  }, [user])

  // Fetch issues from backend
  const fetchIssues = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getIssues()
      setIssues(data)
      setLoading(false)
    } catch (error) {
      console.error("Failed to load issues:", error)
      setError("Failed to load issues. Please try again.")
      setLoading(false)
    }
  }

  // Submit a new issue
  const submitIssue = async (issueData) => {
    try {
      setError(null)
      const newIssue = await addIssue(issueData)
      setIssues((prev) => [...prev, newIssue])
      return newIssue
    } catch (error) {
      console.error("Failed to submit issue:", error)
      setError("Failed to submit issue. Please try again.")
      throw error
    }
  }

  // Update an existing issue
  const modifyIssue = async (id, updatedData) => {
    try {
      setError(null)
      const updatedIssue = await updateIssue(id, updatedData)
      setIssues((prev) => prev.map((issue) => (issue.id === id ? updatedIssue : issue)))
      return updatedIssue
    } catch (error) {
      console.error("Failed to update issue:", error)
      setError("Failed to update issue. Please try again.")
      throw error
    }
  }

  // Delete an issue
  const removeIssue = async (id) => {
    try {
      setError(null)
      await deleteIssue(id)
      setIssues((prev) => prev.filter((issue) => issue.id !== id))
      return true
    } catch (error) {
      console.error("Failed to delete issue:", error)
      setError("Failed to delete issue. Please try again.")
      throw error
    }
  }

  return (
    <IssueContext.Provider
      value={{
        issues,
        loading,
        error,
        fetchIssues,
        submitIssue,
        modifyIssue,
        removeIssue,
      }}
    >
      {children}
    </IssueContext.Provider>
  )
}

