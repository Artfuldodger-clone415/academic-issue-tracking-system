"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import {
  BarChart,
  Bar,
  XAxis, 
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart, 
  Pie,
  Cell,
  Legend,
} from "recharts"

const RegistrarDashboard = ({ stats }) => {
  const { user } = useAuth()

  useEffect(() => {
    const fetchAllIssues = async () => {
      try {
        const response = await api.get("/issues/") 
        const issues = response.data
        setAllIssues(issues)

        // Calculate college statistics
        const collegeMap = {}
        issues.forEach((issue) => {
          const createdBy = issue.created_by_name
          const college = issue.college || "Unknown" 

          if (!collegeMap[college]) {
            collegeMap[college] = { name: college, count: 0 }
          }
          collegeMap[college].count++
        })

        setCollegeStats(Object.values(collegeMap))

        // Identify priority issues (pending for more than 7 days) 
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const priority = issues.filter((issue) => {
          const createdDate = new Date(issue.created_at)
          return issue.status === "pending" && createdDate < sevenDaysAgo
        })

        setPriorityIssues(priority)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching issues for registrar:", error)
        setLoading(false)
      }
    }

    fetchAllIssues()
  }, [])

  // Prepare data for the pie chart
  const statusData = [
    { name: "Pending", value: stats.pendingIssues, color: "#FFA500" },
    { name: "In Progress", value: stats.inProgressIssues, color: "#3B82F6" },
    { name: "Resolved", value: stats.resolvedIssues, color: "#10B981" },
    { name: "Closed", value: allIssues.filter((issue) => issue.status === "closed").length, color: "#6B7280" },
  ].filter((item) => item.value > 0)

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

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Academic Registrar Dashboard</h1>
        <p>Welcome back, {user.first_name}!</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.totalIssues}</div>
          <div className="stat-label">Total Issues</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.pendingIssues}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.inProgressIssues}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.resolvedIssues}</div>
          <div className="stat-label">Resolved</div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Priority Issues</h2>
            <Link to="/issues" className="btn btn-secondary">
              View All Issues
            </Link>
          </div>

          {loading ? (
            <div className="loading">Loading priority issues...</div>
          ) : priorityIssues.length === 0 ? (
            <div className="empty-state">
              <p>There are no priority issues at this time.</p>
            </div>
          ) : (
            <div className="issue-list">
              {priorityIssues.slice(0, 5).map((issue) => (
                <div key={issue.id} className="issue-card priority">
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
                    <span>Assigned to: {issue.assigned_to_name || "Unassigned"}</span>
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

        <div className="dashboard-charts">
          <div className="chart-section">
            <h2>Issue Status Distribution</h2>
            {statusData.length > 0 ? (
              <div className="chart-container" style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} issues`, "Count"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="empty-state">No data to display</div>
            )}
          </div>

          <div className="chart-section">
            <h2>Issues by College</h2>
            {collegeStats.length > 0 ? (
              <div className="chart-container" style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={collegeStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" name="Issues" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="empty-state">No college data available</div>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Recent Unassigned Issues</h2>
        </div>

        {loading ? (
          <div className="loading">Loading unassigned issues...</div>
        ) : (
          <div className="issue-list">
            {allIssues
              .filter((issue) => !issue.assigned_to)
              .slice(0, 5)
              .map((issue) => (
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
                      Assign Issue
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="dashboard-footer">
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <Link to="/issues" className="btn btn-primary">
              View All Issues
            </Link>
            <button className="btn btn-secondary">Generate Report</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegistrarDashboard

