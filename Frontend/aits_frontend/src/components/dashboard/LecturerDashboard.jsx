"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const LecturerDashboard = ({ stats }) => {
  const { user } = useAuth()
  const [assignedIssues, setAssignedIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState([]) 
 
  useEffect(() => {
    const fetchAssignedIssues = async () => {
      try {
        const response = await api.get("/issues/")
        // Filter issues assigned to the current lecturer
        const userIssues = response.data.filter((issue) => issue.assigned_to === user.id) 
        // Sort by creation date (newest first)
        const sortedIssues = userIssues.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

        setAssignedIssues(sortedIssues)

        // Prepare data for the bar chart
        const statusCounts = {
          pending: userIssues.filter((issue) => issue.status === "pending").length,
          in_progress: userIssues.filter((issue) => issue.status === "in_progress").length, 
          resolved: userIssues.filter((issue) => issue.status === "resolved").length,
          closed: userIssues.filter((issue) => issue.status === "closed").length,
        }

        setChartData([
          { name: "Pending", count: statusCounts.pending },
          { name: "In Progress", count: statusCounts.in_progress }, 
          { name: "Resolved", count: statusCounts.resolved },
          { name: "Closed", count: statusCounts.closed },
        ])

        setLoading(false)
      } catch (error) {
        console.error("Error fetching assigned issues:", error) 
        setLoading(false)
      }
    }

    fetchAssignedIssues()
  }, [user.id])

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "status-pending"
      case "in_progress":
        return "status-in-progress"
      case "resolved":
        return "status-resolved"
      case "closed":
        return "status-closed"
      default:
        return ""
    }
  }

  const pendingIssues = assignedIssues.filter((issue) => issue.status === "pending")
  const inProgressIssues = assignedIssues.filter((issue) => issue.status === "in_progress")

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Lecturer Dashboard</h1>
        <p>Welcome back, {user.first_name}!</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-value">{assignedIssues.length}</div>
          <div className="stat-label">Assigned Issues</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{pendingIssues.length}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{inProgressIssues.length}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{assignedIssues.filter((issue) => issue.status === "resolved").length}</div>
          <div className="stat-label">Resolved</div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Issues Requiring Your Attention</h2>
            <Link to="/issues" className="btn btn-secondary">
              View All Issues
            </Link>
          </div>

          {loading ? (
            <div className="loading">Loading assigned issues...</div>
          ) : pendingIssues.length === 0 ? (
            <div className="empty-state">
              <p>You have no pending issues that require your attention.</p>
            </div>
          ) : (
            <div className="issue-list">
              {pendingIssues.slice(0, 5).map((issue) => (
                <div key={issue.id} className="issue-card">
                  <div className="issue-header">
                    <h3>
                      <Link to={`/issues/${issue.id}`}>{issue.title}</Link>
                    </h3>
                    <span className={`status-badge ${getStatusClass(issue.status)}`}>
                      {issue.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="issue-description">{issue.description.substring(0, 100)}...</p>
                  <div className="issue-footer">
                    <span>Created by: {issue.created_by_name}</span>
                    <span>Created: {new Date(issue.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="issue-actions">
                    <Link to={`/issues/${issue.id}`} className="btn btn-primary">
                      Review Issue
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-section chart-section">
          <h2>Issue Status Distribution</h2>
          {chartData.length > 0 ? (
            <div className="chart-container" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" name="Issues" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state">No data to display</div>
          )}
        </div>
      </div>

      <div className="dashboard-section">
        <h2>In Progress Issues</h2>
        {inProgressIssues.length === 0 ? (
          <div className="empty-state">
            <p>You have no issues currently in progress.</p>
          </div>
        ) : (
          <div className="issue-list">
            {inProgressIssues.slice(0, 3).map((issue) => (
              <div key={issue.id} className="issue-card">
                <div className="issue-header">
                  <h3>
                    <Link to={`/issues/${issue.id}`}>{issue.title}</Link>
                  </h3>
                  <span className={`status-badge ${getStatusClass(issue.status)}`}>
                    {issue.status.replace("_", " ")}
                  </span>
                </div>
                <p className="issue-description">{issue.description.substring(0, 100)}...</p>
                <div className="issue-footer">
                  <span>Created by: {issue.created_by_name}</span>
                  <span>Updated: {new Date(issue.updated_at).toLocaleDateString()}</span>
                </div>
                <div className="issue-actions">
                  <Link to={`/issues/${issue.id}`} className="btn btn-primary"> 
                    Continue Working
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default LecturerDashboard 

