"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
 
const AssignedIssuesList = () => {
  const { user } = useAuth()
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all") 

  useEffect(() => {
    const fetchAssignedIssues = async () => {
      try {
        const response = await api.get("/issues/")
        // Filter issues assigned to the current lecturer
        const userIssues = response.data.filter((issue) => issue.assigned_to === user.id)
        setIssues(userIssues)
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
        return "bg-yellow-100 text-yellow-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800" 
      case "resolved":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredIssues = filter === "all" ? issues : issues.filter((issue) => issue.status === filter)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Assigned Issues</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-md ${filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-md ${filter === "pending" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter("in_progress")}
            className={`px-4 py-2 rounded-md ${filter === "in_progress" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter("resolved")}
            className={`px-4 py-2 rounded-md ${filter === "resolved" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Resolved
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2">Loading issues...</p>
        </div>
      ) : filteredIssues.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">No {filter !== "all" ? filter.replace("_", " ") : ""} issues assigned to you.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredIssues.map((issue) => (
            <div key={issue.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold">{issue.title}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(issue.status)}`}>
                    {issue.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-3">{issue.description}</p>
                <div className="text-sm text-gray-500 mb-4">
                  <p>Created by: {issue.created_by_name}</p>
                  <p>Created: {new Date(issue.created_at).toLocaleDateString()}</p>
                </div>
                <Link
                  to={`/issues/${issue.id}`}
                  className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-200"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AssignedIssuesList
