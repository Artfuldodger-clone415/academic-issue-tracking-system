"use client"

import { useState } from "react"
import { NavLink } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { Home, FileText, PlusCircle, User, BarChart2, Settings, Menu, X, BookOpen, Users, Bell } from "lucide-react"

const Sidebar = () => {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  // Define navigation items based on user role
  const getNavItems = () => {
    const commonItems = [
      { to: "/dashboard", icon: <Home size={20} />, label: "Dashboard" },
      { to: "/issues", icon: <FileText size={20} />, label: "Issues" },
      { to: "/profile", icon: <User size={20} />, label: "Profile" },
    ]

    // Add role-specific items
    if (user?.role === "student") {
      return [
        ...commonItems,
        { to: "/issues/create", icon: <PlusCircle size={20} />, label: "Create Issue" },
        { to: "/course-units", icon: <BookOpen size={20} />, label: "Course Units" },
      ]
    } else if (user?.role === "lecturer") {
      return [
        ...commonItems,
        { to: "/my-courses", icon: <BookOpen size={20} />, label: "My Courses" },
        { to: "/students", icon: <Users size={20} />, label: "Students" },
      ]
    } else if (user?.role === "academic_registrar") {
      return [
        ...commonItems,
        { to: "/reports", icon: <BarChart2 size={20} />, label: "Reports" },
        { to: "/users", icon: <Users size={20} />, label: "Users" },
        { to: "/notifications", icon: <Bell size={20} />, label: "Notifications" },
        { to: "/settings", icon: <Settings size={20} />, label: "Settings" },
      ]
    }

    return commonItems
  }

  const navItems = getNavItems()

  return (
    <>
      <button className="mobile-menu-button" onClick={toggleSidebar} aria-label="Toggle menu">
        <Menu size={24} />
      </button>

      <div className={`sidebar-overlay ${isOpen ? "active" : ""}`} onClick={toggleSidebar}></div>

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">MUITS</h1>
          <button className="close-sidebar" onClick={toggleSidebar}>
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
              onClick={() => setIsOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.profile_photo ? (
                <img src={user.profile_photo || "/placeholder.svg"} alt={`${user.first_name}'s avatar`} />
              ) : (
                <>
                  {user?.first_name?.[0]}
                  {user?.last_name?.[0]}
                </>
              )}
            </div>
            <div className="user-details">
              <div className="user-name">
                {user?.first_name} {user?.last_name}
              </div>
              <div className="user-role">
                {user?.role?.replace("_", " ").charAt(0).toUpperCase() + user?.role?.replace("_", " ").slice(1)}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar

