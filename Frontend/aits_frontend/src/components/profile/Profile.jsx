"use client"

import { useState, useRef } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { Camera, Save, User, Mail, Phone, School, Building } from "lucide-react"

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone_number: user?.phone_number || "",
  })
  const [profilePhoto, setProfilePhoto] = useState(user?.profile_photo || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const fileInputRef = useRef(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePhoto(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const updatedData = {
        ...formData,
        profile_photo: profilePhoto,
      }

      await updateUser(updatedData)
      setSuccess("Profile updated successfully")
    } catch (err) {
      const errorData = err.response?.data
      if (errorData) {
        // Format error messages from API
        const errorMessages = Object.entries(errorData)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
          .join("\n")
        setError(errorMessages)
      } else {
        setError("Failed to update profile. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {profilePhoto ? (
            <img src={profilePhoto || "/placeholder.svg"} alt={`${user.first_name}'s profile`} />
          ) : (
            <>
              {user.first_name?.[0]}
              {user.last_name?.[0]}
            </>
          )}
          <div className="profile-avatar-overlay" onClick={() => fileInputRef.current.click()}>
            <Camera size={16} /> Change Photo
          </div>
          <input type="file" ref={fileInputRef} className="file-upload" accept="image/*" onChange={handlePhotoChange} />
        </div>

        <div className="profile-info">
          <h1>
            {user.first_name} {user.last_name}
          </h1>
          <div className="profile-role">
            {user.role.replace("_", " ").charAt(0).toUpperCase() + user.role.replace("_", " ").slice(1)}
          </div>
          <p>{user.email}</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <User size={20} /> Personal Information
          </h2>
        </div>

        <div className="card-body">
          {error && (
            <div className="alert alert-error mb-4">
              <span style={{ whiteSpace: "pre-line" }}>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success mb-4">
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="first_name">First Name</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="last_name">Last Name</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <Mail size={16} className="inline mr-2" /> Email
              </label>
              <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label htmlFor="phone_number">
                <Phone size={16} className="inline mr-2" /> Phone Number
              </label>
              <input
                type="text"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
              />
            </div>

            {user.role === "student" && (
              <div className="form-group">
                <label htmlFor="student_number">
                  <School size={16} className="inline mr-2" /> Student Number
                </label>
                <input
                  type="text"
                  id="student_number"
                  value={user.student_number || ""}
                  disabled
                  className="bg-gray-100"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="college">
                <Building size={16} className="inline mr-2" /> College
              </label>
              <input type="text" id="college" value={user.college || ""} disabled className="bg-gray-100" />
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? (
                  "Updating..."
                ) : (
                  <>
                    <Save size={18} /> Update Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Profile

