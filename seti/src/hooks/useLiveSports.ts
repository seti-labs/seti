import { useState, useEffect, useCallback } from 'react'
import { gamesApi } from '@/services/api'

export interface LiveScore {
  id: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  status: 'live' | 'finished' | 'upcoming'
  time: string
  league: string
  period?: string
  startTime?: Date
  endTime?: Date
}

export interface UseLiveSportsOptions {
  sport?: string
  teams?: string[]
  leagues?: string[]
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useLiveSports(options: UseLiveSportsOptions = {}) {
  const {
    sport,
    teams = [],
    leagues = [],
    autoRefresh = true,
    refreshInterval = 30000 // 30 seconds
  } = options

  const [scores, setScores] = useState<LiveScore[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Mock data - replace with real API integration
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
      period: '4th Quarter',
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
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
      period: '2nd Half',
      startTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
    },
    {
      id: '3',
      homeTeam: 'Patriots',
      awayTeam: 'Chiefs',
      homeScore: 24,
      awayScore: 28,
      status: 'finished',
      time: 'Final',
      league: 'NFL',
      startTime: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      endTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    },
    {
      id: '4',
      homeTeam: 'Yankees',
      awayTeam: 'Red Sox',
      homeScore: 0,
      awayScore: 0,
      status: 'upcoming',
      time: '7:30 PM',
      league: 'MLB',
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    }
  ]

  const fetchScores = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Fetch from games API
      const response = await gamesApi.getAll({ status: 'live' })
      
      // Transform games API data to LiveScore format
      const transformedScores: LiveScore[] = response.games.map((game: any) => ({
        id: `game_${game.fixture_id}`,
        homeTeam: game.home_team,
        awayTeam: game.away_team,
        homeScore: game.home_score || 0,
        awayScore: game.away_score || 0,
        status: game.status === 'LIVE' || game.status === 'HT' ? 'live' : 
                game.status === 'FT' ? 'finished' : 'upcoming',
        time: game.status || 'TBD',
        league: game.league,
        period: game.status,
        startTime: game.kickoff_time ? new Date(game.kickoff_time) : undefined,
        endTime: game.status === 'FT' ? new Date() : undefined,
      }))
      
      // Filter scores based on options
      let filteredScores = transformedScores
      
      if (sport) {
        filteredScores = filteredScores.filter(score => 
          score.league.toLowerCase().includes(sport.toLowerCase())
        )
      }
      
      if (teams.length > 0) {
        filteredScores = filteredScores.filter(score =>
          teams.some(team => 
            score.homeTeam.toLowerCase().includes(team.toLowerCase()) ||
            score.awayTeam.toLowerCase().includes(team.toLowerCase())
          )
        )
      }
      
      if (leagues.length > 0) {
        filteredScores = filteredScores.filter(score =>
          leagues.some(league => 
            score.league.toLowerCase().includes(league.toLowerCase())
          )
        )
      }
      
      // If no games from API, use mock data as fallback
      if (filteredScores.length === 0) {
        filteredScores = mockScores
      }
      
      setScores(filteredScores)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error fetching live scores:', err)
      // Use mock data as fallback on error
      setScores(mockScores)
      setError('Failed to fetch live scores, showing demo data')
    } finally {
      setLoading(false)
    }
  }, [sport, teams, leagues])

  useEffect(() => {
    fetchScores()
  }, [fetchScores])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchScores, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchScores, autoRefresh, refreshInterval])

  const refresh = useCallback(() => {
    fetchScores()
  }, [fetchScores])

  const getScoresByStatus = useCallback((status: LiveScore['status']) => {
    return scores.filter(score => score.status === status)
  }, [scores])

  const getScoresByLeague = useCallback((league: string) => {
    return scores.filter(score => 
      score.league.toLowerCase().includes(league.toLowerCase())
    )
  }, [scores])

  const getLiveScores = useCallback(() => {
    return getScoresByStatus('live')
  }, [getScoresByStatus])

  const getUpcomingScores = useCallback(() => {
    return getScoresByStatus('upcoming')
  }, [getScoresByStatus])

  const getFinishedScores = useCallback(() => {
    return getScoresByStatus('finished')
  }, [getScoresByStatus])

  return {
    scores,
    loading,
    error,
    lastUpdated,
    refresh,
    getScoresByStatus,
    getScoresByLeague,
    getLiveScores,
    getUpcomingScores,
    getFinishedScores,
  }
}


