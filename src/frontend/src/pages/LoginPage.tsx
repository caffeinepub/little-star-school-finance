import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { backendInterface } from "../backend.d";
import { useActor } from "../hooks/useActor";

export default function LoginPage() {
  const navigate = useNavigate();
  const { actor, isFetching } = useActor();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) {
      toast.error("System not ready. Please wait.");
      return;
    }
    if (!username.trim() || !password.trim()) {
      toast.error("Please enter username and password.");
      return;
    }
    setIsLoading(true);
    try {
      const typedActor = actor as unknown as backendInterface;
      const success = await typedActor.login(username.trim(), password.trim());
      if (success) {
        localStorage.setItem("schoolAdminLoggedIn", "true");
        navigate({ to: "/" });
      } else {
        toast.error("Invalid credentials. Use admin / admin123");
      }
    } catch (_err) {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, #0f2444 0%, #163A73 50%, #1B4585 100%)",
      }}
    >
      <div className="w-full max-w-md animate-fade-in">
        <div
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
          style={{ boxShadow: "0 24px 64px rgba(15,36,68,0.5)" }}
        >
          {/* Header */}
          <div
            className="px-8 pt-10 pb-8 text-center"
            style={{
              background: "linear-gradient(180deg, #163A73 0%, #1B4585 100%)",
            }}
          >
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/20 shadow-lg">
                <img
                  src="/assets/generated/school-logo-transparent.dim_120x120.png"
                  alt="School Logo"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <h1 className="text-white font-bold text-xl tracking-wide leading-tight">
              LITTLE STAR H. S. SCHOOL
            </h1>
            <p className="text-blue-200 text-sm mt-1 tracking-widest uppercase">
              Tengakhat
            </p>
            <p className="text-blue-300 text-xs mt-3 opacity-80">
              Admin Finance Portal
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="px-8 py-8 space-y-5">
            <div className="space-y-1.5">
              <Label
                htmlFor="username"
                className="text-sm font-semibold text-foreground"
              >
                Username
              </Label>
              <Input
                id="username"
                data-ocid="login.input"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading || isFetching}
                autoComplete="username"
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-sm font-semibold text-foreground"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  data-ocid="login.input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || isFetching}
                  autoComplete="current-password"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              data-ocid="login.primary_button"
              className="w-full h-11 font-semibold text-base mt-2"
              style={{
                background: "linear-gradient(135deg, #163A73 0%, #1B4585 100%)",
              }}
              disabled={isLoading || isFetching}
            >
              {isLoading || isFetching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isFetching ? "Initializing..." : "Signing in..."}
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            {isFetching && (
              <p
                className="text-center text-xs text-muted-foreground"
                data-ocid="login.loading_state"
              >
                Connecting to the system...
              </p>
            )}
          </form>
        </div>

        <p className="text-center text-blue-300/60 text-xs mt-6">
          &copy; {new Date().getFullYear()} Little Star H. S. School. All rights
          reserved.
        </p>
      </div>
    </div>
  );
}
