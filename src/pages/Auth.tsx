import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, EyeOff, Loader2, GraduationCap, User } from "lucide-react";

// Admin signs in with a username instead of an email. Internally we map the
// username to a synthetic email address stored in auth.users.
const ADMIN_USERNAME_TO_EMAIL: Record<string, string> = {
  "buddy@meaw": "buddy@meaw.local",
};

export default function Auth() {
  const [params] = useSearchParams();
  const initialRole = params.get("role") === "admin" ? "admin" : "student";
  const [loginRole, setLoginRole] = useState<"student" | "admin">(initialRole);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let loginEmail = email;
      if (loginRole === "admin") {
        const key = username.trim().toLowerCase();
        loginEmail = ADMIN_USERNAME_TO_EMAIL[key] ?? `${key.replace(/[^a-z0-9._-]/g, "_")}@meaw.local`;
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
      if (error) throw error;

      // Verify the account matches the selected login role
      if (data.user) {
        const { data: roleRow } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .single();
        const actualRole = (roleRow?.role as "student" | "admin") ?? "student";
        if (actualRole !== loginRole) {
          await supabase.auth.signOut();
          throw new Error(
            loginRole === "admin"
              ? "This account is not an admin. Use Student Sign In instead."
              : "This is an admin account. Use Admin Sign In instead.",
          );
        }
        navigate(actualRole === "admin" ? "/admin" : "/dashboard");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
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
              {isAdmin ? "Admin Sign In" : "Student Sign In"}
            </CardTitle>
            <CardDescription>
              {isAdmin
                ? "Restricted access for exam administrators"
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
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Buddy@Meaw" autoComplete="username" required className="pl-9" />
                  </div>
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
              <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In as {isAdmin ? "Admin" : "Student"}
              </Button>
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
