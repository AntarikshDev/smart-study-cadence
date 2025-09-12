import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateUserProfile } from '@/store/slices/userSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Settings as SettingsIcon, 
  Clock, 
  Bell, 
  Timer, 
  Shield, 
  Download,
  Save,
  Globe
} from 'lucide-react';
import { UserSettings } from '@/types/revision';
import { toast } from '@/hooks/use-toast';

export default function Settings() {
  const dispatch = useAppDispatch();
  const { currentUser, loading } = useAppSelector((state) => state.user);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setSettings({
        dailyCapacityMinutes: 60,
        pushWindowStart: '09:00',
        pushWindowEnd: '21:00',
        enableCascadeSnoozByDefault: true,
        timerQuickPresets: [15, 30, 45, 60],
        timezone: 'Asia/Kolkata',
        anonymizeOnLeaderboards: false,
        notifications: true,
        darkMode: false,
        focusDuration: 25,
        reminderFrequency: 'hourly',
        ...currentUser.settings
      });
    }
  }, [currentUser]);

  const handleSave = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      await dispatch(updateUserProfile({ settings })).unwrap();
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    // Mock export functionality
    toast({
      title: "Export started",
      description: "Your revision logs are being prepared for download.",
    });
  };

  if (loading) {
    return <SettingsSkeleton />;
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Failed to load settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
            <SettingsIcon className="h-8 w-8 text-primary" />
            <span>Settings</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Customize your revision planner experience
          </p>
        </div>
        
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <span>Study Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="capacity">Daily Capacity (minutes)</Label>
              <Input
                id="capacity"
                type="number"
                value={settings.dailyCapacityMinutes}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  dailyCapacityMinutes: Number(e.target.value) 
                })}
                min="15"
                max="480"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Recommended: 30-90 minutes per day for optimal retention
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>Push Notification Window</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-time" className="text-sm">Start Time</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={settings.pushWindowStart}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      pushWindowStart: e.target.value 
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-time" className="text-sm">End Time</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={settings.pushWindowEnd}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      pushWindowEnd: e.target.value 
                    })}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                You'll only receive revision reminders during this window
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Enable Cascade Snooze by Default</Label>
                <p className="text-xs text-muted-foreground">
                  When you snooze a topic, automatically shift future revisions
                </p>
              </div>
              <Switch
                checked={settings.enableCascadeSnoozByDefault}
                onCheckedChange={(checked) => setSettings({ 
                  ...settings, 
                  enableCascadeSnoozByDefault: checked 
                })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Timer Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Timer className="h-5 w-5 text-warning" />
              <span>Timer Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Quick Timer Presets (minutes)</Label>
              <div className="grid grid-cols-4 gap-2">
                {settings.timerQuickPresets.map((preset, index) => (
                  <Input
                    key={index}
                    type="number"
                    value={preset}
                    onChange={(e) => {
                      const newPresets = [...settings.timerQuickPresets];
                      newPresets[index] = Number(e.target.value);
                      setSettings({ ...settings, timerQuickPresets: newPresets });
                    }}
                    min="5"
                    max="180"
                    className="text-center"
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                These will appear as quick-select options in the timer
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select 
                value={settings.timezone} 
                onValueChange={(value) => setSettings({ ...settings, timezone: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                  <SelectItem value="Australia/Sydney">Australia/Sydney (AEST)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Social */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-success" />
              <span>Privacy & Social</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Show Me Anonymously on Leaderboards</Label>
                <p className="text-xs text-muted-foreground">
                  Your name will be hidden from other students, but you can still see your rank
                </p>
              </div>
              <Switch
                checked={settings.anonymizeOnLeaderboards}
                onCheckedChange={(checked) => setSettings({ 
                  ...settings, 
                  anonymizeOnLeaderboards: checked 
                })}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Privacy Status</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your current privacy settings
                  </p>
                </div>
                <Badge variant={settings.anonymizeOnLeaderboards ? 'success' : 'secondary'}>
                  {settings.anonymizeOnLeaderboards ? 'Anonymous' : 'Public'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-accent" />
              <span>Data Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Export Your Data</Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Download all your revision logs, session data, and progress statistics
                </p>
                <Button 
                  variant="outline" 
                  onClick={handleExport}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export to CSV
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Data Summary</Label>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-muted/50 rounded">
                    <div className="font-medium">Total Sessions</div>
                    <div className="text-muted-foreground">42 completed</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded">
                    <div className="font-medium">Study Time</div>
                    <div className="text-muted-foreground">18h 45m total</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded">
                    <div className="font-medium">Topics</div>
                    <div className="text-muted-foreground">17 active</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded">
                    <div className="font-medium">Member Since</div>
                    <div className="text-muted-foreground">Aug 2024</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Philosophy Footer */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 text-lg font-semibold text-primary">
              <Globe className="h-5 w-5" />
              <span>Plan → Do → Reflect → Adapt</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Our core philosophy guides every feature to help you build sustainable study habits
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const SettingsSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, j) => (
              <Skeleton key={j} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);