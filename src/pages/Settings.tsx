import { useState } from 'react';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '@/store/api/userApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { SettingsDialog } from '@/components/revision/SettingsDialog';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Palette, 
  Clock,
  Download,
  Upload,
  Trash2,
  Save,
  Globe
} from 'lucide-react';
import { UserSettings } from '@/types/revision';
import { toast } from '@/hooks/use-toast';

export default function Settings() {
  const { data: settings, isLoading, error } = useGetSettingsQuery();
  const [updateSettings] = useUpdateSettingsMutation();
const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  // Show error toast when error occurs
  if (error) {
    toast({
      title: "Error",
      description: "Failed to load settings",
      variant: "destructive",
    });
  }

  const handleUpdateSetting = async (key: keyof UserSettings, value: any) => {
    try {
      await updateSettings({ [key]: value }).unwrap();
      toast({
        title: "Setting updated",
        description: "Your setting has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update setting. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      await updateSettings(settings).unwrap();
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

  if (isLoading) {
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
            Customize your revision experience
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            onClick={() => setShowSettingsDialog(true)}
            className="flex items-center space-x-2"
          >
            <SettingsIcon className="h-4 w-4" />
            <span>Advanced</span>
          </Button>
        </div>
      </div>

      {/* Quick Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Study Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Study Time</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="dailyCapacity">Daily Capacity (minutes)</Label>
              <Input
                id="dailyCapacity"
                type="number"
                value={settings.dailyCapacityMinutes}
                onChange={(e) => handleUpdateSetting('dailyCapacityMinutes', parseInt(e.target.value))}
                min="15"
                max="480"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="focusDuration">Focus Duration (minutes)</Label>
              <Select 
                value={settings.focusDuration?.toString()} 
                onValueChange={(value) => handleUpdateSetting('focusDuration', parseInt(value))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="25">25 minutes (Pomodoro)</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Enable Notifications</Label>
              <Switch
                id="notifications"
                checked={settings.notifications}
                onCheckedChange={(checked) => handleUpdateSetting('notifications', checked)}
              />
            </div>
            
            <div>
              <Label htmlFor="reminderFreq">Reminder Frequency</Label>
              <Select 
                value={settings.reminderFrequency} 
                onValueChange={(value) => handleUpdateSetting('reminderFrequency', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="realtime">Real-time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="pushStart">Start Time</Label>
                <Input
                  id="pushStart"
                  type="time"
                  value={settings.pushWindowStart}
                  onChange={(e) => handleUpdateSetting('pushWindowStart', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="pushEnd">End Time</Label>
                <Input
                  id="pushEnd"
                  type="time"
                  value={settings.pushWindowEnd}
                  onChange={(e) => handleUpdateSetting('pushWindowEnd', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <span>Appearance & Privacy</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="darkMode">Dark Mode</Label>
              <Switch
                id="darkMode"
                checked={settings.darkMode}
                onCheckedChange={(checked) => handleUpdateSetting('darkMode', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="anonymous">Anonymous on Leaderboards</Label>
              <Switch
                id="anonymous"
                checked={settings.anonymizeOnLeaderboards}
                onCheckedChange={(checked) => handleUpdateSetting('anonymizeOnLeaderboards', checked)}
              />
            </div>
            
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select 
                value={settings.timezone} 
                onValueChange={(value) => handleUpdateSetting('timezone', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                  <SelectItem value="America/New_York">America/New_York</SelectItem>
                  <SelectItem value="America/Los_Angeles">America/Los_Angeles</SelectItem>
                  <SelectItem value="Europe/London">Europe/London</SelectItem>
                  <SelectItem value="Europe/Berlin">Europe/Berlin</SelectItem>
                  <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                  <SelectItem value="Australia/Sydney">Australia/Sydney</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Revision Behavior</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="cascade">Enable Cascade Snooze by Default</Label>
              <p className="text-xs text-muted-foreground">
                When snoozing, also shift future revisions by the same amount
              </p>
            </div>
            <Switch
              id="cascade"
              checked={settings.enableCascadeSnoozByDefault}
              onCheckedChange={(checked) => handleUpdateSetting('enableCascadeSnoozByDefault', checked)}
            />
          </div>
          
          <div>
            <Label>Timer Quick Presets (minutes)</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {settings.timerQuickPresets.map(preset => (
                <div key={preset} className="px-3 py-1 bg-muted rounded-full text-sm">
                  {preset}m
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Use Advanced Settings to customize these presets
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Data Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <Button 
              onClick={handleExport}
              variant="outline" 
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export Data</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center space-x-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete All Data</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <SettingsDialog
        isOpen={showSettingsDialog}
        onClose={() => setShowSettingsDialog(false)}
      />
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
      <div className="flex space-x-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>

    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-32 w-full" />
      </CardContent>
    </Card>
  </div>
);