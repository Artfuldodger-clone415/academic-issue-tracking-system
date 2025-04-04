"use client"

import { useState, useEffect, useRef } from "react"
import api from "../../services/api"
import { Bell } from "lucide-react"
import NotificationList from "./NotificationList"

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const bellRef = useRef(null)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get("/notifications/")
        const data = response.data
        setNotifications(data)
        setUnreadCount(data.filter((n) => !n.is_read).length)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching notifications:", error)
        setLoading(false)
      }
    }

    fetchNotifications()

    // Set up polling for new notifications every 30 seconds
    const intervalId = setInterval(fetchNotifications, 30000)

    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      clearInterval(intervalId)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const togglePanel = () => {
    setIsOpen(!isOpen)
  }

  const handleNotificationUpdate = (updatedNotifications) => {
    setNotifications(updatedNotifications)
    setUnreadCount(updatedNotifications.filter((n) => !n.is_read).length)
  }

  return (
    <div className="notification-bell-container" ref={bellRef}>
      <button className="notification-bell" onClick={togglePanel} aria-label="Notifications">
        <Bell className="bell-icon" />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <NotificationList
          notifications={notifications}
          loading={loading}
          onUpdate={handleNotificationUpdate}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default NotificationBell

