"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { LogIn, User } from "lucide-react"

const Login = () => {
  const [formData, setFormData] = useState({
    username: "", 
    password: "",
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log(`Submitting login form for: ${formData.username}`)
      const user = await login(formData.username, formData.password)

      console.log(`Login successful, user role: ${user.role}`)

      // Redirect to dashboard for all user types
      navigate("/dashboard")
    } catch (error) {
      console.error("Login error details:", error.response?.data || error.message || error)

      if (error.response?.status === 401) {
        setError("Invalid username or password. Please try again.")
      } else {
        setError(`Login failed: ${error.response?.data?.detail || error.message || "Unknown error"}`)
      }

      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img src="/logo.png" alt="Makerere University Logo" style={{ height: "60px", margin: "0 auto 1rem" }} />
          <h1>Makerere University</h1>
          <p>Issue Tracking System</p>
        </div>

        <div className="auth-body">
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">
                <User size={16} className="inline mr-2" />
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Enter your username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? (
                "Signing in..."
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login

