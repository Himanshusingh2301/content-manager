import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import SectionDetail from "./pages/SectionDetail";
import Compare from "./pages/Compare";
import History from "./pages/History";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Root → Projects (if not logged in, ProtectedRoute sends to /login) */}
          <Route path="/" element={<ProtectedRoute><Projects /></ProtectedRoute>} />

          {/* Login — only when not authenticated */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

          {/* Project & section pages */}
          <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
          <Route path="/sections/:id" element={<ProtectedRoute><SectionDetail /></ProtectedRoute>} />
          <Route path="/sections/:id/compare" element={<ProtectedRoute><Compare /></ProtectedRoute>} />
          <Route path="/sections/:id/history/:variantId" element={<ProtectedRoute><History /></ProtectedRoute>} />

          {/* Catch-all → root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
