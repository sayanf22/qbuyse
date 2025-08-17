import { useState, useEffect } from "react";
import { ArrowLeft, Globe, Bell, Shield, User, Palette, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "@/components/ThemeProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import { SEOHead } from "@/components/SEOHead";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [localLanguage, setLocalLanguage] = useState(language);
  const [notifications, setNotifications] = useState(true);
  const [chatNotifications, setChatNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);

  useEffect(() => {
    // Load saved settings from localStorage
    const savedNotifications = localStorage.getItem("notifications") !== "false";
    const savedChatNotifications = localStorage.getItem("chat-notifications") !== "false";
    const savedEmailNotifications = localStorage.getItem("email-notifications") === "true";

    setLocalLanguage(language);
    setNotifications(savedNotifications);
    setChatNotifications(savedChatNotifications);
    setEmailNotifications(savedEmailNotifications);
  }, [language]);

  const handleLanguageChange = (newLanguage: string) => {
    setLocalLanguage(newLanguage);
    setLanguage(newLanguage as any);
    toast({
      title: "Language Updated",
      description: `Language changed to ${getLanguageName(newLanguage)}`,
    });
  };

  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    toast({
      title: "Theme Updated",
      description: `${newTheme === "dark" ? "Dark" : "Light"} mode enabled`,
    });
  };

  const handleNotificationToggle = (type: string, enabled: boolean) => {
    switch (type) {
      case "general":
        setNotifications(enabled);
        localStorage.setItem("notifications", enabled.toString());
        break;
      case "chat":
        setChatNotifications(enabled);
        localStorage.setItem("chat-notifications", enabled.toString());
        break;
      case "email":
        setEmailNotifications(enabled);
        localStorage.setItem("email-notifications", enabled.toString());
        break;
    }
    toast({
      title: "Notification Settings Updated",
      description: `${type} notifications ${enabled ? "enabled" : "disabled"}`,
    });
  };

  const getLanguageName = (code: string) => {
    const languages: { [key: string]: string } = {
      en: "English",
      hi: "हिंदी (Hindi)",
      mr: "मराठी (Marathi)",
      gu: "ગુજરાતી (Gujarati)",
      bn: "বাংলা (Bengali)",
      ta: "தமிழ் (Tamil)",
      te: "తెలుగు (Telugu)",
      kn: "ಕನ್ನಡ (Kannada)",
      ml: "മലയാളം (Malayalam)",
      pa: "ਪੰਜਾਬੀ (Punjabi)",
    };
    return languages[code] || "English";
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Settings"
        description="Customize your Qbuyse marketplace experience - language, notifications, theme and privacy settings for India's local marketplace"
        keywords={['settings', 'preferences', 'notifications', 'dark mode', 'language settings']}
      />
      {/* Header */}
      <div className="bg-card shadow-sm border-b border-border p-4 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mr-3"
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Language & Region
            </CardTitle>
            <CardDescription>
              Choose your preferred language for the app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">App Language</Label>
                <Select value={localLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                    <SelectItem value="mr">मराठी (Marathi)</SelectItem>
                    <SelectItem value="gu">ગુજરાતી (Gujarati)</SelectItem>
                    <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                    <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                    <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                    <SelectItem value="kn">ಕನ್ನಡ (Kannada)</SelectItem>
                    <SelectItem value="ml">മലയാളം (Malayalam)</SelectItem>
                    <SelectItem value="pa">ਪੰਜਾਬੀ (Punjabi)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize how the app looks and feels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    Dark Mode
                  </Label>
                  <p className="text-sm text-gray-500">
                    Toggle between light and dark themes
                  </p>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={handleThemeToggle}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Manage your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>General Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive notifications about posts and comments
                  </p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={(checked) => handleNotificationToggle("general", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Chat Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Get notified when you receive new messages
                  </p>
                </div>
                <Switch
                  checked={chatNotifications}
                  onCheckedChange={(checked) => handleNotificationToggle("chat", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive important updates via email
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={(checked) => handleNotificationToggle("email", checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Security
            </CardTitle>
            <CardDescription>
              Manage your privacy and security settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => toast({
                  title: "Coming Soon",
                  description: "Privacy settings will be available in the next update.",
                })}
              >
                <User className="mr-2 h-4 w-4" />
                Account Privacy
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => toast({
                  title: "Coming Soon",
                  description: "Data & Storage settings will be available soon.",
                })}
              >
                <Shield className="mr-2 h-4 w-4" />
                Data & Storage
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* About Section */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
            <CardDescription>
              App information and support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Version: 1.0.0</p>
              <p>© 2024 Qbuyse. All rights reserved.</p>
              <Button 
                variant="link" 
                className="p-0 h-auto text-sm text-blue-600"
                onClick={() => navigate("/terms")}
              >
                Terms & Conditions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;