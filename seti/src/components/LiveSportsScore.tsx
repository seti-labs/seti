import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, Clock, Trophy, Users } from 'lucide-react'
import { apiFetch } from '@/services/api'

interface LiveScore {
  id: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  status: 'live' | 'finished' | 'upcoming'
  time: string
  league: string
  period?: string
}

interface LiveSportsData {
  market_id: string
  market_question: string
  fixture_id: number
  home_team: string
  away_team: string
  home_score: number
  away_score: number
  league: string
  status: string
  period: string
  elapsed_time?: number
  kickoff_time: string
  is_live: boolean
  is_finished: boolean
  last_updated: string
}

interface LiveSportsScoreProps {
  marketId?: string
  sport?: string
  teams?: string[]
  className?: string
}

export function LiveSportsScore({ marketId, sport, teams, className = "" }: LiveSportsScoreProps) {
  const [scores, setScores] = useState<LiveScore[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Mock data for demonstration - replace with real API
  const mockScores: LiveScore[] = [
    {
      id: '1',
      homeTeam: 'Lakers',
      awayTeam: 'Warriors',
      homeScore: 98,
      awayScore: 102,
      status: 'live',
      time: 'Q4 8:32',
      league: 'NBA',
      period: '4th Quarter'
    },
    {
      id: '2',
      homeTeam: 'Manchester United',
      awayTeam: 'Liverpool',
      homeScore: 2,
      awayScore: 1,
      status: 'live',
      time: '78\'',
      league: 'Premier League',
      period: '2nd Half'
    },
    {
      id: '3',
      homeTeam: 'Patriots',
      awayTeam: 'Chiefs',
      homeScore: 24,
      awayScore: 28,
      status: 'finished',
      time: 'Final',
      league: 'NFL'
    }
  ]

  const fetchScores = async () => {
    setLoading(true)
    setError(null)
    
    try {
      if (marketId) {
        // Fetch live sports data for specific market
        const response = await apiFetch(`/markets/${marketId}/live-sports`)
        if (response.success && response.live_sports) {
          const liveData = response.live_sports
          const score: LiveScore = {
            id: liveData.fixture_id.toString(),
            homeTeam: liveData.home_team,
            awayTeam: liveData.away_team,
            homeScore: liveData.home_score,
            awayScore: liveData.away_score,
            status: liveData.is_live ? 'live' : liveData.is_finished ? 'finished' : 'upcoming',
            time: liveData.elapsed_time ? `${liveData.elapsed_time}'` : 'TBD',
            league: liveData.league,
            period: liveData.period
          }
          setScores([score])
        } else {
          setScores([])
        }
      } else {
        // Fallback to mock data for general display
        let filteredScores = mockScores
        
        if (sport) {
          filteredScores = filteredScores.filter(score => 
            score.league.toLowerCase().includes(sport.toLowerCase())
          )
        }
        
        if (teams && teams.length > 0) {
          filteredScores = filteredScores.filter(score =>
            teams.some(team => 
              score.homeTeam.toLowerCase().includes(team.toLowerCase()) ||
              score.awayTeam.toLowerCase().includes(team.toLowerCase())
            )
          )
        }
        
        setScores(filteredScores)
      }
      
      setLastUpdated(new Date())
    } catch (err) {
      setError('Failed to fetch live scores')
      console.error('Error fetching scores:', err)
      // Fallback to mock data on error
      setScores(mockScores.slice(0, 1))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchScores()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchScores, 30000)
    return () => clearInterval(interval)
  }, [sport, teams])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-red-500 text-white'
      case 'finished':
        return 'bg-green-500 text-white'
      case 'upcoming':
        return 'bg-blue-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live':
        return <Clock className="w-3 h-3" />
      case 'finished':
        return <Trophy className="w-3 h-3" />
      case 'upcoming':
        return <Users className="w-3 h-3" />
      default:
        return null
    }
  }

  if (error) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-4">
          <div className="text-center text-red-500">
            <p className="text-sm">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchScores}
              className="mt-2"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (scores.length === 0 && !loading) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">No live scores available</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchScores}
              className="mt-2"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Live Scores
          </CardTitle>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchScores}
              disabled={loading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {scores.map((score) => (
            <div
              key={score.id}
              className="p-3 bg-muted/30 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="text-xs">
                  {score.league}
                </Badge>
                <div className="flex items-center gap-1">
                  {getStatusIcon(score.status)}
                  <Badge className={`text-xs ${getStatusColor(score.status)}`}>
                    {score.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{score.homeTeam}</span>
                    <span className="text-lg font-bold">{score.homeScore}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{score.awayTeam}</span>
                    <span className="text-lg font-bold">{score.awayScore}</span>
                  </div>
                </div>
                
                <div className="ml-4 text-center">
                  <div className="text-xs text-muted-foreground mb-1">
                    {score.period || 'Time'}
                  </div>
                  <div className="text-sm font-semibold">
                    {score.time}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {loading && (
          <div className="text-center py-4">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2">Updating scores...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


