import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, EyeOff, Loader2, GraduationCap } from "lucide-react";

const ADMIN_EMAIL = "admin@exameye.com";

export default function Auth() {
  const [params] = useSearchParams();
  const initialRole = params.get("role") === "admin" ? "admin" : "student";
  const [loginRole, setLoginRole] = useState<"student" | "admin">(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loadingAction, setLoadingAction] = useState<"signin" | "signup" | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const ensureAdminRole = async () => {
    const { data, error } = await supabase.rpc("bootstrap_exam_admin" as never);
    if (error) throw error;
    if (!data) throw new Error("This account is not allowed to become an admin.");
  };

  const verifySelectedRole = async (userId: string) => {
    const { data: roleRow, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", loginRole)
      .maybeSingle();
    if (roleError) throw roleError;
    if (!roleRow) {
      await supabase.auth.signOut();
      throw new Error(
        loginRole === "admin"
          ? "This account is not an admin. Use Sign Up as Admin once, then sign in again."
          : "This is an admin account. Use Admin Sign In instead.",
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction("signin");
    try {
      const loginEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
      if (error) throw error;

      if (data.user) {
        if (loginRole === "admin") await ensureAdminRole();
        await verifySelectedRole(data.user.id);
        navigate(loginRole === "admin" ? "/admin" : "/dashboard");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleAdminSignUp = async () => {
    const adminEmail = email.trim().toLowerCase();
    if (adminEmail !== ADMIN_EMAIL) {
      toast({ title: "Use the admin email", description: `Enter ${ADMIN_EMAIL} to create the admin account.`, variant: "destructive" });
      return;
    }

    setLoadingAction("signup");
    try {
      const { data, error } = await supabase.auth.signUp({
        email: adminEmail,
        password,
        options: { data: { full_name: "ExamEye Admin" } },
      });
      if (error) throw error;
      if (!data.session || !data.user) {
        toast({ title: "Admin account created", description: "Now sign in with the same admin credentials." });
        return;
      }
      await ensureAdminRole();
      await verifySelectedRole(data.user.id);
      navigate("/admin");
    } catch (err: any) {
      toast({ title: "Signup failed", description: err.message, variant: "destructive" });
    } finally {
      setLoadingAction(null);
    }
  };

  const isAdmin = loginRole === "admin";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="gradient-primary p-3 rounded-xl glow-primary">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">ExamEye</h1>
            <p className="text-sm text-muted-foreground">Secure Exam Platform</p>
          </div>
        </div>

        <Card className="glass-card">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              {isAdmin ? "Admin Login" : "Student Sign In"}
            </CardTitle>
            <CardDescription>
              {isAdmin
                ? "Sign in with your admin credentials"
                : "Use credentials provided by your administrator"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Role toggle */}
            <div className="grid grid-cols-2 gap-2 mb-6 p-1 rounded-lg bg-muted/50">
              <button
                type="button"
                onClick={() => setLoginRole("student")}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  !isAdmin ? "gradient-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <GraduationCap className="h-4 w-4" /> Student
              </button>
              <button
                type="button"
                onClick={() => setLoginRole("admin")}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  isAdmin ? "gradient-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Shield className="h-4 w-4" /> Admin
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isAdmin ? (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={ADMIN_EMAIL} autoComplete="email" required />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={!!loadingAction}>
                {loadingAction === "signin" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In as {isAdmin ? "Admin" : "Student"}
              </Button>
              {isAdmin && (
                <Button type="button" variant="outline" className="w-full border-primary/50" onClick={handleAdminSignUp} disabled={!!loadingAction}>
                  {loadingAction === "signup" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign Up as Admin
                </Button>
              )}
            </form>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              {isAdmin
                ? "Admin accounts are provisioned manually."
                : "Student signup is disabled. Contact your administrator for credentials."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
