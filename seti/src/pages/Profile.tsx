"use client"

import { Layout } from "@/components/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Settings, Bell, Shield, Copy, Check } from "lucide-react"
import { useState } from "react"
import { useTheme } from "@/contexts/ThemeContext"
import { useWalletConnection } from "@/hooks/useWalletConnection"
import { useUserPreferences } from "@/hooks/useUserPreferences"

export default function Profile() {
  const { isConnected, address, isConnecting, isReady, shouldShowConnectPrompt, isWalletReady } = useWalletConnection()
  const { preferences, updateProfile, updateNotificationSettings, updateTheme, isLoading: preferencesLoading } = useUserPreferences()
  const { setTheme } = useTheme()
  const currentAccount = address ? { address } : null
  const [copied, setCopied] = useState(false)

  const copyAddress = async () => {
    if (currentAccount?.address) {
      await navigator.clipboard.writeText(currentAccount.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Handler functions
  const handleSaveProfile = async () => {
    const success = await updateProfile({
      username: preferences.username,
      bio: preferences.bio
    })

    if (success) {
      alert('Profile saved successfully!')
    } else {
      alert('Failed to save profile. Please try again.')
    }
  }

  const handleNotificationToggle = async (key: keyof typeof preferences.notification_settings) => {
    const success = await updateNotificationSettings({
      [key]: !preferences.notification_settings[key]
    })

    if (!success) {
      alert('Failed to update notification settings. Please try again.')
    }
  }

  const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    // Apply immediately to UI
    if (theme === 'light' || theme === 'dark') {
      setTheme(theme)
    } else if (theme === 'system') {
      // Use system preference to set actual UI theme
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
    }

    // Persist preference
    const success = await updateTheme(theme)
    if (!success) {
      alert('Failed to update theme. Please try again.')
    }
  }

  // Show loading state while wallet is initializing or preferences are loading
  if (!isReady || isConnecting || preferencesLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-16 max-w-7xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gradient-gold mb-4">Profile</h1>
            <p className="text-muted-foreground mb-8">Loading wallet connection and preferences...</p>
          </div>
        </div>
      </Layout>
    )
  }

  // Show connect wallet prompt if not connected
  if (!isConnected || !address) {
    return (
      <Layout>
        <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-16 max-w-7xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gradient-gold mb-4">Profile</h1>
            <p className="text-muted-foreground mb-8">Please connect your wallet to view your profile</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-16 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gradient-gold mb-4">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    placeholder="Enter username" 
                    className="bg-muted/30" 
                    value={preferences.username || ''}
                    onChange={(e) => updateProfile({ username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio (Optional)</Label>
                  <Input 
                    id="bio" 
                    placeholder="Tell us about yourself" 
                    className="bg-muted/30" 
                    value={preferences.bio || ''}
                    onChange={(e) => updateProfile({ bio: e.target.value })}
                  />
                </div>
                <Button 
                  onClick={handleSaveProfile}
                  className="bg-[hsl(208,65%,75%)] hover:bg-[hsl(208,65%,85%)] text-background transition-all duration-200 hover:scale-105"
                >
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Wallet Information</CardTitle>
                <CardDescription>Your connected wallet details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <div className="font-medium">Wallet Address</div>
                    <div className="text-sm text-muted-foreground font-mono">
                      {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyAddress}
                    className="bg-[hsl(208,65%,75%)] hover:bg-[hsl(208,65%,85%)] text-background border-[hsl(208,65%,75%)]"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what updates you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-4 border-b border-border/20">
                  <div className="flex-1">
                    <div className="font-medium text-foreground">Market Updates</div>
                    <div className="text-sm text-muted-foreground mt-1">Get notified about market changes</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {preferences.notification_settings.marketUpdates ? 'Enabled' : 'Disabled'}
                    </span>
                    <button
                      onClick={() => handleNotificationToggle('marketUpdates')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[hsl(208,65%,75%)] focus:ring-offset-2 ${
                        preferences.notification_settings.marketUpdates 
                          ? 'bg-[hsl(208,65%,75%)]' 
                          : 'bg-muted'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                          preferences.notification_settings.marketUpdates 
                            ? 'translate-x-6' 
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-4 border-b border-border/20">
                  <div className="flex-1">
                    <div className="font-medium text-foreground">Position Alerts</div>
                    <div className="text-sm text-muted-foreground mt-1">Alerts for your active positions</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {preferences.notification_settings.positionAlerts ? 'Enabled' : 'Disabled'}
                    </span>
                    <button
                      onClick={() => handleNotificationToggle('positionAlerts')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[hsl(208,65%,75%)] focus:ring-offset-2 ${
                        preferences.notification_settings.positionAlerts 
                          ? 'bg-[hsl(208,65%,75%)]' 
                          : 'bg-muted'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                          preferences.notification_settings.positionAlerts 
                            ? 'translate-x-6' 
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-4">
                  <div className="flex-1">
                    <div className="font-medium text-foreground">Market Resolution</div>
                    <div className="text-sm text-muted-foreground mt-1">When markets you're in resolve</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {preferences.notification_settings.marketResolution ? 'Enabled' : 'Disabled'}
                    </span>
                    <button
                      onClick={() => handleNotificationToggle('marketResolution')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[hsl(208,65%,75%)] focus:ring-offset-2 ${
                        preferences.notification_settings.marketResolution 
                          ? 'bg-[hsl(208,65%,75%)]' 
                          : 'bg-muted'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                          preferences.notification_settings.marketResolution 
                            ? 'translate-x-6' 
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Manage your application preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border/20">
                  <div>
                    <div className="font-medium">Theme Preference</div>
                    <div className="text-sm text-muted-foreground">Choose your preferred theme</div>
                  </div>
                  <div className="flex gap-2">
                    {[
                      { value: 'light', label: 'Light' },
                      { value: 'dark', label: 'Dark' },
                      { value: 'system', label: 'System' }
                    ].map(theme => (
                      <Button 
                        key={theme.value}
                        variant="outline" 
                        size="sm"
                        onClick={() => handleThemeChange(theme.value as 'light' | 'dark' | 'system')}
                        className={`${preferences.theme_preference === theme.value ? 'bg-[hsl(208,65%,75%)] text-background' : 'hover:bg-[hsl(208,65%,75%)] hover:text-background'} border-[hsl(208,65%,75%)]`}
                      >
                        {theme.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}