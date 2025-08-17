import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "signup";
}

export const AuthModal = ({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<"checking" | "available" | "taken" | "invalid" | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];

  // Username validation with debouncing
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (username.length >= 3) {
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(username)) {
          setUsernameStatus("invalid");
          return;
        }

        setIsCheckingUsername(true);
        setUsernameStatus("checking");
        
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("id")
            .eq("username", username.toLowerCase())
            .single();

          if (error && error.code !== "PGRST116") {
            console.error("Error checking username:", error);
            setUsernameStatus(null);
            return;
          }

          if (data) {
            setUsernameStatus("taken");
          } else {
            setUsernameStatus("available");
          }
        } catch (error) {
          console.error("Username check error:", error);
          setUsernameStatus(null);
        } finally {
          setIsCheckingUsername(false);
        }
      } else if (username.length > 0) {
        setUsernameStatus("invalid");
      } else {
        setUsernameStatus(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSignUp = async () => {
    if (!email || !password || !fullName || !username || !selectedState || !agreeToTerms) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and agree to terms",
        variant: "destructive",
      });
      return;
    }

    if (username.length < 3 || username.length > 20) {
      toast({
        title: "Error",
        description: "Username must be 3-20 characters long",
        variant: "destructive",
      });
      return;
    }

    if (usernameStatus === "taken") {
      toast({
        title: "Error",
        description: "Username is already taken. Please choose a different one.",
        variant: "destructive",
      });
      return;
    }

    if (usernameStatus === "invalid") {
      toast({
        title: "Error",
        description: "Username must contain only letters, numbers, and underscores.",
        variant: "destructive",
      });
      return;
    }

    if (usernameStatus !== "available") {
      toast({
        title: "Error",
        description: "Please wait for username validation to complete.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            username: username,
            state: selectedState,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
        onClose();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setUsername("");
    setSelectedState("");
    setAgreeToTerms(false);
    setLoading(false);
    setShowPassword(false);
    setUsernameStatus(null);
    setIsCheckingUsername(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold text-foreground">
            Please login or sign up to continue
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted">
            <TabsTrigger value="login" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              Login
            </TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-foreground">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background border-border text-foreground focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-foreground">Password</Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background border-border text-foreground focus:border-teal-500 focus:ring-teal-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <Button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 mt-6 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="signup-name" className="text-foreground">Full Name</Label>
              <Input
                id="signup-name"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-background border-border text-foreground focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="signup-username" className="text-gray-700">Username</Label>
              <div className="relative">
                <Input
                  id="signup-username"
                  type="text"
                  placeholder="your_username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className={`bg-white text-gray-900 focus:border-teal-500 focus:ring-teal-500 pl-8 pr-10 ${
                    usernameStatus === "taken" || usernameStatus === "invalid"
                      ? "border-red-300"
                      : usernameStatus === "available"
                      ? "border-green-300"
                      : "border-gray-300"
                  }`}
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">@</span>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isCheckingUsername && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
                  {usernameStatus === "available" && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {(usernameStatus === "taken" || usernameStatus === "invalid") && <XCircle className="h-4 w-4 text-red-500" />}
                </div>
              </div>
              <div className="text-xs">
                <p className="text-gray-500">3-20 characters, letters, numbers, and underscores only</p>
                {usernameStatus === "taken" && (
                  <p className="text-red-500 mt-1">Username is already taken</p>
                )}
                {usernameStatus === "invalid" && (
                  <p className="text-red-500 mt-1">Invalid username format</p>
                )}
                {usernameStatus === "available" && (
                  <p className="text-green-500 mt-1">Username is available</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email" className="text-gray-700">Email</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white border-gray-300 text-gray-900 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="signup-password" className="text-gray-700">Password</Label>
              <div className="relative">
                <Input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white border-gray-300 text-gray-900 focus:border-teal-500 focus:ring-teal-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-state" className="text-gray-700">State</Label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-teal-500 focus:ring-teal-500">
                  <SelectValue placeholder="Select your state" />
                </SelectTrigger>
                <SelectContent className="max-h-48 overflow-y-auto">
                  {indianStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="terms" 
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                className="border-gray-300 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
              />
              <Label htmlFor="terms" className="text-sm text-gray-700">
                I agree to the{" "}
                <a href="/terms" className="text-teal-500 hover:text-teal-600 underline" target="_blank">
                  Terms and Conditions
                </a>
                {" "}and{" "}
                <a href="/privacy" className="text-teal-500 hover:text-teal-600 underline" target="_blank">
                  Privacy Policy
                </a>
              </Label>
            </div>

            <Button
              onClick={handleSignUp}
              disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white"
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-500 mb-3">OR CONTINUE WITH</p>
            <Button
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={async () => {
                setLoading(true);
                try {
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: `${window.location.origin}/`
                    }
                  });
                  if (error) throw error;
                } catch (error: any) {
                  toast({
                    title: "Error",
                    description: error.message,
                    variant: "destructive",
                  });
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  onClick={() => {
                    // Switch to login tab - this would be handled by parent component
                  }}
                  className="text-teal-500 hover:text-teal-600 font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};