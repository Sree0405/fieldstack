import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface SystemSettings {
  projectName: string;
  projectUrl: string;
  apiSettings: {
    enableRestApi: boolean;
    enableGraphqlApi: boolean;
    enableRealtime: boolean;
  };
  security: {
    requireAuth: boolean;
    enableCors: boolean;
    apiKey: string;
  };
}

export default function Settings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>({
    projectName: 'NovaCMS',
    projectUrl: 'http://localhost:4000',
    apiSettings: {
      enableRestApi: true,
      enableGraphqlApi: true,
      enableRealtime: false,
    },
    security: {
      requireAuth: true,
      enableCors: true,
      apiKey: 'sk_test_' + Math.random().toString(36).substring(2, 15),
    },
  });

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('cmsSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage and backend
  const saveSettings = async () => {
    setLoading(true);
    try {
      // Save to localStorage
      localStorage.setItem('cmsSettings', JSON.stringify(settings));

      // Optionally sync with backend if settings endpoint exists
      try {
        const response = await fetch(`${API_BASE_URL}/system/settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings),
        });
        
        if (!response.ok) {
          console.warn('Could not sync settings with backend');
        }
      } catch (error) {
        console.warn('Backend settings sync not available:', error);
      }

      toast({
        title: "Success",
        description: "Settings saved successfully",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch system info from backend
  useEffect(() => {
    const fetchSystemInfo = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/system/endpoints`);
        if (response.ok) {
          const data = await response.json();
          console.log('System info:', data);
        }
      } catch (error) {
        console.error('Failed to fetch system info:', error);
      }
    };

    fetchSystemInfo();
  }, []);

  const handleGenerateApiKey = () => {
    const newKey = 'sk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
    setSettings({
      ...settings,
      security: {
        ...settings.security,
        apiKey: newKey,
      },
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure your CMS instance
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          General Settings
        </h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              placeholder="NovaCMS"
              value={settings.projectName}
              onChange={(e) => setSettings({ ...settings, projectName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-url">Project URL</Label>
            <Input
              id="project-url"
              placeholder="https://api.novacms.dev"
              value={settings.projectUrl}
              onChange={(e) => setSettings({ ...settings, projectUrl: e.target.value })}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          API Configuration
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enable REST API</Label>
              <p className="text-sm text-muted-foreground">
                Auto-generate REST endpoints for collections
              </p>
            </div>
            <Switch
              checked={settings.apiSettings.enableRestApi}
              onCheckedChange={(checked) => setSettings({
                ...settings,
                apiSettings: { ...settings.apiSettings, enableRestApi: checked }
              })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enable GraphQL API</Label>
              <p className="text-sm text-muted-foreground">
                Provide GraphQL interface for data queries
              </p>
            </div>
            <Switch
              checked={settings.apiSettings.enableGraphqlApi}
              onCheckedChange={(checked) => setSettings({
                ...settings,
                apiSettings: { ...settings.apiSettings, enableGraphqlApi: checked }
              })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enable Realtime</Label>
              <p className="text-sm text-muted-foreground">
                WebSocket support for live updates
              </p>
            </div>
            <Switch
              checked={settings.apiSettings.enableRealtime}
              onCheckedChange={(checked) => setSettings({
                ...settings,
                apiSettings: { ...settings.apiSettings, enableRealtime: checked }
              })}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Security
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Require Authentication</Label>
              <p className="text-sm text-muted-foreground">
                All API requests must include valid credentials
              </p>
            </div>
            <Switch
              checked={settings.security.requireAuth}
              onCheckedChange={(checked) => setSettings({
                ...settings,
                security: { ...settings.security, requireAuth: checked }
              })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enable CORS</Label>
              <p className="text-sm text-muted-foreground">
                Allow cross-origin requests from specified domains
              </p>
            </div>
            <Switch
              checked={settings.security.enableCors}
              onCheckedChange={(checked) => setSettings({
                ...settings,
                security: { ...settings.security, enableCors: checked }
              })}
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <div className="flex gap-2">
              <Input
                id="api-key"
                type="password"
                value={settings.security.apiKey}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                onClick={handleGenerateApiKey}
                variant="outline"
              >
                Regenerate
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex gap-2">
        <Button
          onClick={saveSettings}
          disabled={loading}
          className="bg-primary hover:bg-primary/90"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
