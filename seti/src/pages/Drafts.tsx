import React, { useState } from 'react'
import { Layout } from '@/components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  FileText, 
  Edit, 
  Trash2, 
  Clock, 
  Tag, 
  Search, 
  Plus,
  Calendar,
  DollarSign,
  Image as ImageIcon
} from 'lucide-react'
import { useDrafts } from '@/hooks/useDrafts'
import { CreateMarketModal } from '@/components/CreateMarketModal'
import { formatDistanceToNow } from 'date-fns'

export default function Drafts() {
  const { drafts, deleteDraft, getDraftsByCategory } = useDrafts()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingDraft, setEditingDraft] = useState<string | null>(null)

  // Get unique categories from drafts
  const categories = ['all', ...Array.from(new Set(drafts.map(draft => draft.category).filter(Boolean)))]
  
  // Filter drafts based on search and category
  const filteredDrafts = drafts.filter(draft => {
    const matchesSearch = searchQuery === '' || 
      draft.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      draft.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      draft.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || draft.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const handleEditDraft = (draftId: string) => {
    setEditingDraft(draftId)
    setIsCreateModalOpen(true)
  }

  const handleDeleteDraft = (draftId: string) => {
    if (window.confirm('Are you sure you want to delete this draft?')) {
      deleteDraft(draftId)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Sports': 'bg-green-100 text-green-800',
      'Politics': 'bg-blue-100 text-blue-800',
      'Crypto': 'bg-yellow-100 text-yellow-800',
      'Entertainment': 'bg-purple-100 text-purple-800',
      'Technology': 'bg-gray-100 text-gray-800',
      'Economics': 'bg-red-100 text-red-800',
      'Other': 'bg-gray-100 text-gray-800'
    }
    return colors[category] || colors['Other']
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Draft Markets</h1>
              <p className="text-muted-foreground">
                {drafts.length} draft{drafts.length !== 1 ? 's' : ''} saved
              </p>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 sm:mt-0 bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Market
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search drafts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          {/* Drafts Grid */}
          {filteredDrafts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery || selectedCategory !== 'all' ? 'No drafts found' : 'No drafts yet'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start creating a market to save your first draft'
                }
              </p>
              {!searchQuery && selectedCategory === 'all' && (
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Market
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDrafts.map((draft) => (
                <Card key={draft.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg line-clamp-2 mb-2">
                          {draft.question}
                        </CardTitle>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`text-xs ${getCategoryColor(draft.category)}`}>
                            {draft.category}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(draft.updatedAt, { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Description */}
                    {draft.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {draft.description}
                      </p>
                    )}

                    {/* Tags */}
                    {draft.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {draft.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {draft.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{draft.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Market Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Ends:</span>
                        <span className="font-medium">
                          {new Date(draft.endTime).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Liquidity:</span>
                        <span className="font-medium">{draft.initialLiquidity} USDC</span>
                      </div>
                    </div>

                    {/* Image Preview */}
                    {draft.imageUrl && (
                      <div className="relative">
                        <img
                          src={draft.imageUrl}
                          alt="Market preview"
                          className="w-full h-24 object-cover rounded-md"
                        />
                        <div className="absolute top-2 right-2">
                          <ImageIcon className="w-4 h-4 text-white bg-black/50 rounded p-1" />
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditDraft(draft.id)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteDraft(draft.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Create Market Modal */}
        <CreateMarketModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false)
            setEditingDraft(null)
          }}
          onSuccess={(marketId) => {
            console.log('Market created:', marketId)
            setIsCreateModalOpen(false)
            setEditingDraft(null)
          }}
          draftId={editingDraft}
        />
      </div>
    </Layout>
  )
}


