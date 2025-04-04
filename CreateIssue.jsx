"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import api, { getLecturers } from "../../services/api"

const CreateIssue = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    course_unit: "",
    assigned_to: "",
  })
  const [courseUnits, setCourseUnits] = useState([])
  const [lecturers, setLecturers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch course units
        const courseUnitsResponse = await api.get("/course-units/")
        setCourseUnits(courseUnitsResponse.data)

        // Fetch lecturers
        const lecturersResponse = await getLecturers()
        setLecturers(lecturersResponse)
      } catch (error) {
        console.error("Error fetching form data:", error)
        setError("Failed to load form data. Please try again.")
      }
    }

    fetchData()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await api.post("/issues/", formData)
      navigate(`/issues/${response.data.id}`)
    } catch (error) {
      console.error("Error creating issue:", error)
      setError("Failed to create issue. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="create-issue-container">
      <div className="card">
        <div className="card-header">
          <h1>Create New Issue</h1>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter a descriptive title"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="6"
                placeholder="Describe your issue in detail"
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select id="priority" name="priority" value={formData.priority} onChange={handleChange} required>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="course_unit">Course Unit</label>
              <select id="course_unit" name="course_unit" value={formData.course_unit} onChange={handleChange} required>
                <option value="">Select a course unit</option>
                {courseUnits.map((unit, index) => (
                  <option key={index} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="assigned_to">Assign to Lecturer (Optional)</label>
              <select id="assigned_to" name="assigned_to" value={formData.assigned_to} onChange={handleChange}>
                <option value="">Select a lecturer</option>
                {lecturers.map((lecturer) => (
                  <option key={lecturer.id} value={lecturer.id}>
                    {lecturer.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Submitting..." : "Submit Issue"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateIssue

