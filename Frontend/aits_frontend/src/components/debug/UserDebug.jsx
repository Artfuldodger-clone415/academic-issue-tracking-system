// src/components/debug/UserDebug.jsx
"use client"

import { useAuth } from "../../contexts/AuthContext" 

const UserDebug = () => {
  const { user, isAuthenticated, loading } = useAuth() 

  if (loading) return <div>Loading user data...</div>

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', margin: '20px', borderRadius: '5px' }}>
      <h3>User Debug Info</h3>
      <p>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
      <p>User ID: {user?.id || 'Not set'}</p> 
      <p>Username: {user?.username || 'Not set'}</p> 
      <p>Role: {user?.role || 'Not set'}</p>
      <p>Full Name: {user?.first_name} {user?.last_name}</p> 
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  )
}

export default UserDebug