import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { usersApi } from '@/services/api'

export interface Notification {
  id: string
  type: 'market_update' | 'position_alert' | 'market_resolution' | 'system'
  title: string
  message: string
  timestamp: number
  read: boolean
  marketId?: string
  actionUrl?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [hasLoadedBackend, setHasLoadedBackend] = useState(false)

  // Load notifications from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('seti_notifications')
    if (saved) {
      try {
        setNotifications(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading notifications:', e)
      }
    }
  }, [])

  // Load notifications from backend when wallet is connected
  useEffect(() => {
    const loadNotificationsFromBackend = async (address: string) => {
      try {
        const response = await usersApi.getNotifications(address, { per_page: 50 })
        if (response.notifications && response.notifications.length > 0) {
          // Convert backend notifications to our format
          const backendNotifications: Notification[] = response.notifications.map((n: any) => ({
            id: n.id?.toString() || Date.now().toString(),
            type: n.type || 'system',
            title: n.title || 'Notification',
            message: n.message || '',
            timestamp: n.timestamp || Date.now(),
            read: n.read || false,
            marketId: n.market_id,
            actionUrl: n.action_url,
          }))
          
          // Merge with local notifications, avoiding duplicates
          setNotifications(prev => {
            const existingIds = new Set(prev.map(n => n.id))
            const newOnes = backendNotifications.filter(n => !existingIds.has(n.id))
            return [...newOnes, ...prev].slice(0, 100) // Keep max 100 notifications
          })
        }
      } catch (error) {
        // Silently fail - Continue with local notifications if backend fails
        if (import.meta.env.DEV) {
        }
      }
    }

    if (isConnected && address && !hasLoadedBackend) {
      loadNotificationsFromBackend(address as string)
      setHasLoadedBackend(true)
    } else if (!isConnected) {
      setHasLoadedBackend(false)
    }
  }, [isConnected, address, hasLoadedBackend])

  // Save notifications to localStorage when they change
  useEffect(() => {
    localStorage.setItem('seti_notifications', JSON.stringify(notifications))
  }, [notifications])

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: Date.now(),
      read: false
    }
    setNotifications(prev => [newNotification, ...prev])
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAll
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
