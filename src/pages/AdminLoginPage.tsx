import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Lock, Eye, EyeOff, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import mishiLogo from "@/assets/mishi-logo.jpg";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Invalid credentials. The empire does not recognize you.");
      setLoading(false);
      return;
    }

    // Check admin role
    const { data: hasAdminRole } = await supabase.rpc('has_role', {
      _user_id: data.user.id,
      _role: 'admin'
    });

    if (!hasAdminRole) {
      setError("Access denied. You do not have admin privileges.");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    toast({ title: "Welcome, Your Majesty 👑", description: "God Mode activated." });
    navigate("/admin/dashboard");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={mishiLogo} alt="MISHI" className="h-14 mx-auto mb-4 brightness-[10]" />
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="font-display text-2xl font-bold text-background">Command Center</h1>
          </div>
          <p className="font-body text-xs text-background/40 tracking-wider uppercase">God Mode Access</p>
        </div>

        <div className="bg-background/5 backdrop-blur border border-background/10 rounded-xl p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="font-body text-xs font-semibold tracking-wider uppercase text-background/50 mb-2 block">Admin Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-background/10 border border-background/10 rounded-md font-body text-sm text-background placeholder:text-background/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="admin@mishiofficial.com"
              />
            </div>
            <div>
              <label className="font-body text-xs font-semibold tracking-wider uppercase text-background/50 mb-2 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-background/10 border border-background/10 rounded-md font-body text-sm text-background placeholder:text-background/30 focus:outline-none focus:ring-2 focus:ring-primary/50 pr-12"
                  placeholder="Enter Password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-background/30">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <p className="font-body text-xs text-destructive">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-3.5 bg-primary text-primary-foreground font-body text-sm font-bold tracking-widest uppercase rounded-md shimmer hover:scale-[1.02] transition-transform disabled:opacity-50">
              <Lock className="w-4 h-4 inline mr-2" /> {loading ? "Verifying..." : "Enter Command Center"}
            </button>
          </form>
        </div>
        <p className="text-center font-body text-[10px] text-background/20 mt-6">Protected by Royal Authentication</p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
