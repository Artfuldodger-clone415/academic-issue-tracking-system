"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"



const IssueDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [issue, setIssue] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [commentLoading, setCommentLoading] = useState(false)
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false)

  useEffect(() => {
    const fetchIssueDetails = async () => {
      try {
        const issueResponse = await api.get(`/issues/${id}/`)
        setIssue(issueResponse.data)

        const commentsResponse = await api.get(`/issues/${id}/comments/`)
        setComments(commentsResponse.data)

        setLoading(false)
      } catch (error) {
        console.error("Error fetching issue details:", error)
        setLoading(false)
      }
    }

    fetchIssueDetails()
  }, [id])

  const handleStatusUpdate = async (newStatus) => {
    if (!issue) return

    setStatusUpdateLoading(true)
    try {
      const response = await api.patch(`/issues/${id}/`, {
        status: newStatus,
      })
      setIssue(response.data)

      // Add system comment about status change
      const statusComment = {
        issue: Number(id),
        content: `Status updated to ${newStatus.replace("_", " ")}`,
      }
      await api.post(`/issues/${id}/comments/`, statusComment)

      // Refresh comments
      const commentsResponse = await api.get(`/issues/${id}/comments/`)
      setComments(commentsResponse.data)
    } catch (error) {
      console.error("Error updating issue status:", error)
    } finally {
      setStatusUpdateLoading(false)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setCommentLoading(true)
    try {
      const response = await api.post(`/issues/${id}/comments/`, {
        issue: Number(id),
        content: newComment,
      })

      setComments([...comments, response.data])
      setNewComment("")
    } catch (error) {
      console.error("Error adding comment:", error)
    } finally {
      setCommentLoading(false)
    }
  }

  const handleRequestInfo = async () => {
    if (!issue) return

    setUpdating(true)
    try {
      // Add a comment requesting more information
      const infoRequestComment = {
        issue: Number(id),
        content: "More information is needed to resolve this issue. Please provide additional details.",
      }

      const response = await api.post(`/issues/${id}/comments/`, infoRequestComment)
      setComments([...comments, response.data])

      // Update status to in_progress if it's pending
      if (issue.status === "pending") {
        const statusResponse = await api.patch(`/issues/${id}/`, {
          status: "in_progress",
        })
        setIssue(statusResponse.data)
      }
    } catch (error) {
      console.error("Error requesting information:", error)
    } finally {
      setUpdating(false)
    }
  }

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
        <p className="mt-2">Loading issue details...</p>
      </div>
    )
  }

  if (!issue) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-600">Issue not found</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-blue-600 hover:text-blue-800">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        Back to Issues
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold">{issue.title}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(issue.status)}`}>
              {issue.status.replace("_", " ")}
            </span>
          </div>

          <div className="mb-6">
            <p className="text-gray-700 whitespace-pre-wrap">{issue.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <p className="text-gray-600">
                Created by: <span className="font-medium">{issue.created_by_name}</span>
              </p>
              <p className="text-gray-600">
                Created: <span className="font-medium">{new Date(issue.created_at).toLocaleString()}</span>
              </p>
            </div>
            <div>
              <p className="text-gray-600">
                Course Unit: <span className="font-medium">{issue.course_unit || "N/A"}</span>
              </p>
              <p className="text-gray-600">
                College: <span className="font-medium">{issue.college || "N/A"}</span>
              </p>
            </div>
          </div>

          {/* Status Update Section */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Update Status</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleStatusUpdate("pending")}
                disabled={issue.status === "pending" || statusUpdateLoading}
                className={`px-4 py-2 rounded-md ${
                  issue.status === "pending"
                    ? "bg-yellow-100 text-yellow-800 cursor-not-allowed"
                    : "bg-yellow-500 hover:bg-yellow-600 text-white"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => handleStatusUpdate("in_progress")}
                disabled={issue.status === "in_progress" || statusUpdateLoading}
                className={`px-4 py-2 rounded-md ${
                  issue.status === "in_progress"
                    ? "bg-blue-100 text-blue-800 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => handleStatusUpdate("resolved")}
                disabled={issue.status === "resolved" || statusUpdateLoading}
                className={`px-4 py-2 rounded-md ${
                  issue.status === "resolved"
                    ? "bg-green-100 text-green-800 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                Resolved
              </button>
              <button
                onClick={() => handleStatusUpdate("closed")}
                disabled={issue.status === "closed" || statusUpdateLoading}
                className={`px-4 py-2 rounded-md ${
                  issue.status === "closed"
                    ? "bg-gray-100 text-gray-800 cursor-not-allowed"
                    : "bg-gray-500 hover:bg-gray-600 text-white"
                }`}
              >
                Closed
              </button>
            </div>
            {statusUpdateLoading && <p className="text-sm text-gray-600 mt-2">Updating status...</p>}
          </div>

          {/* Request More Info Button */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <button
              onClick={handleRequestInfo}
              disabled={updating}
              className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md flex items-center"
            >
              {updating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Request More Information
                </>
              )}
            </button>
          </div>

          {/* Comments Section */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold mb-4">Comments</h2>

            <div className="mb-6">
              <form onSubmit={handleAddComment} className="flex flex-col space-y-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
                <button
                  type="submit"
                  disabled={commentLoading || !newComment.trim()}
                  className="self-end bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center"
                >
                  {commentLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Posting...
                    </>
                  ) : (
                    "Add Comment"
                  )}
                </button>
              </form>
            </div>

            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No comments yet</p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">{comment.created_by_name}</span>
                      <span className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default IssueDetail
