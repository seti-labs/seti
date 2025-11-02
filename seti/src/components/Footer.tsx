import { SOCIAL_LINKS, COMPANY_INFO } from '@/constants/social'
import { Twitter, Linkedin, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Footer() {
  return (
    <footer className="bg-card/50 border-t border-border/30 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <img src="./seti_.svg" alt="Seti logo" className="h-10 w-10" />
              <span
                className="text-3xl font-bold text-foreground"
                style={{
                  fontFamily: "'Fortune Variable'",
                  textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                Seti
              </span>
            </div>
            <p className="text-muted-foreground max-w-md leading-relaxed">
              {COMPANY_INFO.description}
            </p>
            <div className="flex items-center gap-3">
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
              <a 
                href={SOCIAL_LINKS.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[hsl(208,65%,75%)] hover:text-[hsl(208,65%,85%)] transition-colors font-medium"
              >
                {SOCIAL_LINKS.handles.website}
              </a>
          </div>
          </div>

          {/* Social Links */}
          <div className="space-y-6">
            <h3 className="font-semibold text-foreground text-lg">Follow Us</h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start bg-transparent border-border/50 hover:border-[hsl(208,65%,75%)] hover:bg-[hsl(208,65%,75%)]/10 transition-all duration-200"
                asChild
              >
                <a 
                  href={SOCIAL_LINKS.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3"
                >
                  <Twitter className="w-4 h-4 text-[hsl(208,65%,75%)]" />
                  <span className="text-foreground font-medium">{SOCIAL_LINKS.handles.twitter}</span>
                </a>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start bg-transparent border-border/50 hover:border-[hsl(208,65%,75%)] hover:bg-[hsl(208,65%,75%)]/10 transition-all duration-200"
                asChild
              >
                <a 
                  href={SOCIAL_LINKS.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3"
                >
                  <Linkedin className="w-4 h-4 text-[hsl(208,65%,75%)]" />
                  <span className="text-foreground font-medium">{SOCIAL_LINKS.handles.linkedin}</span>
                </a>
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="font-semibold text-foreground text-lg">Quick Links</h3>
            <div className="space-y-3">
              <a href="/dashboard" className="block text-sm text-muted-foreground hover:text-[hsl(208,65%,75%)] transition-colors font-medium">
                Dashboard
              </a>
              <a href="/activity" className="block text-sm text-muted-foreground hover:text-[hsl(208,65%,75%)] transition-colors font-medium">
                Activity
              </a>
              <a href="/profile" className="block text-sm text-muted-foreground hover:text-[hsl(208,65%,75%)] transition-colors font-medium">
                Profile
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border/30 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 {COMPANY_INFO.name}. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-[hsl(208,65%,75%)] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[hsl(208,65%,75%)] transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}