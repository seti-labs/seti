import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, X, Trash2, ExternalLink } from "lucide-react"
import { useNotifications, Notification } from '@/contexts/NotificationContext'
import { formatDistanceToNow } from 'date-fns'

export function NotificationsPage() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAll 
  } = useNotifications()

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'market_update':
        return '📈'
      case 'position_alert':
        return '⚠️'
      case 'market_resolution':
        return '🏁'
      case 'system':
        return '🔔'
      default:
        return '📢'
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'market_update':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'position_alert':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'market_resolution':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'system':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      default:
        return 'bg-muted/20 text-muted-foreground border-border'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Notifications</h2>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="hover:bg-[hsl(208,65%,75%)] hover:text-background border-[hsl(208,65%,75%)]"
            >
              <Check className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              className="hover:bg-red-500 hover:text-white border-red-500"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No notifications yet</h3>
            <p className="text-muted-foreground text-center">
              You'll receive notifications about market updates, position alerts, and more.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`bg-card/50 backdrop-blur-sm border-border/50 transition-all duration-200 hover:border-[hsl(208,65%,75%)]/50 ${
                !notification.read ? 'ring-1 ring-[hsl(208,65%,75%)]/30' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Notification Icon */}
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">
                          {notification.title}
                        </h4>
                        <p className="text-muted-foreground text-sm mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}</span>
                          {!notification.read && (
                            <Badge variant="secondary" className="bg-[hsl(208,65%,75%)] text-background">
                              New
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 ml-4">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="hover:bg-green-500/20 hover:text-green-400"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        {notification.actionUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(notification.actionUrl, '_blank')}
                            className="hover:bg-blue-500/20 hover:text-blue-400"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNotification(notification.id)}
                          className="hover:bg-red-500/20 hover:text-red-400"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
