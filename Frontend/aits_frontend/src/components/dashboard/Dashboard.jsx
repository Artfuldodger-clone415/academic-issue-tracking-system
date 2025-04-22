// src/components/dashboard/Dashboard.jsx
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import StudentDashboard from "./StudentDashboard"
import LecturerDashboard from "./LecturerDashboard"
import RegistrarDashboard from "./RegistrarDashboard"
import api from "../../services/api"

const Dashboard = () => {
  const { user } = useAuth()
    inProgressIssues: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/issues/")
        const issues = response.data

        setStats({
          totalIssues: issues.length,
          pendingIssues: issues.filter((issue) => issue.status === "pending").length,
          inProgressIssues: issues.filter((issue) => issue.status === "in_progress").length,
          resolvedIssues: issues.filter((issue) => issue.status === "resolved").length,
        })

        setLoading(false)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setLoading(false)
      }
    }

    if (user) {
      fetchStats()
    }
  }, [user])

  if (loading) {
    return <div className="loading-container">Loading dashboard...</div>
  }

  console.log("Current user role:", user?.role); // Add this for debugging

  // Render the appropriate dashboard based on user role
  switch (user?.role) {
    case "student":
      return <StudentDashboard stats={stats} />
    case "lecturer":
      return <LecturerDashboard stats={stats} />
    case "academic_registrar":
      return <RegistrarDashboard stats={stats} />
    default:
      return (
        <div className="dashboard-container">
          <h1>Welcome to the Issue Tracking System</h1>
          <p>Your role doesn't have a specific dashboard. Current role: {user?.role || "unknown"}</p>
        </div>
      )
  }
}

export default Dashboard