import Layout from "./Layout.jsx";
import Studio from "./Studio";
import Projects from "./Projects";
import Workspace from "./Workspace";
import Settings from "./Settings";
import AdminPanel from "./AdminPanel";
import Landing from "./Landing";
import Pricing from "./Pricing";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { auth } from '@/config/firebase';

const PAGES = {
  Studio,
  Projects,
  Workspace,
  Settings,
  AdminPanel,
  Landing,
  Pricing,
};

function RequireAuth({ children }) {
  const location = useLocation();
  const isAuthenticated = auth.currentUser;

  if (!isAuthenticated) {
    // Redirect them to the landing page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
  const location = useLocation();
  
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/app/pricing" element={<Pricing />} />
      
      {/* Protected routes */}
      <Route path="/app" element={<Layout />}>
        <Route index element={<Navigate to="/app/studio" replace />} />
        <Route path="studio" element={
          <RequireAuth>
            <Studio />
          </RequireAuth>
        } />
        <Route path="projects" element={
          <RequireAuth>
            <Projects />
          </RequireAuth>
        } />
        <Route path="workspace" element={
          <RequireAuth>
            <Workspace />
          </RequireAuth>
        } />
        <Route path="settings" element={
          <RequireAuth>
            <Settings />
          </RequireAuth>
        } />
        <Route path="admin" element={
          <RequireAuth>
            <AdminPanel />
          </RequireAuth>
        } />
      </Route>

      {/* Catch all - redirect to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function Pages() {
  return (
    <Router>
      <PagesContent />
    </Router>
  );
}