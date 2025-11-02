import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Calendar, DollarSign } from "lucide-react";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { useContract } from "@/hooks/useContract";
import { useDrafts } from "@/hooks/useDrafts";

interface CreateMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (marketId: string) => void;
  draftId?: string | null;
}

export function CreateMarketModal({ isOpen, onClose, onSuccess, draftId }: CreateMarketModalProps) {
  const { isConnected, address } = useWalletConnection();
  const { createMarket, isLoading: contractLoading, error: contractError } = useContract();
  const { createDraft, updateDraft, getDraft, deleteDraft } = useDrafts();
  const [isLoading, setIsLoading] = useState(false);
  const [isDraftMode, setIsDraftMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    question: "",
    description: "",
    end_time: "",
    category: "",
    image_url: "",
    tags: [] as string[],
    initial_liquidity: ""
  });
  const [newTag, setNewTag] = useState("");

  // Load draft data when draftId is provided
  React.useEffect(() => {
    if (draftId) {
      const draft = getDraft(draftId);
      if (draft) {
        setFormData({
          question: draft.question,
          description: draft.description,
          end_time: draft.endTime,
          category: draft.category,
          image_url: draft.imageUrl,
          tags: draft.tags,
          initial_liquidity: draft.initialLiquidity
        });
        setIsDraftMode(true);
      }
    } else {
      // Reset form when no draft
      setFormData({
        question: "",
        description: "",
        end_time: "",
        category: "",
        image_url: "",
        tags: [],
        initial_liquidity: ""
      });
      setIsDraftMode(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId]);

  // Admin addresses - only these can create markets
  const ADMIN_ADDRESSES = [
    "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", // Replace with actual admin address
  ];

  const isAdmin = address && ADMIN_ADDRESSES.some(admin => 
    admin.toLowerCase() === address.toLowerCase()
  );

  if (!isOpen) return null;

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-[100] flex">
        <div 
          className="flex-1 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <div className="w-[450px] bg-background border-r shadow-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-gradient-gold font-orbitron">
              Access Denied
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-foreground mb-4">Admin Only</h3>
              <p className="text-muted-foreground mb-6">
                Only administrators can create prediction markets.
              </p>
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveDraft = () => {
    if (!formData.question.trim()) {
      alert("Please enter a question to save as draft");
      return;
    }

    const draftData = {
      question: formData.question,
      description: formData.description,
      category: formData.category,
      endTime: formData.end_time,
      imageUrl: formData.image_url,
      tags: formData.tags,
      initialLiquidity: formData.initial_liquidity
    };

    if (draftId) {
      updateDraft(draftId, draftData);
    } else {
      createDraft(draftData);
    }
    
    alert("Draft saved successfully!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Validate form data
      if (!formData.question.trim()) {
        throw new Error("Question is required");
      }
      
      if (!formData.end_time) {
        throw new Error("End time is required");
      }
      
      const endTime = new Date(formData.end_time).getTime() / 1000;
      if (endTime <= Date.now() / 1000) {
        throw new Error("End time must be in the future");
      }
      
      // Create market on smart contract
      const result = await createMarket(
        formData.question,
        formData.description || formData.question,
        endTime
      );
      
      if (result) {
        // Call success callback with market ID
        if (onSuccess) {
          onSuccess(result);
        }
        
        // Reset form and close modal
        setFormData({
          question: "",
          description: "",
          end_time: "",
          category: "",
          image_url: "",
          tags: [],
          initial_liquidity: ""
        });
        onClose();
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create market");
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* Backdrop */}
      <div 
        className="flex-1 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Left Sidebar */}
      <div className="w-[550px] bg-background border-r shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gradient-gold font-orbitron">
            Create New Market
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Question */}
            <div className="space-y-2">
              <Label htmlFor="question" className="text-sm font-medium">
                Market Question *
              </Label>
              <Input
                id="question"
                placeholder="e.g., Will Bitcoin hit $100K by end of 2024?"
                value={formData.question}
                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                required
                className="bg-muted/30 border-border/50"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description *
              </Label>
              <Textarea
                id="description"
                placeholder="Provide context and details about this market..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                rows={3}
                className="bg-muted/30 border-border/50"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                Category *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                required
              >
                <SelectTrigger className="bg-muted/30 border-border/50">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Crypto">Crypto</SelectItem>
                  <SelectItem value="Stocks">Stocks</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                  <SelectItem value="Politics">Politics</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Economics">Economics</SelectItem>
                  <SelectItem value="Space">Space</SelectItem>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <Label htmlFor="end_time" className="text-sm font-medium">
                Market End Date *
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="end_time"
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                  required
                  className="pl-10 bg-muted/30 border-border/50"
                />
              </div>
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="image_url" className="text-sm font-medium">
                Market Image URL
              </Label>
              <Input
                id="image_url"
                placeholder="https://images.unsplash.com/photo-1234567890/example.jpg"
                value={formData.image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                className="bg-muted/30 border-border/50"
              />
              <p className="text-xs text-muted-foreground">
                Use a public image URL (e.g., Unsplash, Imgur, or your own hosting)
              </p>
              {formData.image_url && (
                <div className="mt-2">
                  <img 
                    src={formData.image_url} 
                    alt="Preview" 
                    className="w-full h-32 object-cover rounded-lg border border-border/50"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="bg-muted/30 border-border/50"
                />
                <Button 
                  type="button" 
                  onClick={addTag} 
                  size="sm" 
                  variant="outline"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Initial Liquidity */}
            <div className="space-y-2">
              <Label htmlFor="initial_liquidity" className="text-sm font-medium">
                Initial Liquidity (USDC) *
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="initial_liquidity"
                  type="number"
                  placeholder="10"
                  value={formData.initial_liquidity}
                  onChange={(e) => setFormData(prev => ({ ...prev, initial_liquidity: e.target.value }))}
                  required
                  min="1"
                  step="0.1"
                  className="pl-10 bg-muted/30 border-border/50"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Minimum 10 USDC. This provides initial liquidity and will be split equally between YES and NO outcomes.
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                className="flex-1 transition-all duration-200 hover:scale-105"
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleSaveDraft}
                className="flex-1 transition-all duration-200 hover:scale-105"
              >
                {draftId ? "Update Draft" : "Save Draft"}
              </Button>
              <Button 
                type="submit" 
                className="btn-market-gold flex-1 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={isLoading || contractLoading || !isConnected}
              >
                {(isLoading || contractLoading) ? "Creating..." : "Create Market"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
