import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import './App.css'
import { Toaster } from "@/components/ui/toaster"

// דפים
import Landing from './pages/Landing';
import Studio from './pages/Studio';
import Projects from './pages/Projects';
import Settings from './pages/Settings';
import AdminPanel from './pages/AdminPanel';
import Layout from './pages/Layout';
import Pricing from './pages/Pricing';

// קומפוננטת הגנה על נתיבים מאובטחים
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* דף נחיתה - נגיש לכולם */}
        <Route path="/" element={<Landing />} />

        {/* נתיבים מאובטחים - רק למשתמשים מחוברים */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/app/studio" replace />} />
          <Route path="studio" element={<Studio />} />
          <Route path="projects" element={<Projects />} />
          <Route path="settings" element={<Settings />} />
          <Route path="admin" element={<AdminPanel />} />
          <Route path="pricing" element={<Pricing />} />
        </Route>

        {/* הפניה מחדש לדף הבית עבור נתיבים לא קיימים */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </Router>
  )
}

export default App 