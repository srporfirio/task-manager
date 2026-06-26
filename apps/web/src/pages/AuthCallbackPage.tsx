import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Finalizando login...");

  useEffect(() => {
    let mounted = true;

    async function finishAuth() {
      const { error } = await supabase.auth.getSession();
      if (!mounted) return;

      if (error) {
        setMessage(error.message);
        return;
      }

      navigate("/", { replace: true });
    }

    void finishAuth();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center text-slate-600">
      {message}
    </div>
  );
}
