"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import api, { getLecturers } from "../../services/api"
import { MessageSquare, Edit, Trash2, AlertCircle, Clock, Check, X } from "lucide-react"

const IssueDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [issue, setIssue] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [lecturers, setLecturers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    priority: "",
    status: "",
    assigned_to: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch issue details
        const issueResponse = await api.get(`/issues/${id}/`)
        setIssue(issueResponse.data)
        setEditForm({
          title: issueResponse.data.title,
          description: issueResponse.data.description,
          priority: issueResponse.data.priority,
          status: issueResponse.data.status,
          assigned_to: issueResponse.data.assigned_to || "",
        })

        // Fetch comments
        const commentsResponse = await api.get(`/issues/${id}/comments/`)
        setComments(commentsResponse.data)

        // Fetch lecturers for assignment
        const lecturersResponse = await getLecturers()
        setLecturers(lecturersResponse)

        setLoading(false)
      } catch (error) {
        console.error("Error fetching issue details:", error)
        setError("Failed to load issue details. Please try again.")
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleCommentChange = (e) => {
    setNewComment(e.target.value)
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      const response = await api.post(`/issues/${id}/comments/`, {
        issue: id,
        content: newComment,
      })

      setComments([...comments, response.data])
      setNewComment("")
    } catch (error) {
      console.error("Error adding comment:", error)
      setError("Failed to add comment. Please try again.")
    }
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await api.patch(`/issues/${id}/`, editForm)
      setIssue(response.data)
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating issue:", error)
      setError("Failed to update issue. Please try again.")
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await api.patch(`/issues/${id}/`, {
        status: newStatus,
      })
      setIssue(response.data)
    } catch (error) {
      console.error("Error updating status:", error)
      setError("Failed to update status. Please try again.")
    }
  }

  const handleDeleteIssue = async () => {
    if (!window.confirm("Are you sure you want to delete this issue? This action cannot be undone.")) {
      return
    }

    try {
      await api.delete(`/issues/${id}/`)
      navigate("/issues")
    } catch (error) {
      console.error("Error deleting issue:", error)
      setError("Failed to delete issue. Please try again.")
    }
  }

  if (loading) {
    return <div className="loading-container">Loading issue details...</div>
  }

  if (error) {
    return <div className="error-container">{error}</div>
  }

  if (!issue) {
    return <div className="not-found">Issue not found</div>
  }

  const canEdit =
    user.id === issue.created_by ||
    user.role === "academic_registrar" ||
    user.role === "admin" ||
    user.id === issue.assigned_to

  const canDelete = user.id === issue.created_by || user.role === "academic_registrar" || user.role === "admin"

  const canChangeStatus = user.id === issue.assigned_to || user.role === "academic_registrar" || user.role === "admin"

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
    <div className="issue-detail-container">
      <div className="card">
        <div className="card-header">
          <div className="issue-header-content">
            {isEditing ? (
              <input
                type="text"
                name="title"
                value={editForm.title}
                onChange={handleEditChange}
                className="edit-title-input"
              />
            ) : (
              <h1>{issue.title}</h1>
            )}
            <span className={`status-badge ${getStatusClass(issue.status)}`}>{issue.status.replace("_", " ")}</span>
          </div>

          <div className="issue-actions">
            {canEdit && !isEditing && (
              <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
                <Edit size={16} /> Edit
              </button>
            )}
            {canDelete && !isEditing && (
              <button className="btn btn-danger" onClick={handleDeleteIssue}>
                <Trash2 size={16} /> Delete
              </button>
            )}
          </div>
        </div>

        <div className="card-body">
          {error && <div className="alert alert-error">{error}</div>}

          {isEditing ? (
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  rows="6"
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select id="priority" name="priority" value={editForm.priority} onChange={handleEditChange}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select id="status" name="status" value={editForm.status} onChange={handleEditChange}>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="assigned_to">Assigned To</label>
                <select id="assigned_to" name="assigned_to" value={editForm.assigned_to} onChange={handleEditChange}>
                  <option value="">Unassigned</option>
                  {lecturers.map((lecturer) => (
                    <option key={lecturer.id} value={lecturer.id}>
                      {lecturer.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="issue-meta">
                <div className="meta-item">
                  <span className="meta-label">Created by:</span>
                  <span className="meta-value">{issue.created_by_name}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Created at:</span>
                  <span className="meta-value">{new Date(issue.created_at).toLocaleString()}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Priority:</span>
                  <span className="meta-value priority-badge">{issue.priority}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Assigned to:</span>
                  <span className="meta-value">{issue.assigned_to_name || "Unassigned"}</span>
                </div>
                {issue.course_unit && (
                  <div className="meta-item">
                    <span className="meta-label">Course Unit:</span>
                    <span className="meta-value">{issue.course_unit}</span>
                  </div>
                )}
              </div>

              <div className="issue-description">
                <h3>Description</h3>
                <p>{issue.description}</p>
              </div>

              {canChangeStatus && (
                <div className="status-actions">
                  <h3>Change Status</h3>
                  <div className="status-buttons">
                    {issue.status !== "pending" && (
                      <button className="btn btn-secondary" onClick={() => handleStatusChange("pending")}>
                        <AlertCircle size={16} /> Mark as Pending
                      </button>
                    )}
                    {issue.status !== "in_progress" && (
                      <button className="btn btn-secondary" onClick={() => handleStatusChange("in_progress")}>
                        <Clock size={16} /> Mark as In Progress
                      </button>
                    )}
                    {issue.status !== "resolved" && (
                      <button className="btn btn-primary" onClick={() => handleStatusChange("resolved")}>
                        <Check size={16} /> Mark as Resolved
                      </button>
                    )}
                    {issue.status !== "closed" && (
                      <button className="btn btn-secondary" onClick={() => handleStatusChange("closed")}>
                        <X size={16} /> Close Issue
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>
            <MessageSquare size={20} /> Comments ({comments.length})
          </h2>
        </div>
        <div className="card-body">
          <div className="comment-list">
            {comments.length === 0 ? (
              <div className="empty-state">No comments yet</div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <span className="comment-author">{comment.created_by_name}</span>
                    <span className="comment-date">{new Date(comment.created_at).toLocaleString()}</span>
                  </div>
                  <div className="comment-content">{comment.content}</div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleCommentSubmit} className="comment-form">
            <div className="form-group">
              <label htmlFor="comment">Add a comment</label>
              <textarea
                id="comment"
                value={newComment}
                onChange={handleCommentChange}
                rows="3"
                placeholder="Type your comment here..."
              ></textarea>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={!newComment.trim()}>
                Post Comment
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="back-link">
        <Link to="/issues">&larr; Back to Issues</Link>
      </div>
    </div>
  )
}

export default IssueDetail

