import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Only accessible when NOT logged in — redirects to /projects if already authenticated
export default function PublicRoute({ children }) {
  const { authenticated } = useAuth();
  if (authenticated) return <Navigate to="/projects" replace />;
  return children;
}
