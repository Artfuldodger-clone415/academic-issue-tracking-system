"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import axios from "axios"

// Components
import Login from "./components/auth/Login"
import RoleSelection from "./components/auth/RoleSelection"
import StudentRegistration from "./components/auth/StudentRegistration"
import LecturerRegistration from "./components/auth/LecturerRegistration"
import RegistrarRegistration from "./components/auth/RegistrarRegistration"
import Layout from "./components/layout/Layout"
import Dashboard from "./components/dashboard/Dashboard"
import IssueList from "./components/issues/IssueList"
import CreateIssue from "./components/issues/CreateIssue"
import IssueDetail from "./components/issues/IssueDetail"
import Profile from "./components/profile/Profile"
import NotFound from "./components/NotFound"

// Context
import { AuthProvider, useAuth } from "./contexts/AuthContext"

// Styles
import "./styles/global.css"

// Set up axios defaults
axios.defaults.baseURL = "http://localhost:8000"

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

function AppRoutes() {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div className="loading-container">Loading...</div>
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!isAuthenticated ? <RoleSelection /> : <Navigate to="/dashboard" />} />
      <Route path="/register/student" element={!isAuthenticated ? <StudentRegistration /> : <Navigate to="/dashboard" />} />
      <Route path="/register/lecturer" element={!isAuthenticated ? <LecturerRegistration /> : <Navigate to="/dashboard" />} />
      <Route path="/register/registrar" element={!isAuthenticated ? <RegistrarRegistration /> : <Navigate to="/dashboard" />} />

      {/* Protected routes with Layout */}
      <Route
        path="/"
        element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}
      >
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="issues" element={<IssueList />} />
        <Route path="issues/create" element={<CreateIssue />} />
        <Route path="issues/:id" element={<IssueDetail />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App