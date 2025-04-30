"use client"
import { useAuth } from "../../contexts/AuthContext"
import NotificationBell from "../notification/NotificationBell"
import { LogOut, User, Settings } from "lucide-react"
import { Link } from "react-router-dom"


const Navbar = () => {
  const { user, logout } = useAuth()

  return ( 
    <header className="navbar">
      <div className="navbar-brand">
        <img src="/logo.png" alt="Makerere University Logo" /> 
        <h1>Makerere University Issue Tracking System</h1>  
      </div>

      <div className="navbar-actions">
        <NotificationBell />

        <div className="dropdown">
          <button className="dropdown-toggle"> 
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
            <span className="user-name">{user?.first_name}</span>
          </button> 

          <div className="dropdown-menu">
            <div className="dropdown-header">
              <div className="user-info">
                <div className="user-name">
                  {user?.first_name} {user?.last_name}
                </div>
                <div className="user-email">{user?.email}</div>
              </div>
            </div>

            <div className="dropdown-divider"></div>

            <Link to="/profile" className="dropdown-item">
              <User size={16} />
              <span>Profile</span> 
            </Link>

            {user?.role === "academic_registrar" && (
              <Link to="/settings" className="dropdown-item">
                <Settings size={16} />
                <span>Settings</span>
              </Link>
            )}

            <button onClick={logout} className="dropdown-item">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar

