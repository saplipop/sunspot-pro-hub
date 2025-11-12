import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && user.role !== "admin") {
    // Non-admin trying to access admin route - redirect to their projects
    return <Navigate to="/my-projects" replace />;
  }

  return <>{children}</>;
};

// Higher-order component for role-based access control
export function withRoleAccess<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: "admin" | "employee"
) {
  return function ProtectedComponent(props: P) {
    const { user } = useAuth();

    if (requiredRole && user?.role !== requiredRole) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-destructive mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have permission to access this resource
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
