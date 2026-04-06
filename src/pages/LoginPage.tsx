import { useState } from "react";
import { Link } from "react-router-dom";
import { Crown, Mail, Phone, ArrowRight } from "lucide-react";
import mishiLogo from "@/assets/mishi-logo.jpg";

const LoginPage = () => {
  const [method, setMethod] = useState<"otp" | "google">("otp");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpSent(true);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    // Will integrate with Lovable Cloud auth
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-lavender/40 via-background to-teal-light/30 items-center justify-center p-12">
        <div className="text-center max-w-md">
          <Crown className="w-16 h-16 text-primary mx-auto mb-8 animate-float" />
          <h2 className="font-display text-4xl font-bold text-foreground mb-4">
            Welcome to the <span className="gold-text">Empire</span>
          </h2>
          <p className="font-body text-muted-foreground leading-relaxed">
            Join the MISHI family. Access exclusive collections, track your royal orders, 
            and save your custom designs. The empire awaits.
          </p>
          <div className="mt-8 flex items-center justify-center gap-6">
            {["925 Hallmarked", "Lab Certified", "100% Prepaid"].map((badge) => (
              <span key={badge} className="font-body text-[10px] tracking-wider uppercase text-muted-foreground px-3 py-1.5 rounded-full border border-border/50">
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <img src={mishiLogo} alt="MISHI" className="h-10 w-auto" />
          </Link>

          <h1 className="font-display text-2xl font-bold text-foreground mb-1">Sign In</h1>
          <p className="font-body text-sm text-muted-foreground mb-8">Enter the Royal Court</p>

          {/* Method Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMethod("otp")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md font-body text-xs font-semibold tracking-wider uppercase transition-colors ${
                method === "otp" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              <Phone className="w-3.5 h-3.5" /> Phone OTP
            </button>
            <button
              onClick={() => setMethod("google")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md font-body text-xs font-semibold tracking-wider uppercase transition-colors ${
                method === "google" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              <Mail className="w-3.5 h-3.5" /> Google
            </button>
          </div>

          {method === "otp" ? (
            !otpSent ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="font-body text-xs font-semibold tracking-wider uppercase text-foreground/70 mb-2 block">Phone Number</label>
                  <div className="flex">
                    <span className="px-4 py-3 bg-muted border border-r-0 border-border rounded-l-md font-body text-sm text-muted-foreground">+91</span>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="flex-1 px-4 py-3 border border-border rounded-r-md font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="XXXXX XXXXX"
                      maxLength={10}
                    />
                  </div>
                </div>
                <button type="submit" className="w-full py-3.5 bg-primary text-primary-foreground font-body text-sm font-bold tracking-widest uppercase rounded-md shimmer hover:scale-[1.02] transition-transform">
                  Send OTP <ArrowRight className="w-4 h-4 inline ml-1" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <p className="font-body text-sm text-muted-foreground text-center mb-4">
                  Enter the 6-digit code sent to +91 {phone}
                </p>
                <div className="flex justify-center gap-2">
                  {[...Array(6)].map((_, i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength={1}
                      value={otp[i] || ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        const newOtp = otp.split("");
                        newOtp[i] = val;
                        setOtp(newOtp.join(""));
                        if (val && e.target.nextElementSibling) {
                          (e.target.nextElementSibling as HTMLInputElement).focus();
                        }
                      }}
                      className="w-11 h-14 text-center border border-border rounded-md font-display text-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  ))}
                </div>
                <button type="submit" className="w-full py-3.5 bg-primary text-primary-foreground font-body text-sm font-bold tracking-widest uppercase rounded-md shimmer">
                  Verify & Enter
                </button>
                <button type="button" onClick={() => setOtpSent(false)} className="w-full font-body text-xs text-muted-foreground hover:text-foreground transition-colors">
                  ← Change number
                </button>
              </form>
            )
          ) : (
            <div className="space-y-4">
              <button className="w-full flex items-center justify-center gap-3 py-3.5 border border-border rounded-md font-body text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </button>
              <p className="font-body text-[10px] text-muted-foreground text-center">
                One-tap sign in with your Google account
              </p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-border/50 text-center">
            <p className="font-body text-xs text-muted-foreground">
              By signing in, you agree to our{" "}
              <Link to="/policies" className="text-foreground hover:underline">Policies</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
