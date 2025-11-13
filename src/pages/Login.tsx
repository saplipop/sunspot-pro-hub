import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";


const Login = () => {
  const { login } = useAuth();
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      const success = await login(form.username, form.password);
      if (!success) {
        setError("Invalid email or password. Try 'admin@example.com'/'Admin@123' or 'employee@example.com'/'Employee@123'");
      }
    } catch (error) {
      setError("Login failed. Please try again.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const validateForm = () => {
    if (!form.username || !form.password) {
      setError("Please enter both username and password.");
      return false;
    }
    return true;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md shadow-2xl border-none animate-fade-in">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-primary to-accent p-4 rounded-2xl shadow-lg">
              <Sun className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-heading font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Solar Project Tracking
            </CardTitle>
            <CardDescription className="text-base mt-2">Sign in to manage your solar projects</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive" className="animate-scale-in">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">Email</Label>
              <Input
                id="username"
                name="username"
                type="email"
                placeholder="admin@example.com"
                value={form.username}
                onChange={handleChange}
                className="h-11 transition-all focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter password"
                value={form.password}
                onChange={handleChange}
                className="h-11 transition-all focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg border border-border">
              <p className="font-semibold mb-2 text-foreground">Demo accounts:</p>
              <p className="flex items-center justify-between">
                <span>Admin:</span>
                <code className="text-xs bg-background px-2 py-1 rounded">admin@example.com / Admin@123</code>
              </p>
              <p className="flex items-center justify-between mt-1">
                <span>Employee:</span>
                <code className="text-xs bg-background px-2 py-1 rounded">employee@example.com / Employee@123</code>
              </p>
            </div>

            <Button type="submit" className="w-full h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all">
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
