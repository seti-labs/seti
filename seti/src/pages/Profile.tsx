"use client"

import { Layout } from "@/components/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Settings, Bell, Shield, Copy, Check } from "lucide-react"
import { useEffect, useState } from "react"
import { useTheme } from "@/contexts/ThemeContext"
import { useLocation, useSearchParams } from "react-router-dom"
import { useWalletConnection } from "@/hooks/useWalletConnection"
import { useUserPreferences } from "@/hooks/useUserPreferences"
import { useToast } from "@/components/ui/use-toast"

export default function Profile() {
  const { isConnected, address, isConnecting, isReady, shouldShowConnectPrompt, isWalletReady } = useWalletConnection()
  const { preferences, updateProfile, updateNotificationSettings, updateTheme, isLoading: preferencesLoading } = useUserPreferences()
  const { setTheme } = useTheme()
  const { toast } = useToast()
  const currentAccount = address ? { address } : null
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = new URLSearchParams(location.search).get('tab') || (typeof window !== 'undefined' ? localStorage.getItem('profile_active_tab') || 'profile' : 'profile')
  const [activeTab, setActiveTab] = useState<string>(initialTab)
  const [copied, setCopied] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [notifBusyKey, setNotifBusyKey] = useState<null | keyof typeof preferences.notification_settings>(null)
  const [themeBusy, setThemeBusy] = useState(false)

  const copyAddress = async () => {
    if (currentAccount?.address) {
      await navigator.clipboard.writeText(currentAccount.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Keep activeTab in sync with URL changes (react-router location)
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tab = params.get('tab')
    if (tab && tab !== activeTab) {
      setActiveTab(tab)
    }
  }, [location.search, activeTab])

  // Persist tab to URL and localStorage on change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    try { localStorage.setItem('profile_active_tab', value) } catch (_e) { /* noop */ void 0 }
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('tab', value)
      return next
    }, { replace: true })
  }

  // Handler functions
  const handleSaveProfile = async () => {
    setSavingProfile(true)
    const success = await updateProfile({
      username: preferences.username,
      bio: preferences.bio
    })
    setSavingProfile(false)
    if (success) {
      toast({ title: "Profile updated", description: "Your profile details were saved." })
    } else {
      toast({ title: "Failed to save", description: "Please try again.", variant: "destructive" })
    }
  }

  const handleNotificationToggle = async (key: keyof typeof preferences.notification_settings) => {
    if (notifBusyKey) return
    setNotifBusyKey(key)
    const success = await updateNotificationSettings({
      [key]: !preferences.notification_settings[key]
    })
    setNotifBusyKey(null)
    if (!success) {
      toast({ title: "Update failed", description: "Could not update notifications.", variant: "destructive" })
    } else {
      toast({ title: "Notifications updated", description: `Setting for ${key} saved.` })
    }
  }

  const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    if (themeBusy) return
    setThemeBusy(true)
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
    setThemeBusy(false)
    if (!success) {
      toast({ title: "Failed to update theme", description: "Please try again.", variant: "destructive" })
    } else {
      toast({ title: "Theme updated", description: `Preference set to ${theme}.` })
    }
  }

  // Show loading state only while wallet is initializing/connecting
  if (!isReady || isConnecting) {
    return (
      <Layout>
        <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-16 max-w-7xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gradient-gold mb-4">Profile</h1>
            <p className="text-muted-foreground mb-8">Loading wallet connection...</p>
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

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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
          <TabsContent value="profile" className="space-y-6" forceMount>
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
                  disabled={savingProfile}
                  className="bg-[hsl(208,65%,75%)] hover:bg-[hsl(208,65%,85%)] text-background"
                >
                  {savingProfile ? 'Saving…' : 'Save Changes'}
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
          <TabsContent value="notifications" className="space-y-6" forceMount>
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
                      disabled={notifBusyKey === 'marketUpdates'}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-[hsl(208,65%,75%)] focus:ring-offset-2 ${
                        preferences.notification_settings.marketUpdates 
                          ? 'bg-[hsl(208,65%,75%)]' 
                          : 'bg-muted'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white ${
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
                      disabled={notifBusyKey === 'positionAlerts'}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-[hsl(208,65%,75%)] focus:ring-offset-2 ${
                        preferences.notification_settings.positionAlerts 
                          ? 'bg-[hsl(208,65%,75%)]' 
                          : 'bg-muted'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white ${
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
                      disabled={notifBusyKey === 'marketResolution'}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-[hsl(208,65%,75%)] focus:ring-offset-2 ${
                        preferences.notification_settings.marketResolution 
                          ? 'bg-[hsl(208,65%,75%)]' 
                          : 'bg-muted'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white ${
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
          <TabsContent value="settings" className="space-y-6" forceMount>
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
                        disabled={themeBusy}
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