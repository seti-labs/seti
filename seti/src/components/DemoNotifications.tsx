import React, { useEffect } from 'react'
import { useNotifications } from '@/contexts/NotificationContext'

export function DemoNotifications() {
  const { addNotification } = useNotifications()

  useEffect(() => {
    // Add some realistic demo notifications after a delay
    const timer1 = setTimeout(() => {
      addNotification({
        type: 'market_update',
        title: 'Market Update',
        message: 'Bitcoin prediction market has reached 1000 participants!',
        marketId: 'bitcoin-market'
      })
    }, 5000)

    const timer2 = setTimeout(() => {
      addNotification({
        type: 'position_alert',
        title: 'Position Alert',
        message: 'Your Tesla prediction is now 15% more likely to win!',
        marketId: 'tesla-market'
      })
    }, 10000)

    const timer3 = setTimeout(() => {
      addNotification({
        type: 'market_resolution',
        title: 'Market Resolved',
        message: 'The "Will Bitcoin reach $100k?" market has been resolved. You won!',
        marketId: 'bitcoin-market',
        actionUrl: '/prediction/bitcoin-market'
      })
    }, 15000)

    const timer4 = setTimeout(() => {
      addNotification({
        type: 'system',
        title: 'Welcome to Seti',
        message: 'Your account is now set up and ready for trading!',
        actionUrl: '/dashboard'
      })
    }, 2000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [addNotification])

  return null // This component doesn't render anything
}
