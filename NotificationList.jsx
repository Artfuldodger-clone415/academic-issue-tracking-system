"use client"
import { Link } from "react-router-dom"
import api from "../../services/api"
import { X, Check, AlertCircle, MessageSquare, Clock, User } from "lucide-react"

const NotificationList = ({ notifications, loading, onUpdate, onClose }) => {
  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/mark_read/`)
      const updatedNotifications = notifications.map((notification) =>
        notification.id === id ? { ...notification, is_read: true } : notification,
      )

      onUpdate(updatedNotifications)
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.post("/notifications/mark_all_read/")
      const updatedNotifications = notifications.map((notification) => ({ ...notification, is_read: true }))
      onUpdate(updatedNotifications)
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "issue_created":
        return <AlertCircle className="notification-icon" />
      case "issue_updated":
        return <Clock className="notification-icon" />
      case "status_changed":
        return <Check className="notification-icon" />
      case "comment_added":
        return <MessageSquare className="notification-icon" />
      case "assigned":
        return <User className="notification-icon" />
      default:
        return <AlertCircle className="notification-icon" />
    }
  }

  if (loading) {
    return <div className="notification-loading">Loading notifications...</div>
  }

  return (
    <div className="notification-panel">
      <div className="notification-header">
        <h3>Notifications</h3>
        <div className="notification-actions">
          <button onClick={markAllAsRead} className="btn btn-sm" disabled={!notifications.some((n) => !n.is_read)}>
            Mark all as read
          </button>
          <button onClick={onClose} className="btn btn-sm btn-icon">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="notification-list">
        {notifications.length === 0 ? (
          <div className="notification-empty">No notifications</div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${notification.is_read ? "read" : "unread"}`}
              onClick={() => {
                if (!notification.is_read) {
                  markAsRead(notification.id)
                }
              }}
            >
              <div className="notification-icon-container">{getNotificationIcon(notification.notification_type)}</div>
              <div className="notification-content">
                <div className="notification-message">{notification.message}</div>
                {notification.issue && (
                  <Link to={`/issues/${notification.issue}`} className="notification-link" onClick={onClose}>
                    View Issue
                  </Link>
                )}
                <div className="notification-time">{new Date(notification.created_at).toLocaleString()}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default NotificationList

