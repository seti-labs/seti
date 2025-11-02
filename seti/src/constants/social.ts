/**
 * SetiLabs Social Media & Website Information
 * Official social media handles and website URLs
 */

export const SOCIAL_LINKS = {
  // Official SetiLabs social media
  twitter: 'https://x.com/SetiLabs',
  linkedin: 'https://linkedin.com/company/SetiLabs',
  
  // Official website
  website: 'https://seti-live.vercel.app',
  
  // Social media handles (without URLs)
  handles: {
    twitter: '@SetiLabs',
    linkedin: 'SetiLabs',
    website: 'seti-live.vercel.app'
  }
} as const

export const COMPANY_INFO = {
  name: 'SetiLabs',
  tagline: 'Prediction Markets Platform',
  description: 'Decentralized prediction markets built on blockchain technology',
  website: SOCIAL_LINKS.website,
  social: {
    twitter: SOCIAL_LINKS.twitter,
    linkedin: SOCIAL_LINKS.linkedin
  }
} as const

// Export individual links for easy access
export const TWITTER_URL = SOCIAL_LINKS.twitter
export const LINKEDIN_URL = SOCIAL_LINKS.linkedin
export const WEBSITE_URL = SOCIAL_LINKS.website
