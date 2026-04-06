import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Lock, Eye, EyeOff, Crown } from "lucide-react";
import mishiLogo from "@/assets/mishi-logo.jpg";

const ADMIN_ACCOUNTS = [
  { email: "mishiofficial1701@gmail.com", code: "MISHI1701", name: "The King", role: "Founder" },
  { email: "shrimatiji@mishiofficial.com", code: "SHRIMATI1701", name: "Shrimati Ji", role: "Co-Founder" },
];

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [masterCode, setMasterCode] = useState("");
  const [twoFACode, setTwoFACode] = useState("");
  const [step, setStep] = useState<"credentials" | "2fa">("credentials");
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    const admin = ADMIN_ACCOUNTS.find(a => a.email === email && a.code === masterCode);
    if (admin) {
      setStep("2fa");
      setError("");
    } else {
      setError("Invalid credentials. The empire does not recognize you.");
    }
  };

  const handle2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFACode.length === 6) {
      const admin = ADMIN_ACCOUNTS.find(a => a.email === email);
      sessionStorage.setItem("mishi_admin", JSON.stringify({ email, name: admin?.name, role: admin?.role }));
      navigate("/admin/dashboard");
    } else {
      setError("Invalid 2FA code. Enter the 6-digit code from your authenticator.");
    }
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
          {step === "credentials" ? (
            <form onSubmit={handleCredentials} className="space-y-5">
              <div>
                <label className="font-body text-xs font-semibold tracking-wider uppercase text-background/50 mb-2 block">Admin Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-background/10 border border-background/10 rounded-md font-body text-sm text-background placeholder:text-background/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="mishiofficial1701@gmail.com"
                />
              </div>
              <div>
                <label className="font-body text-xs font-semibold tracking-wider uppercase text-background/50 mb-2 block">Master Code</label>
                <div className="relative">
                  <input
                    type={showCode ? "text" : "password"}
                    required
                    value={masterCode}
                    onChange={(e) => setMasterCode(e.target.value)}
                    className="w-full px-4 py-3 bg-background/10 border border-background/10 rounded-md font-body text-sm text-background placeholder:text-background/30 focus:outline-none focus:ring-2 focus:ring-primary/50 pr-12"
                    placeholder="Enter Master Code"
                  />
                  <button type="button" onClick={() => setShowCode(!showCode)} className="absolute right-3 top-1/2 -translate-y-1/2 text-background/30">
                    {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {error && <p className="font-body text-xs text-destructive">{error}</p>}
              <button type="submit" className="w-full py-3.5 bg-primary text-primary-foreground font-body text-sm font-bold tracking-widest uppercase rounded-md shimmer hover:scale-[1.02] transition-transform">
                <Lock className="w-4 h-4 inline mr-2" /> Verify Identity
              </button>
            </form>
          ) : (
            <form onSubmit={handle2FA} className="space-y-5">
              <div className="text-center mb-4">
                <Lock className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-body text-sm text-background/60">Enter the 6-digit code from your Authenticator App</p>
              </div>
              <div className="flex justify-center gap-2">
                {[...Array(6)].map((_, i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    value={twoFACode[i] || ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      const newCode = twoFACode.split("");
                      newCode[i] = val;
                      setTwoFACode(newCode.join(""));
                      if (val && e.target.nextElementSibling) {
                        (e.target.nextElementSibling as HTMLInputElement).focus();
                      }
                    }}
                    className="w-11 h-14 text-center bg-background/10 border border-background/10 rounded-md font-display text-xl text-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                ))}
              </div>
              {error && <p className="font-body text-xs text-destructive text-center">{error}</p>}
              <button type="submit" className="w-full py-3.5 bg-primary text-primary-foreground font-body text-sm font-bold tracking-widest uppercase rounded-md shimmer">
                <Crown className="w-4 h-4 inline mr-2" /> Enter the Command Center
              </button>
              <button type="button" onClick={() => { setStep("credentials"); setTwoFACode(""); setError(""); }} className="w-full font-body text-xs text-background/30 hover:text-background/50 transition-colors">
                ← Back to credentials
              </button>
            </form>
          )}
        </div>
        <p className="text-center font-body text-[10px] text-background/20 mt-6">Protected by Royal 2FA Encryption</p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
