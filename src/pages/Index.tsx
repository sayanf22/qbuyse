
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from "@/components/LoadingSpinner";

const Index = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // User is authenticated, redirect to home
          navigate("/", { replace: true });
        } else {
          // User is not authenticated, redirect to auth page
          navigate("/auth", { replace: true });
        }
      } catch (error) {
        console.error("Auth check error:", error);
        // On error, redirect to auth page
        navigate("/auth", { replace: true });
      } finally {
        setIsChecking(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  if (isChecking) {
    return <LoadingSpinner />;
  }

  return null;
};

export default Index;
