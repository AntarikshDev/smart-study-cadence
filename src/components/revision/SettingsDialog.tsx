import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Clock, Bell, Shield, Download, Trash2 } from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import { UserSettings } from '@/types/revision';
import { toast } from '@/hooks/use-toast';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsDialog = ({ isOpen, onClose }: SettingsDialogProps) => {
  const [settings, setSettings] = useState<UserSettings>({
    dailyCapacityMinutes: 45,
    pushWindowStart: '09:00',
    pushWindowEnd: '21:00',
    enableCascadeSnoozByDefault: true,
    timerQuickPresets: [15, 30, 45, 60],
    anonymizeOnLeaderboards: false,
    timezone: 'Asia/Kolkata',
  });
  const [loading, setLoading] = useState(false);
  const [newPreset, setNewPreset] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const userSettings = await mockApi.getSettings();
      setSettings(userSettings);
    } catch (error) {
      toast({
        title: "Error loading settings",
        description: "Failed to load user settings.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await mockApi.updateSettings(settings);
      toast({
        title: "Settings saved successfully!",
        description: "Your preferences have been updated.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPreset = () => {
    const minutes = parseInt(newPreset);
    if (minutes && minutes > 0 && minutes <= 240 && !settings.timerQuickPresets.includes(minutes)) {
      setSettings(prev => ({
        ...prev,
        timerQuickPresets: [...prev.timerQuickPresets, minutes].sort((a, b) => a - b)
      }));
      setNewPreset('');
    } else {
      toast({
        title: "Invalid preset",
        description: "Please enter a valid number between 1-240 minutes that doesn't already exist.",
        variant: "destructive",
      });
    }
  };

  const handleRemovePreset = (preset: number) => {
    setSettings(prev => ({
      ...prev,
      timerQuickPresets: prev.timerQuickPresets.filter(p => p !== preset)
    }));
  };

  const handleExportData = () => {
    // Mock export functionality
    toast({
      title: "Export started",
      description: "Your revision data is being prepared for download.",
    });
  };

  const timezones = [
    'Asia/Kolkata',
    'America/New_York', 
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Australia/Sydney'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Revision Settings</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Capacity Settings */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Daily Capacity</span>
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="capacity">Daily Revision Capacity (minutes)</Label>
                  <div className="flex items-center space-x-4 mt-2">
                    <Slider
                      value={[settings.dailyCapacityMinutes]}
                      onValueChange={(value) => setSettings(prev => ({ ...prev, dailyCapacityMinutes: value[0] }))}
                      max={480}
                      min={15}
                      step={15}
                      className="flex-1"
                    />
                    <div className="w-16">
                      <Input
                        id="capacity"
                        type="number"
                        value={settings.dailyCapacityMinutes}
                        onChange={(e) => setSettings(prev => ({ ...prev, dailyCapacityMinutes: parseInt(e.target.value) || 45 }))}
                        min="15"
                        max="480"
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">min</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    How many minutes per day you want to spend on revisions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pushStart">Notification Window Start</Label>
                    <Input
                      id="pushStart"
                      type="time"
                      value={settings.pushWindowStart}
                      onChange={(e) => setSettings(prev => ({ ...prev, pushWindowStart: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="pushEnd">Notification Window End</Label>
                    <Input
                      id="pushEnd"
                      type="time"
                      value={settings.pushWindowEnd}
                      onChange={(e) => setSettings(prev => ({ ...prev, pushWindowEnd: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={settings.timezone} 
                    onValueChange={(value) => setSettings(prev => ({ ...prev, timezone: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map(tz => (
                        <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timer Settings */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Timer Quick Presets</h3>
              
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {settings.timerQuickPresets.map(preset => (
                    <Badge 
                      key={preset} 
                      variant="secondary" 
                      className="flex items-center space-x-1 pr-1"
                    >
                      <span>{preset}m</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleRemovePreset(preset)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Add preset (minutes)"
                    value={newPreset}
                    onChange={(e) => setNewPreset(e.target.value)}
                    type="number"
                    min="1"
                    max="240"
                    className="w-40"
                  />
                  <Button onClick={handleAddPreset} size="sm">
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Behavior Settings */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Behavior & Privacy</span>
              </h3>
              
              <div className="space-y-4">
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
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableCascadeSnoozByDefault: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="anonymous">Show Anonymously on Leaderboards</Label>
                    <p className="text-xs text-muted-foreground">
                      Hide your name and show as "Anonymous" in rankings
                    </p>
                  </div>
                  <Switch
                    id="anonymous"
                    checked={settings.anonymizeOnLeaderboards}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, anonymizeOnLeaderboards: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Data Management</span>
              </h3>
              
              <div className="space-y-3">
                <Button 
                  onClick={handleExportData}
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Revision Data (CSV)
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  Download all your topics, sessions, and statistics as a CSV file
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};