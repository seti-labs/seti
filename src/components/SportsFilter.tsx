"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { sportsApi } from "@/services/api"
import { Loader2 } from "lucide-react"

interface SportsFilterProps {
  onLeagueChange: (league: string | null) => void
  selectedLeague: string | null
}

export function SportsFilter({ onLeagueChange, selectedLeague }: SportsFilterProps) {
  const [leagues, setLeagues] = useState<Array<{ name: string; count: number }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await sportsApi.getLeagues()
        
        if (response.success) {
          setLeagues(response.leagues)
        } else {
          setError('Failed to fetch leagues')
        }
      } catch (err) {
        console.error('Error fetching leagues:', err)
        setError('Failed to fetch leagues')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeagues()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading leagues...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-destructive">
        {error}
      </div>
    )
  }

  return (
    <div className="p-4 border-b border-border/50">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold">Filter by League</h3>
        {selectedLeague && (
          <Badge variant="secondary" className="text-xs">
            {selectedLeague}
          </Badge>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedLeague === null ? "default" : "outline"}
          size="sm"
          onClick={() => onLeagueChange(null)}
          className="text-xs"
        >
          All Leagues
        </Button>
        
        {leagues.map((league) => (
          <Button
            key={league.name}
            variant={selectedLeague === league.name ? "default" : "outline"}
            size="sm"
            onClick={() => onLeagueChange(league.name)}
            className="text-xs"
          >
            {league.name}
            <Badge variant="secondary" className="ml-1 text-xs">
              {league.count}
            </Badge>
          </Button>
        ))}
      </div>
    </div>
  )
}

