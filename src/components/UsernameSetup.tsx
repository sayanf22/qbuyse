import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

interface UsernameSetupProps {
  userId: string;
  onComplete: () => void;
}

const UsernameSetup = ({ userId, onComplete }: UsernameSetupProps) => {
  const [username, setUsername] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  const updateUsernameMutation = useMutation({
    mutationFn: async (username: string) => {
      // Check if username already exists
      const { data: existingUser, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingUser) {
        throw new Error("Username already exists");
      }

      // Update user profile with username
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ username })
        .eq("id", userId);

      if (updateError) throw updateError;

      return username;
    },
    onSuccess: () => {
      toast({
        title: "Username set successfully",
        description: "Your username has been created.",
      });
      onComplete();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to set username",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      // Validate username format
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(username)) {
        toast({
          title: "Invalid username",
          description: "Username must be 3-20 characters long and contain only letters, numbers, and underscores.",
          variant: "destructive",
        });
        return;
      }
      updateUsernameMutation.mutate(username.toLowerCase());
    }
  };

  const checkUsernameAvailability = async (value: string) => {
    if (value.length < 3) return;
    
    setIsChecking(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", value.toLowerCase())
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking username:", error);
        return;
      }

      if (data) {
        toast({
          title: "Username taken",
          description: "This username is already taken.",
          variant: "destructive",
        });
      }
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>Create Your Username</CardTitle>
          <CardDescription>
            Choose a unique username for your profile. This will be displayed below your name.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">@</span>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={() => checkUsernameAvailability(username)}
                  placeholder="your_username"
                  className="pl-8"
                  required
                  disabled={updateUsernameMutation.isPending}
                />
              </div>
              <p className="text-xs text-gray-500">
                3-20 characters, letters, numbers, and underscores only
              </p>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={updateUsernameMutation.isPending || isChecking || username.length < 3}
            >
              {updateUsernameMutation.isPending ? "Creating..." : "Create Username"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsernameSetup;