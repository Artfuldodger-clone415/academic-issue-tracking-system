"use client"
import { Outlet } from "react-router-dom"
import Navbar from "./Navbar"
import Sidebar from "./Sidebar"
import { useAuth } from "../../contexts/AuthContext"
import UserDebug from "../debug/UserDebug"


{process.env.NODE_ENV === 'development' && <UserDebug />}

const Layout = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="loading-container">Loading...</div>
  }

  if (!user) {
    return <div className="redirect-message">Please log in to continue.</div>
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout

