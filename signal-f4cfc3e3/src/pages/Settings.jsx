import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Settings as SettingsIcon, Save, TrendingUp, Bitcoin, DollarSign, Gem, Key, ExternalLink, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Settings({ user, isAnonymous }) {
  const [settings, setSettings] = useState({
    high_contrast: false,
    notifications_enabled: true,
    notification_preferences: {
      urgent_enabled: true,
      digest_enabled: true
    },
    preferred_markets: ["stock", "crypto"],
    api_keys: {
      alpha_vantage: "",
      huggingface: ""
    }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState(false);

  useEffect(() => {
    if (user) {
      setSettings({
        high_contrast: user.high_contrast || false,
        notifications_enabled: user.notifications_enabled !== false,
        notification_preferences: user.notification_preferences || {
          urgent_enabled: true,
          digest_enabled: true
        },
        preferred_markets: user.preferred_markets || ["stock", "crypto"],
        api_keys: user.api_keys || {
          alpha_vantage: "",
          huggingface: ""
        }
      });
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    await User.updateMyUserData(settings);
    window.location.reload();
  };

  const toggleMarket = (market) => {
    const current = settings.preferred_markets || [];
    const updated = current.includes(market)
      ? current.filter(m => m !== market)
      : [...current, market];
    setSettings({ ...settings, preferred_markets: updated });
  };

  const maskKey = (key) => {
    if (!key || key.length < 8) return "Not set";
    return `${key.slice(0, 4)}${"*".repeat(key.length - 8)}${key.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0F1C] to-[#0F1729] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Customize your Signal experience</p>
        </div>

        <div className="space-y-6">
          <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-emerald-400" />
                API Keys (Optional but Recommended)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-blue-500/10 border-blue-500/30">
                <AlertCircle className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-300 text-sm">
                  Add your own API keys to unlock real-time market data and enhanced AI features. 
                  Your keys are stored securely and never shared.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-white font-medium">Alpha Vantage API Key</Label>
                    <a 
                      href="https://www.alphavantage.co/support/#api-key" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-1"
                    >
                      Get Free Key <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    Enables real-time stock, crypto, forex, and commodity prices
                  </p>
                  {showApiKeys ? (
                    <Input
                      type="text"
                      placeholder="Enter your Alpha Vantage API key"
                      value={settings.api_keys?.alpha_vantage || ""}
                      onChange={(e) => setSettings({
                        ...settings,
                        api_keys: { ...settings.api_keys, alpha_vantage: e.target.value }
                      })}
                      className="bg-gray-800 border-gray-700 text-white font-mono"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        type="password"
                        value={settings.api_keys?.alpha_vantage || ""}
                        disabled
                        placeholder="Not configured"
                        className="bg-gray-800 border-gray-700 text-gray-500"
                      />
                      <Button
                        onClick={() => setShowApiKeys(true)}
                        variant="outline"
                        size="sm"
                        className="border-emerald-500/50 text-emerald-400"
                      >
                        Edit
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-white font-medium">Hugging Face Token</Label>
                    <a 
                      href="https://huggingface.co/settings/tokens" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-1"
                    >
                      Get Free Token <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    Enables advanced financial sentiment analysis with FinBERT
                  </p>
                  {showApiKeys ? (
                    <Input
                      type="text"
                      placeholder="Enter your Hugging Face token (hf_...)"
                      value={settings.api_keys?.huggingface || ""}
                      onChange={(e) => setSettings({
                        ...settings,
                        api_keys: { ...settings.api_keys, huggingface: e.target.value }
                      })}
                      className="bg-gray-800 border-gray-700 text-white font-mono"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        type="password"
                        value={settings.api_keys?.huggingface || ""}
                        disabled
                        placeholder="Not configured"
                        className="bg-gray-800 border-gray-700 text-gray-500"
                      />
                      <Button
                        onClick={() => setShowApiKeys(true)}
                        variant="outline"
                        size="sm"
                        className="border-emerald-500/50 text-emerald-400"
                      >
                        Edit
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {showApiKeys && (
                <Alert className="bg-yellow-500/10 border-yellow-500/30">
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                  <AlertDescription className="text-yellow-300 text-sm">
                    Remember to click "Save Settings" below to store your API keys securely.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Market Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white font-medium mb-3 block">Which markets do you want to track?</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: "stock", label: "Stocks", icon: TrendingUp },
                    { value: "crypto", label: "Crypto", icon: Bitcoin },
                    { value: "forex", label: "Forex", icon: DollarSign },
                    { value: "commodity", label: "Commodities", icon: Gem }
                  ].map((market) => (
                    <button
                      key={market.value}
                      onClick={() => toggleMarket(market.value)}
                      className={`p-4 rounded-lg border transition-all flex flex-col items-center gap-2 ${
                        settings.preferred_markets?.includes(market.value)
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                          : "border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600"
                      }`}
                    >
                      <market.icon className="w-6 h-6" />
                      <span className="text-sm font-medium">{market.label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  News and insights will be tailored to your selected markets
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Display Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white font-medium">High Contrast Mode</Label>
                  <p className="text-sm text-gray-400">Increase contrast for better visibility</p>
                </div>
                <Switch
                  checked={settings.high_contrast}
                  onCheckedChange={(checked) => setSettings({ ...settings, high_contrast: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white font-medium">Enable Notifications</Label>
                  <p className="text-sm text-gray-400">Receive alerts about your portfolio</p>
                </div>
                <Switch
                  checked={settings.notifications_enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, notifications_enabled: checked })}
                />
              </div>

              {settings.notifications_enabled && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white font-medium">Urgent Alerts</Label>
                      <p className="text-sm text-gray-400">High-priority market movements</p>
                    </div>
                    <Switch
                      checked={settings.notification_preferences.urgent_enabled}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        notification_preferences: { ...settings.notification_preferences, urgent_enabled: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white font-medium">Daily Digest</Label>
                      <p className="text-sm text-gray-400">Summary of daily market activity</p>
                    </div>
                    <Switch
                      checked={settings.notification_preferences.digest_enabled}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        notification_preferences: { ...settings.notification_preferences, digest_enabled: checked }
                      })}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-emerald-500 hover:bg-emerald-600"
          >
            {isSaving ? "Saving..." : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}