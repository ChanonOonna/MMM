import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useAuth } from "./AuthContext";

export function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: string[] }) {
  const { status, user } = useAuth();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/auth" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}

// Keeps an already-logged-in user off /auth (e.g. after pressing Back). Also the single
// place that decides where a freshly authenticated user lands, so login/register never
// need to navigate imperatively themselves (avoids racing this redirect).
export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { status, justRegistered } = useAuth();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "authenticated") {
    return <Navigate to={justRegistered ? "/onboarding" : "/app"} replace />;
  }

  return <>{children}</>;
}
