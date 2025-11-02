import { useState, useEffect } from 'react'

export interface MarketDraft {
  id: string
  question: string
  description: string
  category: string
  endTime: string
  imageUrl: string
  tags: string[]
  initialLiquidity: string
  createdAt: Date
  updatedAt: Date
}

const DRAFTS_KEY = 'seti_market_drafts'

export function useDrafts() {
  const [drafts, setDrafts] = useState<MarketDraft[]>([])

  // Load drafts from localStorage on mount
  useEffect(() => {
    try {
      const storedDrafts = localStorage.getItem(DRAFTS_KEY)
      if (storedDrafts) {
        const parsedDrafts = JSON.parse(storedDrafts).map((draft: any) => ({
          ...draft,
          createdAt: new Date(draft.createdAt),
          updatedAt: new Date(draft.updatedAt)
        }))
        setDrafts(parsedDrafts)
      }
    } catch (error) {
      console.error('Error loading drafts:', error)
    }
  }, [])

  // Save drafts to localStorage whenever drafts change
  useEffect(() => {
    try {
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts))
    } catch (error) {
      console.error('Error saving drafts:', error)
    }
  }, [drafts])

  const createDraft = (draftData: Omit<MarketDraft, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDraft: MarketDraft = {
      ...draftData,
      id: `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    setDrafts(prev => [newDraft, ...prev])
    return newDraft.id
  }

  const updateDraft = (id: string, updates: Partial<Omit<MarketDraft, 'id' | 'createdAt'>>) => {
    setDrafts(prev => prev.map(draft => 
      draft.id === id 
        ? { ...draft, ...updates, updatedAt: new Date() }
        : draft
    ))
  }

  const deleteDraft = (id: string) => {
    setDrafts(prev => prev.filter(draft => draft.id !== id))
  }

  const getDraft = (id: string) => {
    return drafts.find(draft => draft.id === id)
  }

  const clearAllDrafts = () => {
    setDrafts([])
  }

  const getDraftsByCategory = (category: string) => {
    return drafts.filter(draft => draft.category === category)
  }

  const getRecentDrafts = (limit: number = 5) => {
    return drafts
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, limit)
  }

  return {
    drafts,
    createDraft,
    updateDraft,
    deleteDraft,
    getDraft,
    clearAllDrafts,
    getDraftsByCategory,
    getRecentDrafts
  }
}


